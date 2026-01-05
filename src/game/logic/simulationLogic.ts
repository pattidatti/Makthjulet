import type { SimulationPlayer, Role } from '../types/simulation';
import { INITIAL_RESOURCES } from '../data/constants';

export const assignRoles = (players: Record<string, any>): Record<string, SimulationPlayer> => {
    const playerIds = Object.keys(players);
    const totalPlayers = playerIds.length;
    const shuffledIds = [...playerIds].sort(() => Math.random() - 0.5);
    const updatedPlayers: Record<string, SimulationPlayer> = {};

    if (totalPlayers === 0) return updatedPlayers;


    // 1. Assign King
    const kingId = shuffledIds.shift();
    if (kingId) {
        updatedPlayers[kingId] = createPlayerData(kingId, players[kingId].name, 'KING', 'capital');
    }

    // 2. Assign Barons (Max 2)
    const potentialBarons = Math.min(2, shuffledIds.length);
    for (let i = 0; i < potentialBarons; i++) {
        const baronId = shuffledIds.shift();
        if (baronId) {
            const regionId = i === 0 ? 'region_ost' : 'region_vest';
            updatedPlayers[baronId] = createPlayerData(baronId, players[baronId].name, 'BARON', regionId);
        }
    }

    // 3. Assign Everyone Else as Peasants (simplified for now)
    let regionIndex = 0;
    while (shuffledIds.length > 0) {
        const id = shuffledIds.shift();
        if (id) {
            const regionId = regionIndex % 2 === 0 ? 'region_ost' : 'region_vest';
            updatedPlayers[id] = createPlayerData(id, players[id].name, 'PEASANT', regionId);
            regionIndex++;
        }
    }

    return updatedPlayers;
};

const createPlayerData = (id: string, name: string, role: Role, regionId: string): SimulationPlayer => ({
    id,
    name,
    role,
    regionId,
    resources: { ...INITIAL_RESOURCES[role] },
    status: {
        hp: 100,
        stamina: 100,
        morale: 100,
        legitimacy: 100,
        isJailed: false
    },
    stats: {
        level: 1,
        xp: 0,
        reputation: role === 'KING' ? 50 : (role === 'BARON' ? 40 : 10)
    }
});

export const calculateTaxes = (players: Record<string, SimulationPlayer>, kingTaxRate: number) => {
    const changes: Record<string, any> = {};
    const results: string[] = [];

    // Simple implementation of the logic found in legacy code
    Object.values(players).forEach(p => {
        if (p.role === 'PEASANT') {
            const baronTaxRate = 0.15;
            const goldTax = Math.ceil(p.resources.gold * baronTaxRate);
            const grainTax = Math.ceil(p.resources.grain * baronTaxRate);

            if (goldTax > 0 || grainTax > 0) {
                // Find local Baron
                const baron = Object.values(players).find(b => b.role === 'BARON' && b.regionId === p.regionId);
                if (baron) {
                    // This logic would normally update the DB, here we describe changes
                    results.push(`${p.name} betalte ${goldTax}g i skatt til ${baron.name}`);
                }
            }
        }
    });

    return { results };
};
