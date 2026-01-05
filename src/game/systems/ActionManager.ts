import { useGameStore } from '../state/store';
import { db } from '../../config/firebase';
import { ref, update, increment, set, get as dbGet } from 'firebase/database';
import type { SimulationPlayer } from '../types/simulation';
import { calculateMarketPrice, INITIAL_MARKET } from '../data/market';

class ActionManager {
    private roomId = 'default_room';

    public async initializeUser(user: SimulationPlayer) {
        const userRef = ref(db, `rooms/${this.roomId}/players/${user.id}`);
        await set(userRef, user);
        console.log(`[ActionManager] Character ${user.name} initialized in Firebase`);

        // Also ensure market is initialized if it doesn't exist
        const marketRef = ref(db, `rooms/${this.roomId}/market`);
        const snapshot = await dbGet(marketRef);
        if (!snapshot.exists()) {
            console.log("[ActionManager] Market missing in Firebase, initializing...");
            await update(marketRef, INITIAL_MARKET);
        } else {
            console.log("[ActionManager] Market already exists in Firebase.");
        }

    }

    public async updateResources(playerId: string, resources: Record<string, number>) {
        const playerRef = ref(db, `rooms/${this.roomId}/players/${playerId}/resources`);

        const updates: any = {};
        Object.entries(resources).forEach(([key, val]) => {
            updates[key] = increment(val);
        });

        await update(playerRef, updates);
    }

    public setRoomId(id: string) {
        this.roomId = id;
    }

    public async trade(resource: string, amount: number, isBuying: boolean) {
        const store = useGameStore.getState();
        const user = store.user;
        const marketItem = store.market[resource];

        if (!user || !marketItem) {
            console.error('[TradeError] Missing data:', { user: !!user, marketItem: !!marketItem });
            return;
        }

        const currentPrice = calculateMarketPrice(marketItem.price, marketItem.stock, marketItem.maxStock);

        // 1. Calculate changes
        const goldChange = isBuying ? -(currentPrice * amount) : (currentPrice * 0.8 * amount);
        const resChange = isBuying ? amount : -amount;
        const stockChange = isBuying ? -amount : amount;

        console.log(`[ActionManager] Attempting trade: ${resource}, gold: ${goldChange}, stock: ${stockChange}`);

        // 2. Perform Atomic Multi-path Update
        const updates: any = {};
        updates[`rooms/${this.roomId}/players/${user.id}/resources/gold`] = increment(goldChange);
        updates[`rooms/${this.roomId}/players/${user.id}/resources/${resource}`] = increment(resChange);
        updates[`rooms/${this.roomId}/market/${resource}/stock`] = increment(stockChange);

        try {
            await update(ref(db), updates);
            // No local set needed, the Firebase onValue listener will handle the sync
        } catch (error) {
            console.error('[TradeError] Atomic update failed:', error);
        }
    }

    public async gather(resourceKey: string, score: number) {
        const store = useGameStore.getState();
        const user = store.user;
        if (!user) return;

        // Configuration
        const configs: Record<string, { cost: number, base: number, icon: string, name: string }> = {
            wood: { cost: 10, base: 10, icon: '🪵', name: 'Ved' },
            stone: { cost: 12, base: 6, icon: '🪨', name: 'Stein' },
            grain: { cost: 8, base: 15, icon: '🌾', name: 'Korn' },
            wool: { cost: 15, base: 4, icon: '🧶', name: 'Ull' },
            honey: { cost: 10, base: 5, icon: '🍯', name: 'Honning' },
            meat: { cost: 20, base: 3, icon: '🍗', name: 'Kjøtt' },
            egg: { cost: 5, base: 8, icon: '🥚', name: 'Egg' },
            iron_ore: { cost: 18, base: 4, icon: '🪨', name: 'Jernmalm' }
        };

        const config = configs[resourceKey] || configs.wood;
        const staminaCost = -(config.cost);
        const yieldAmount = Math.ceil(config.base * (0.5 + score));

        console.log(`[ActionManager] Gathered ${yieldAmount} ${resourceKey}`);

        // Inventory Logic: Find stack or empty slot
        // NOTE: We read from local user state, but write to Firebase atomics
        const inventory = user.inventory || [];
        const existingItemIndex = inventory.findIndex(i => i.templateId === resourceKey);

        const updates: any = {};
        updates[`rooms/${this.roomId}/players/${user.id}/resources/${resourceKey}`] = increment(yieldAmount);
        updates[`rooms/${this.roomId}/players/${user.id}/status/stamina`] = increment(staminaCost);

        if (existingItemIndex > -1) {
            // Stack existing
            updates[`rooms/${this.roomId}/players/${user.id}/inventory/${existingItemIndex}/amount`] = increment(yieldAmount);
        } else {
            // Find first free slot (0-24)
            const usedSlots = new Set(inventory.map(i => i.slot));
            let freeSlot = -1;
            for (let i = 0; i < 25; i++) {
                if (!usedSlots.has(i)) {
                    freeSlot = i;
                    break;
                }
            }

            if (freeSlot > -1) {
                const newSlotIndex = inventory.length;
                const newItem = {
                    id: `${resourceKey}_${Date.now()}`,
                    templateId: resourceKey,
                    name: config.name,
                    icon: config.icon,
                    amount: yieldAmount,
                    slot: freeSlot,
                    type: 'RESOURCE',
                    rarity: 'COMMON'
                };
                updates[`rooms/${this.roomId}/players/${user.id}/inventory/${newSlotIndex}`] = newItem;
            } else {
                console.warn("[ActionManager] Inventory Full!");
            }
        }

        try {
            await update(ref(db), updates);
            useGameStore.getState().setInteraction(null); // Close UI
        } catch (error) {
            console.error('[GatherError] Update failed:', error);
        }
    }

    public async rest() {
        const user = useGameStore.getState().user;
        if (!user) return;

        const updates: any = {};
        updates[`rooms/${this.roomId}/players/${user.id}/status/stamina`] = increment(20);

        try {
            await update(ref(db), updates);
        } catch (error) {
            console.error('[RestError] Update failed:', error);
        }
    }

    public async eat(foodType: 'grain' | 'bread' | 'omelette' | 'meat' = 'bread') { // Changed default to bread if possible
        const user = useGameStore.getState().user;
        if (!user) return;

        const foodValues: Record<string, number> = {
            grain: 15,
            bread: 40,
            omelette: 60,
            meat: 30
        };

        if ((user.resources as any)[foodType] < 1) {
            console.warn(`[EatWarning] No ${foodType} available`);
            return;
        }

        const staminaGain = foodValues[foodType] || 15;

        const updates: any = {};
        updates[`rooms/${this.roomId}/players/${user.id}/resources/${foodType}`] = increment(-1);
        updates[`rooms/${this.roomId}/players/${user.id}/status/stamina`] = increment(staminaGain);

        try {
            await update(ref(db), updates);
        } catch (error) {
            console.error('[EatError] Update failed:', error);
        }
    }
}

export const gameActions = new ActionManager();


