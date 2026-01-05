import React, { useState, useEffect } from 'react';

// Assets
import panelBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panelInset_brown.png';
import progressBackMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barBack_horizontalMid.png';
import progressFillMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barYellow_horizontalMid.png';

interface QuarryingGameProps {
    onComplete: (score: number) => void;
}

export const QuarryingGame: React.FC<QuarryingGameProps> = ({ onComplete }) => {
    const [angle, setAngle] = useState(0); // 0 to 180 degrees
    const [isMovingClockwise, setIsMovingClockwise] = useState(true);
    const [progress, setProgress] = useState(0);
    const [shake, setShake] = useState(false);

    // Target zone: 70 to 110 degrees (top center of the arc)
    const targetMin = 75;
    const targetMax = 105;

    useEffect(() => {
        const interval = setInterval(() => {
            setAngle(prev => {
                if (isMovingClockwise) {
                    if (prev >= 180) {
                        setIsMovingClockwise(false);
                        return 180;
                    }
                    return prev + 6;
                } else {
                    if (prev <= 0) {
                        setIsMovingClockwise(true);
                        return 0;
                    }
                    return prev - 6;
                }
            });
        }, 20);
        return () => clearInterval(interval);
    }, [isMovingClockwise]);

    const handleStrike = () => {
        if (shake) return;

        const isInTarget = angle >= targetMin && angle <= targetMax;

        if (isInTarget) {
            setShake(true);
            setProgress(prev => prev + 25);

            setTimeout(() => {
                setShake(false);
            }, 200);

            if (progress + 25 >= 100) {
                setTimeout(() => onComplete(1.0), 300);
            }
        } else {
            // Penalty shake
            setShake(true);
            setTimeout(() => setShake(false), 400);
        }
    };

    return (
        <div
            className={`relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-75 ${shake ? 'scale-[1.02] brightness-125' : ''}`}
            style={{
                backgroundImage: `url(${panelBg})`,
                backgroundSize: '100% 100%',
                imageRendering: 'pixelated'
            }}
        >
            {/* HUD */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    Steinbryting
                </h2>
                <div className="px-4 py-1 bg-black/40 rounded border border-white/10 text-xs font-bold text-yellow-400 uppercase tracking-widest shadow-inner">
                    Steinblokker: {progress / 25} / 4
                </div>
            </div>

            {/* Arc Mechanic */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                <div className="relative w-64 h-32 border-t-[12px] border-x-[12px] border-black/40 rounded-t-full overflow-hidden">
                    {/* Target Zone Arc */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] border-[40px] border-yellow-500/20 rounded-full"
                        style={{
                            clipPath: `polygon(50% 50%, ${50 + Math.cos((targetMin - 90) * Math.PI / 180) * 100}% ${50 + Math.sin((targetMin - 90) * Math.PI / 180) * 100}%, ${50 + Math.cos((targetMax - 90) * Math.PI / 180) * 100}% ${50 + Math.sin((targetMax - 90) * Math.PI / 180) * 100}%)`
                        }}
                    />

                    {/* Needle */}
                    <div
                        className="absolute bottom-0 left-1/2 w-2 h-full bg-white origin-bottom shadow-[0_0_15px_white]"
                        style={{ transform: `translateX(-50%) rotate(${angle - 90}deg)` }}
                    />
                </div>

                <button
                    onClick={handleStrike}
                    className="mt-12 px-12 py-4 bg-orange-800 hover:bg-orange-700 text-white font-black rounded-xl border-b-4 border-orange-950 transition-all active:translate-y-1 active:border-b-0 uppercase tracking-tighter shadow-2xl"
                >
                    Knus! (Space)
                </button>
                <div className="mt-2 text-[10px] font-black text-white/40 uppercase tracking-widest">Treff senter av buen</div>
            </div>

            {/* Custom Progress Bar */}
            <div className="absolute bottom-6 left-12 right-12 h-6 flex shadow-2xl">
                <div className="relative flex-1 flex">
                    <img src={progressBackMid} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated' }} alt="" />
                    <div
                        className="absolute inset-0 flex transition-all duration-300"
                        style={{ width: `${progress}%`, overflow: 'hidden' }}
                    >
                        <img src={progressFillMid} className="h-full w-full" style={{ imageRendering: 'pixelated' }} alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
};
