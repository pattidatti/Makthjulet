import React, { useState } from 'react';

import { useGameStore } from '../../game/state/store';
import { gameActions } from '../../game/systems/ActionManager';
import { calculateMarketPrice } from '../../game/data/market';
import { RESOURCE_METADATA } from '../../game/data/resources';

// Asset Imports
import panelBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panel_beige.png';
import panelInset from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panelInset_beige.png';
import buttonBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/buttonLong_beige.png';
import iconGold from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/iconCircle_beige.png';

export const MarketOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const user = useGameStore((state) => state.user);
    const market = useGameStore((state) => state.market);
    const [selectedCategory, setSelectedCategory] = useState<'All' | 'Food' | 'Material' | 'Refined' | 'State'>('All');

    const handleTrade = async (resource: string, isBuying: boolean) => {
        await gameActions.trade(resource, 1, isBuying);
    };

    if (!user) return null;

    const filteredItems = Object.entries(market).filter(([id]) => {
        if (selectedCategory === 'All') return true;
        return RESOURCE_METADATA[id]?.category === selectedCategory;
    });

    const categories: ('All' | 'Food' | 'Material' | 'Refined' | 'State')[] = ['All', 'Food', 'Material', 'Refined', 'State'];

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4 pointer-events-auto backdrop-blur-sm animate-in fade-in duration-300 overflow-hidden">
            <div
                className="relative p-10 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                style={{
                    backgroundImage: `url(${panelBg})`,
                    backgroundSize: '100% 100%',
                    imageRendering: 'pixelated'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-8 text-orange-950/40 hover:text-orange-950 font-black text-3xl transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-4xl font-black text-orange-950 mb-2 text-center uppercase tracking-tighter">
                    Kjøpmannstorget
                </h2>
                <p className="text-center text-orange-900/60 text-xs font-bold uppercase tracking-widest mb-8">
                    Region: {user.regionId}
                </p>

                {/* Gold Display */}
                <div className="flex justify-center mb-8">
                    <div
                        className="px-8 py-3 flex items-center gap-3 shadow-inner"
                        style={{ backgroundImage: `url(${panelInset})`, backgroundSize: '100% 100%', imageRendering: 'pixelated' }}
                    >
                        <img src={iconGold} className="w-8 h-8 drop-shadow-md" alt="gold" />
                        <span className="text-2xl font-black text-orange-950 tracking-tighter">
                            {Math.floor(user.resources.gold)}
                        </span>
                        <span className="text-[10px] uppercase font-black text-orange-900/40 mt-1">GULL</span>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-1 mb-6 px-4">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter transition-all border-b-2 ${selectedCategory === cat ? 'border-orange-900 text-orange-950 translate-y-[-2px]' : 'border-transparent text-orange-900/40 hover:text-orange-900'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Market List */}
                <div
                    className="flex-1 overflow-y-auto pr-2 custom-scrollbar my-4 mx-2 border-t-2 border-b-2 border-orange-950/5 min-h-0"
                >
                    <div className="space-y-2">
                        {filteredItems.map(([id, item]) => {
                            const meta = RESOURCE_METADATA[id] || { label: id, icon: '📦', category: 'Material' };
                            const currentPrice = calculateMarketPrice(item.price, item.stock, item.maxStock);
                            const sellPrice = Math.floor(currentPrice * 0.8);
                            const canBuy = user.resources.gold >= currentPrice;
                            const canSell = (user.resources as any)[id] > 0;

                            return (
                                <div
                                    key={id}
                                    className="group flex items-center justify-between gap-4 p-4 hover:bg-orange-950/5 transition-colors border-b border-orange-950/10 last:border-0"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center bg-orange-200/50 rounded-lg text-2xl shadow-inner border border-white/20">
                                            {meta.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-orange-950 text-lg leading-none mb-1 uppercase tracking-tighter">
                                                {meta.label}
                                            </span>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-[10px] font-bold text-orange-900/60 uppercase">
                                                    Beholdning: <span className="text-orange-950 italic">{(user.resources as any)[id] || 0}</span>
                                                </span>
                                                <span className="w-1 h-1 bg-orange-900/20 rounded-full" />
                                                <span className="text-[10px] font-bold text-orange-900/40 uppercase">
                                                    Marked: {item.stock}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end mr-2">
                                            <span className="text-sm font-black text-emerald-800 tracking-tighter">-{currentPrice}g</span>
                                            <span className="text-[9px] font-bold text-orange-900/40 uppercase">Kjøp</span>
                                        </div>

                                        <div className="h-8 w-[1px] bg-orange-950/10" />

                                        <div className="flex flex-col items-end mr-4">
                                            <span className="text-sm font-black text-orange-800 tracking-tighter">+{sellPrice}g</span>
                                            <span className="text-[9px] font-bold text-orange-900/40 uppercase">Salg</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleTrade(id, true)}
                                                disabled={!canBuy}
                                                className={`w-12 h-12 flex items-center justify-center transition-all ${canBuy ? 'hover:scale-105 hover:brightness-110' : 'opacity-30 grayscale cursor-not-allowed'}`}
                                                style={{ backgroundImage: `url(${buttonBg})`, backgroundSize: '100% 100%', imageRendering: 'pixelated' }}
                                            >
                                                <span className="font-black text-orange-950 text-xs">↑</span>
                                            </button>
                                            <button
                                                onClick={() => handleTrade(id, false)}
                                                disabled={!canSell}
                                                className={`w-12 h-12 flex items-center justify-center transition-all ${canSell ? 'hover:scale-105 hover:brightness-110' : 'opacity-30 grayscale cursor-not-allowed'}`}
                                                style={{ backgroundImage: `url(${buttonBg})`, backgroundSize: '100% 100%', imageRendering: 'pixelated' }}
                                            >
                                                <span className="font-black text-orange-950 text-xs">↓</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <p className="mt-auto pt-6 text-center text-[10px] text-orange-950/40 font-black uppercase tracking-[0.2em]">
                    Prisene påvirkes av tilbud og etterspørsel i sanntid
                </p>
            </div>
        </div>
    );
};
