import type { Resources } from '../types/simulation';

export const INITIAL_RESOURCES: Record<string, Resources> = {
    KING: { gold: 1000, grain: 100, wood: 100, stone: 100, ore: 50, iron: 50 },
    BARON: { gold: 500, grain: 50, wood: 50, stone: 50, ore: 20, iron: 20 },
    MERCHANT: { gold: 300, grain: 20, wood: 10, stone: 10, ore: 10, iron: 10 },
    SOLDIER: { gold: 100, grain: 10, wood: 5, stone: 5, ore: 0, iron: 0 },
    PEASANT: { gold: 50, grain: 5, wood: 5, stone: 5, ore: 0, iron: 0 }
};

export const GAME_BALANCE = {
    TAX: {
        PEASANT_RATE_DEFAULT: 0.15,
        BARON_TO_KING_RATE: 0.20
    }
};
