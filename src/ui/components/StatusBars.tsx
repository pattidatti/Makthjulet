import React from 'react';
import { useGameStore } from '../../game/state/store';
import { gameActions } from '../../game/systems/ActionManager';

// Assets
import barBackLeft from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barBack_horizontalLeft.png';
import barBackMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barBack_horizontalMid.png';
import barBackRight from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barBack_horizontalRight.png';

import barGreenLeft from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barGreen_horizontalLeft.png';
import barGreenMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barGreen_horizontalMid.png';
import barGreenRight from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barGreen_horizontalRight.png';

import barYellowLeft from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barYellow_horizontalLeft.png';
import barYellowMid from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barYellow_horizontalMid.png';
import barYellowRight from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/barYellow_horizontalRight.png';

import buttonBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/buttonLong_beige.png';

const ProgressBar: React.FC<{ pct: number, type: 'hp' | 'stamina' }> = ({ pct, type }) => {
    const leftImg = type === 'hp' ? barGreenLeft : barYellowLeft;
    const midImg = type === 'hp' ? barGreenMid : barYellowMid;
    const rightImg = type === 'hp' ? barGreenRight : barYellowRight;

    return (
        <div className="relative w-64 h-8 flex overflow-hidden drop-shadow-md">
            {/* Background */}
            <div className="absolute inset-0 flex">
                <img src={barBackLeft} className="h-full" alt="" />
                <img src={barBackMid} className="h-full flex-1" style={{ imageRendering: 'pixelated' }} alt="" />
                <img src={barBackRight} className="h-full" alt="" />
            </div>

            {/* Foreground Fill */}
            <div className="absolute inset-0 flex transition-all duration-500 ease-out" style={{ width: `${pct}%`, overflow: 'hidden' }}>
                <img src={leftImg} className="h-full" alt="" />
                <img src={midImg} className="h-full flex-1" style={{ imageRendering: 'pixelated' }} alt="" />
                <img src={rightImg} className="h-full" alt="" />
            </div>
        </div>
    );
};

export const StatusBars: React.FC = () => {
    const user = useGameStore((state) => state.user);

    if (!user) return null;

    const staminaPct = (user.status.stamina / 100) * 100;
    const hpPct = (user.status.hp / 100) * 100;

    return (
        <div className="fixed top-4 right-4 flex flex-col gap-4 z-50 pointer-events-auto items-end">
            {/* Stamina Bar */}
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest drop-shadow-sm">Energi (Stamina)</span>
                    <span className="text-xs font-black text-orange-900">{Math.floor(user.status.stamina)}</span>
                </div>
                <ProgressBar pct={staminaPct} type="stamina" />
            </div>

            {/* HP Bar */}
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black text-red-700 uppercase tracking-widest drop-shadow-sm">Helse (HP)</span>
                    <span className="text-xs font-black text-orange-900">{Math.floor(user.status.hp)}</span>
                </div>
                <ProgressBar pct={hpPct} type="hp" />
            </div>

            {/* Survival Actions */}
            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => gameActions.eat()}
                    disabled={user.resources.grain < 1 || user.status.stamina >= 100}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ backgroundImage: `url(${buttonBg})`, backgroundSize: '100% 100%', color: '#4a3728' }}
                >
                    Spis Korn ({user.resources.grain})
                </button>
                <button
                    onClick={() => gameActions.rest()}
                    disabled={user.status.stamina >= 100}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ backgroundImage: `url(${buttonBg})`, backgroundSize: '100% 100%', color: '#4a3728' }}
                >
                    Hvil (+20)
                </button>
            </div>
        </div>
    );
};
