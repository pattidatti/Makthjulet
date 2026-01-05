import React, { useState, useEffect, useRef } from 'react';

// Assets
import panelBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panelInset_brown.png';
import progressBackMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barBack_horizontalMid.png';
import progressFillMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barBlue_horizontalBlue.png';

interface MiningGameProps {
    onComplete: (score: number) => void;
}

export const MiningGame: React.FC<MiningGameProps> = ({ onComplete }) => {
    const [sliderPos, setSliderPos] = useState(0); // 0 to 100
    const [isMovingRight, setIsMovingRight] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isHit, setIsHit] = useState(false);

    // Target zone: 40-60
    const targetMin = 40;
    const targetMax = 60;

    // Game Loop for slider
    useEffect(() => {
        const interval = setInterval(() => {
            setSliderPos(prev => {
                if (isMovingRight) {
                    if (prev >= 100) {
                        setIsMovingRight(false);
                        return 100;
                    }
                    return prev + 4;
                } else {
                    if (prev <= 0) {
                        setIsMovingRight(true);
                        return 0;
                    }
                    return prev - 4;
                }
            });
        }, 30);
        return () => clearInterval(interval);
    }, [isMovingRight]);

    const handleStrike = () => {
        if (isHit) return;

        const isInTarget = sliderPos >= targetMin && sliderPos <= targetMax;

        if (isInTarget) {
            setIsHit(true);
            setProgress(prev => prev + 25);

            // Visual feedback
            setTimeout(() => {
                setIsHit(false);
            }, 200);

            if (progress + 25 >= 100) {
                setTimeout(() => onComplete(1.0), 500);
            }
        } else {
            // Penalty or miss
            setIsHit(true);
            setTimeout(() => setIsHit(false), 300);
        }
    };

    return (
        <div
            className={`relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-75 ${isHit ? 'scale-[1.05] brightness-150' : ''}`}
            style={{
                backgroundImage: `url(${panelBg})`,
                backgroundSize: '100% 100%',
                imageRendering: 'pixelated'
            }}
        >
            {/* Background "Rock" Visual */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-64 h-64 bg-slate-700 rounded-lg blur-3xl rotate-45 transform" />
            </div>

            {/* HUD */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    Gruvedrift
                </h2>
                <div className="px-4 py-1 bg-black/40 rounded border border-white/10 text-xs font-bold text-blue-400 uppercase tracking-widest shadow-inner">
                    Presisjon: {progress}%
                </div>
            </div>

            {/* Mining Slider Mechanic */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                <div className="w-full h-12 bg-black/60 rounded-full border-2 border-white/10 relative overflow-hidden group">
                    {/* Target Zone */}
                    <div
                        className="absolute h-full bg-blue-500/30 border-x-2 border-blue-400/50"
                        style={{ left: `${targetMin}%`, width: `${targetMax - targetMin}%` }}
                    />

                    {/* Slider Indicator */}
                    <div
                        className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_15px_white]"
                        style={{ left: `${sliderPos}%` }}
                    />
                </div>

                <button
                    onClick={handleStrike}
                    className="mt-8 px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl border-b-4 border-blue-800 transition-all active:translate-y-1 active:border-b-0 uppercase tracking-tighter shadow-2xl"
                >
                    Slå til! (Mellomrom)
                </button>
                <div className="mt-2 text-[10px] font-black text-white/40 uppercase tracking-widest">Treff den blå sonen</div>
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
