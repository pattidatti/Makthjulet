import React, { useState, useEffect } from 'react';

// Assets
import panelBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panelInset_brown.png';
import progressBackMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barBack_horizontalMid.png';
import progressFillMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barGreen_horizontalMid.png';

interface HarvestingGameProps {
    onComplete: (score: number) => void;
}

export const HarvestingGame: React.FC<HarvestingGameProps> = ({ onComplete }) => {
    const [points, setPoints] = useState(0);
    const [shake, setShake] = useState(false);

    // Rhythm indicators
    const [targets, setTargets] = useState<{ id: number, x: number, y: number, scale: number }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (targets.length < 3) {
                setTargets(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    x: 20 + Math.random() * 60,
                    y: 20 + Math.random() * 60,
                    scale: 1.5
                }]);
            }
        }, 800);
        return () => clearInterval(interval);
    }, [targets]);

    // Shrinking logic
    useEffect(() => {
        const interval = setInterval(() => {
            setTargets(prev => prev.map(t => ({ ...t, scale: t.scale - 0.05 })).filter(t => t.scale > 0.2));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const handleGather = (id: number, scale: number) => {
        // Higher score if scale is closer to 0.5 (perfect harvest)
        const accuracy = 1 - Math.abs(scale - 0.5);
        if (accuracy > 0.7) {
            setPoints(prev => prev + 20);
            setShake(true);
            setTimeout(() => setShake(false), 100);
        } else {
            setPoints(prev => prev + 5);
        }

        setTargets(prev => prev.filter(t => t.id !== id));

        if (points + 20 >= 100) {
            setTimeout(() => onComplete(1.0), 300);
        }
    };

    return (
        <div
            className={`relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl transition-all ${shake ? 'translate-y-1' : ''}`}
            style={{
                backgroundImage: `url(${panelBg})`,
                backgroundSize: '100% 100%',
                imageRendering: 'pixelated'
            }}
        >
            {/* Background "Field" Visual */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-full h-full bg-amber-600/20 blur-3xl" />
            </div>

            {/* HUD */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                <h2 className="text-4xl font-black text-amber-100 uppercase tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    Innhøsting
                </h2>
                <div className="px-4 py-1 bg-black/40 rounded border border-white/10 text-xs font-bold text-amber-500 uppercase tracking-widest shadow-inner">
                    Innsamlet: {points}%
                </div>
            </div>

            {/* Harvesting Mechanic: Click shrinking circles */}
            <div className="absolute inset-0">
                {targets.map(t => (
                    <button
                        key={t.id}
                        onClick={() => handleGather(t.id, t.scale)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group transition-transform active:scale-95"
                        style={{ left: `${t.x}%`, top: `${t.y}%` }}
                    >
                        {/* Perfect hit zone indicator */}
                        <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 scale-[0.5] pointer-events-none" />

                        {/* Shrinking circle */}
                        <div
                            className={`rounded-full border-4 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center bg-amber-900/40`}
                            style={{ width: `${t.scale * 100}px`, height: `${t.scale * 100}px` }}
                        >
                            <span className="text-2xl drop-shadow-md">🌾</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-[10px] font-black text-amber-100/40 uppercase tracking-[0.3em]">
                Klikk når kornene er gylne!
            </div>

            {/* Custom Progress Bar */}
            <div className="absolute bottom-6 left-12 right-12 h-6 flex shadow-2xl">
                <div className="relative flex-1 flex">
                    <img src={progressBackMid} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated' }} alt="" />
                    <div
                        className="absolute inset-0 flex transition-all duration-300"
                        style={{ width: `${points}%`, overflow: 'hidden' }}
                    >
                        <img src={progressFillMid} className="h-full w-full" style={{ imageRendering: 'pixelated' }} alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
};
