import React from 'react';
import { useGameStore } from '../../game/state/store';
import { gameActions } from '../../game/systems/ActionManager';
import { WoodcuttingGame } from './WoodcuttingGame';
import { MiningGame } from './MiningGame';
import { HarvestingGame } from './HarvestingGame';
import { QuarryingGame } from './QuarryingGame';

// Assets
import panelBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panel_beige.png';
import buttonBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/buttonLong_beige.png';

export const MinigameOverlay: React.FC = () => {
    const activeInteraction = useGameStore((state) => state.activeInteraction);
    const setInteraction = useGameStore((state) => state.setInteraction);

    if (!activeInteraction) return null;

    const handleComplete = async (score: number) => {
        const resourceMap: Record<string, string> = {
            'CHOP': 'wood',
            'MINE': 'iron_ore', // Now correctly iron_ore
            'QUARRY': 'stone', // New stone mapping
            'HARVEST': 'grain'
        };
        const res = resourceMap[activeInteraction.type] || 'wood';
        await gameActions.gather(res, score);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto p-8">
            <div className="absolute top-8 right-8 z-[110]">
                <button
                    onClick={() => setInteraction(null)}
                    className="text-white/40 hover:text-white text-4xl transition-colors font-black"
                >
                    ✕
                </button>
            </div>

            <div className="w-full max-w-2xl relative">
                {activeInteraction.type === 'CHOP' && <WoodcuttingGame onComplete={handleComplete} />}
                {activeInteraction.type === 'MINE' && <MiningGame onComplete={handleComplete} />}
                {activeInteraction.type === 'QUARRY' && <QuarryingGame onComplete={handleComplete} />}
                {activeInteraction.type === 'HARVEST' && <HarvestingGame onComplete={handleComplete} />}

                {activeInteraction.type !== 'CHOP' &&
                    activeInteraction.type !== 'MINE' &&
                    activeInteraction.type !== 'QUARRY' &&
                    activeInteraction.type !== 'HARVEST' && (
                        <div
                            className="p-16 flex flex-col items-center text-center shadow-2xl"
                            style={{
                                backgroundImage: `url(${panelBg})`,
                                backgroundSize: '100% 100%',
                                imageRendering: 'pixelated'
                            }}
                        >
                            <h2 className="text-4xl font-black text-orange-950 uppercase mb-4 tracking-tighter underline decoration-orange-900/20">
                                Under Utvikling
                            </h2>
                            <p className="text-orange-900/70 mb-12 font-bold italic text-lg leading-relaxed">
                                Våre håndverkere jobber fortsatt med å finpusse verktøyene for <span className="text-orange-950 not-italic">{activeInteraction.type}</span>.
                            </p>

                            <button
                                onClick={() => handleComplete(1.0)}
                                className="px-10 py-3 pb-4 text-sm font-black transition-all hover:brightness-110 active:scale-95 shadow-lg uppercase tracking-widest"
                                style={{
                                    backgroundImage: `url(${buttonBg})`,
                                    backgroundSize: '100% 100%',
                                    color: '#4a3728',
                                    imageRendering: 'pixelated'
                                }}
                            >
                                Fullfør automatisk
                            </button>
                        </div>
                    )}
            </div>
        </div>
    );
};
