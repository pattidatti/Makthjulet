export const RESOURCE_METADATA: Record<string, { label: string, icon: string, category: 'Food' | 'Material' | 'State' | 'Refined' }> = {
    // Basic Food
    grain: { label: 'Korn', icon: '🌾', category: 'Food' },
    honey: { label: 'Honning', icon: '🍯', category: 'Food' },
    meat: { label: 'Kjøtt', icon: '🍗', category: 'Food' },
    egg: { label: 'Egg', icon: '🥚', category: 'Food' },

    // Refined Food
    flour: { label: 'Mel', icon: '🧂', category: 'Refined' },
    bread: { label: 'Brød', icon: '🍞', category: 'Refined' },
    omelette: { label: 'Omelett', icon: '🍳', category: 'Refined' },

    // Basic Materials
    wood: { label: 'Ved', icon: '🪵', category: 'Material' },
    stone: { label: 'Stein', icon: '🏔️', category: 'Material' },
    iron_ore: { label: 'Jernmalm', icon: '🪨', category: 'Material' },
    wool: { label: 'Ull', icon: '🧶', category: 'Material' },

    // Refined Materials
    plank: { label: 'Planker', icon: '🪵', category: 'Refined' },
    iron_ingot: { label: 'Jernbarre', icon: '🧱', category: 'Refined' },
    cloth: { label: 'Stoff', icon: '📜', category: 'Refined' },
    glass: { label: 'Glass', icon: '🥛', category: 'Refined' },

    // Military/State
    swords: { label: 'Sverd', icon: '⚔️', category: 'State' },
    armor: { label: 'Rustning', icon: '🛡️', category: 'State' },
    favor: { label: 'Gunst', icon: '✨', category: 'State' }
};
