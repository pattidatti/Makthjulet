export interface MarketItem {
    price: number;
    stock: number;
    maxStock: number;
}

export const INITIAL_MARKET: Record<string, MarketItem> = {
    // Basic Food
    grain: { price: 5, stock: 200, maxStock: 1000 },
    honey: { price: 15, stock: 50, maxStock: 200 },
    meat: { price: 25, stock: 40, maxStock: 200 },
    egg: { price: 8, stock: 100, maxStock: 500 },

    // Refined Food
    flour: { price: 12, stock: 80, maxStock: 400 },
    bread: { price: 25, stock: 60, maxStock: 300 },
    omelette: { price: 35, stock: 30, maxStock: 150 },

    // Basic Materials
    wood: { price: 8, stock: 150, maxStock: 800 },
    stone: { price: 12, stock: 100, maxStock: 600 },
    iron_ore: { price: 20, stock: 60, maxStock: 300 },
    wool: { price: 15, stock: 80, maxStock: 400 },

    // Refined Materials
    plank: { price: 20, stock: 50, maxStock: 250 },
    iron_ingot: { price: 45, stock: 30, maxStock: 150 },
    cloth: { price: 40, stock: 40, maxStock: 200 },
    glass: { price: 60, stock: 20, maxStock: 100 },

    // Military/State
    swords: { price: 120, stock: 15, maxStock: 50 },
    armor: { price: 180, stock: 10, maxStock: 40 },
    favor: { price: 500, stock: 5, maxStock: 20 }
};

export const calculateMarketPrice = (basePrice: number, stock: number, maxStock: number): number => {
    // Supply/Demand: price increases as stock drops
    const stockRatio = stock / maxStock;
    const scarcityMultiplier = 0.5 + (1 / (stockRatio + 0.5)); // Hyperbola-like curve
    return Math.round(basePrice * scarcityMultiplier);
};
