import React, { useState } from 'react';

// Assets
import panelBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panelInset_brown.png';
import progressBackMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barBack_horizontalMid.png';
import progressFillMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barYellow_horizontalMid.png';

interface WoodcuttingGameProps {
    onComplete: (score: number) => void;
}

export const WoodcuttingGame: React.FC<WoodcuttingGameProps> = ({ onComplete }) => {
    const [hits, setHits] = useState(0);
    const [isHitStopping, setIsHitStopping] = useState(false);
    const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
    const [combo, setCombo] = useState(0);

    const spawnTarget = () => {
        setTargetPos({
            x: 20 + Math.random() * 60,
            y: 20 + Math.random() * 60
        });
    };

    const handleHit = () => {
        if (isHitStopping) return;

        setIsHitStopping(true);
        const newHits = hits + 1;
        setHits(newHits);
        setCombo(prev => prev + 1);

        if (newHits >= 10) {
            setTimeout(() => onComplete(1.0), 500);
        } else {
            setTimeout(() => {
                setIsHitStopping(false);
                spawnTarget();
            }, 100);
        }
    };

    return (
        <div
            className={`relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-75 ${isHitStopping ? 'scale-[1.02] brightness-125' : ''}`}
            style={{
                backgroundImage: `url(${panelBg})`,
                backgroundSize: '100% 100%',
                imageRendering: 'pixelated'
            }}
        >
            {/* Background "Tree" Visual */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-48 h-full bg-orange-950 rounded-full blur-3xl" />
            </div>

            {/* HUD */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                <h2 className="text-4xl font-black text-orange-100 uppercase tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    Tømmerhogging
                </h2>
                <div className="flex gap-4">
                    <div className="px-4 py-1 bg-black/40 rounded border border-white/10 text-xs font-bold text-amber-500 uppercase tracking-widest shadow-inner">
                        Fremdrift: {hits}/10
                    </div>
                    {combo > 0 && (
                        <div className="px-4 py-1 bg-red-700 rounded text-xs font-black text-white uppercase tracking-widest animate-bounce shadow-lg">
                            Combo x{combo}
                        </div>
                    )}
                </div>
            </div>

            {/* Target Button */}
            {!isHitStopping && hits < 10 && (
                <button
                    onClick={handleHit}
                    className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full border-4 border-white shadow-[0_0_40px_rgba(220,38,38,0.6)] animate-pulse active:scale-90 transition-all cursor-crosshair z-20 flex items-center justify-center text-3xl shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]"
                    style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
                >
                    <span className="drop-shadow-md">🪓</span>
                </button>
            )}

            {/* Finish State */}
            {hits >= 10 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-950/80 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
                    <span className="text-7xl mb-4 drop-shadow-2xl">🌲</span>
                    <h3 className="text-6xl font-black text-white uppercase tracking-tighter animate-bounce drop-shadow-2xl">Ferdig!</h3>
                </div>
            )}

            {/* Custom Progress Bar */}
            <div className="absolute bottom-6 left-12 right-12 h-6 flex shadow-2xl">
                <div className="relative flex-1 flex">
                    <img src={progressBackMid} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated' }} alt="" />
                    <div
                        className="absolute inset-0 flex transition-all duration-300"
                        style={{ width: `${(hits / 10) * 100}%`, overflow: 'hidden' }}
                    >
                        <img src={progressFillMid} className="h-full w-full" style={{ imageRendering: 'pixelated' }} alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
};
