export interface WorldState {
    season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
    day: number;
    weather: 'Clear' | 'Rain' | 'Storm';
}

export type Role = 'KING' | 'BARON' | 'MERCHANT' | 'SOLDIER' | 'PEASANT';


export interface Resources {
    gold: number;
    // Basic
    grain: number;
    wood: number;
    stone: number;
    ore: number;
    wool: number;
    honey: number;
    meat: number;
    egg: number;
    iron_ore: number;

    // Refined
    flour: number;
    bread: number;
    plank: number;
    iron_ingot: number;
    cloth: number;
    glass: number;
    omelette: number;

    // Luxury/Military
    swords: number;
    armor: number;
    favor: number;
}

export interface InventoryItem {
    id: string;
    templateId: string;
    name: string;
    icon: string;
    amount: number;
    slot: number; // 0-24 for grid
    type: 'RESOURCE' | 'EQUIPMENT' | 'CONSUMABLE';
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    stats?: Record<string, number>;
}

export interface SimulationPlayer {
    id: string;      // The unique Character ID (not UID)
    uid?: string;    // The Firebase User UID (owner)
    name: string;
    role: 'PEASANT' | 'BARON' | 'KING';
    regionId: string;
    resources: Resources;
    inventory: InventoryItem[];
    equipment: Record<string, InventoryItem>;
    position?: {
        x: number;
        y: number;
    };
    status: {
        hp: number;
        stamina: number;
        morale: number;
        legitimacy: number;
        isJailed: boolean;
    };
    stats: {
        level: number;
        xp: number;
        reputation: number;
    };
    lastActive?: number;
}

export interface SimulationAccount {
    uid: string;
    displayName: string;
    globalXp: number;
    globalLevel: number;
    accountAge: number; // Timestamp
    characterRoster: Record<string, string[]>; // { realmId: [characterId1, characterId2] }
    achievements: string[];
}

export interface Region {
    id: string;
    name: string;
    rulerId?: string;
    rulerName?: string;
    taxRate: number;
}
