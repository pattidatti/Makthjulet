import { create } from 'zustand';
import { db } from '../../config/firebase';
import { ref, onValue, update, onDisconnect, get as getDb } from 'firebase/database';
import type { SimulationPlayer, WorldState } from '../types/simulation';
import { INITIAL_MARKET } from '../data/market';
import type { MarketItem } from '../data/market';

interface GameStore {
    // State
    user: SimulationPlayer | null;
    world: WorldState;
    allPlayers: Record<string, SimulationPlayer>;
    isLoading: boolean;
    market: Record<string, MarketItem>;
    currentRoomId: string | null;
    activeInteraction: { type: string, targetId: string } | null;

    // Actions
    setUser: (user: SimulationPlayer | null) => void;
    setWorldState: (world: Partial<WorldState>) => void;
    setInteraction: (interaction: { type: string, targetId: string } | null) => void;
    syncWithFirebase: (roomId: string) => () => void;
    updateLocalPosition: (x: number, y: number) => Promise<void>;
    restoreCharacter: (roomId: string, charId: string, authUid: string) => Promise<boolean>;
}

export const useGameStore = create<GameStore>((set, get) => ({
    // Initial State
    user: null,
    world: {
        season: 'Spring',
        day: 1,
        weather: 'Clear'
    },
    allPlayers: {},
    isLoading: false,
    market: INITIAL_MARKET,
    currentRoomId: null,
    activeInteraction: null,

    // Actions
    setUser: (user) => set({ user }),
    setWorldState: (updates) => set((state) => ({
        world: { ...state.world, ...updates }
    })),
    setInteraction: (interaction) => set({ activeInteraction: interaction }),

    syncWithFirebase: (roomId) => {
        console.log(`[Store] Initializing sync for room: ${roomId}`);
        set({ currentRoomId: roomId });

        const roomRef = ref(db, `rooms/${roomId}`);
        const user = get().user;

        // Presence Cleanup (Remove self when disconnecting)
        // Presence System - Mark as online/offline instead of deleting
        if (user) {
            const playerRef = ref(db, `rooms/${roomId}/players/${user.id}`);

            // Set online status
            update(playerRef, { isOnline: true });

            // On disconnect, mark as offline (DO NOT DELETE)
            onDisconnect(playerRef).update({ isOnline: false }).catch(err => {
                console.error("[Store] Failed to setup onDisconnect:", err);
            });
        }

        // Attach listener
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                console.warn(`[Store] No data found for room: ${roomId}`);
                return;
            }

            console.log(`[Store] Received update for ${roomId}. Status:`, {
                hasPlayers: !!data.players,
                hasMarket: !!data.market
            });

            // Re-map current user if they are in the update
            const currentUser = get().user;
            let updatedUser = currentUser;
            if (currentUser && data.players?.[currentUser.id]) {
                updatedUser = data.players[currentUser.id];
            }

            // Sync all state at once to minimize React ripples
            set({
                world: data.world || get().world,
                allPlayers: data.players || {},
                market: data.market || get().market,
                user: updatedUser
            });
        }, (error) => {
            console.error(`[Store] Firebase sync error:`, error);
        });

        // Return a cleanup function that explicitly stops the listener
        return () => {
            console.log(`[Store] Detaching sync for room: ${roomId}`);
            unsubscribe();
        };
    },

    updateLocalPosition: async (x: number, y: number) => {
        const { user, currentRoomId } = get();
        if (!user || !currentRoomId) return;

        // Perform granular update to avoid overwriting bigger objects like inventory
        const playerPath = `rooms/${currentRoomId}/players/${user.id}`;
        await update(ref(db, playerPath), {
            'position/x': Math.round(x),
            'position/y': Math.round(y),
            'lastActive': Date.now()
        });

        // Optimistically update local state to avoid stutter
        set((state) => ({
            user: state.user ? {
                ...state.user,
                position: { x, y },
                lastActive: Date.now()
            } : null
        }));
    },

    restoreCharacter: async (roomId, charId, authUid) => {
        console.log(`[Store] Attempting to restore character ${charId} in ${roomId}`);
        set({ isLoading: true });

        try {
            const playerSnap = await getDb(ref(db, `rooms/${roomId}/players/${charId}`));
            if (playerSnap.exists()) {
                const playerData = playerSnap.val() as SimulationPlayer;

                // Security check
                if (playerData.uid === authUid) {
                    console.log(`[Store] Character restored successfully for UID: ${authUid}`);
                    set({ user: playerData, currentRoomId: roomId, isLoading: false });
                    return true;
                }
            }
        } catch (error) {
            console.error(`[Store] Restoration failed:`, error);
        }

        set({ isLoading: false });
        return false;
    }
}));




