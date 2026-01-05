import React from 'react';
import { useGameStore } from '../../game/state/store';
import { User, Shield, Zap, Heart, Award, X } from 'lucide-react';
import parchmentBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panel_beige.png';

interface CharacterPassportProps {
    onClose: () => void;
}

export const CharacterPassport: React.FC<CharacterPassportProps> = ({ onClose }) => {
    const character = useGameStore((state: any) => state.user);

    if (!character) return null;

    const panelStyle = {
        backgroundImage: `url(${parchmentBg})`,
        backgroundSize: '100% 100%',
        imageRendering: 'pixelated' as const,
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto">
            <div
                className="relative w-full max-w-lg p-10 flex flex-col gap-6 shadow-2xl"
                style={panelStyle}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-orange-900/40 hover:text-orange-950 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header: The Persona */}
                <div className="flex items-center gap-6 border-b-2 border-orange-950/10 pb-6">
                    <div className="w-20 h-20 bg-orange-950/10 rounded-2xl flex items-center justify-center border-4 border-orange-950/20 shadow-inner">
                        <User className="text-orange-950" size={40} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-950/40 mb-1">Passinnehaver</div>
                        <h2 className="text-3xl font-black text-orange-950 uppercase tracking-tighter leading-none mb-2">
                            {character.name}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-orange-950 text-orange-50 text-[10px] font-black uppercase rounded">
                                {character.role}
                            </span>
                            <span className="text-[10px] font-bold text-orange-950/60 font-serif italic">
                                Level {character.stats.level}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-red-900">
                            <Heart size={16} />
                            <span className="text-xs font-black uppercase">Livskraft</span>
                        </div>
                        <div className="flex-1 h-3 bg-red-900/10 rounded-full border border-red-900/20 overflow-hidden">
                            <div className="h-full bg-red-600" style={{ width: `${character.status.hp}%` }} />
                        </div>
                        <span className="text-xs font-black text-red-900 w-8 text-right">{character.status.hp}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-amber-900">
                            <Zap size={16} />
                            <span className="text-xs font-black uppercase">Utholdenhet</span>
                        </div>
                        <div className="flex-1 h-3 bg-amber-900/10 rounded-full border border-amber-900/20 overflow-hidden">
                            <div className="h-full bg-amber-600" style={{ width: `${character.status.stamina}%` }} />
                        </div>
                        <span className="text-xs font-black text-amber-900 w-8 text-right">{character.status.stamina}</span>
                    </div>
                </div>

                {/* Secondary Grid */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-orange-950/5 p-4 rounded-xl border border-orange-950/10 flex items-center gap-3">
                        <Shield className="text-orange-900/40" size={24} />
                        <div>
                            <div className="text-[9px] font-black uppercase text-orange-900/40 tracking-widest">Rykte</div>
                            <div className="text-lg font-black text-orange-950">{character.stats.reputation}</div>
                        </div>
                    </div>
                    <div className="bg-orange-950/5 p-4 rounded-xl border border-orange-950/10 flex items-center gap-3">
                        <Award className="text-orange-900/40" size={24} />
                        <div>
                            <div className="text-[9px] font-black uppercase text-orange-900/40 tracking-widest">Erfaring</div>
                            <div className="text-lg font-black text-orange-950">{character.stats.xp}</div>
                        </div>
                    </div>
                </div>

                {/* Role Description */}
                <div className="mt-4 p-4 bg-orange-950/[0.03] rounded border border-orange-950/5 italic text-[11px] text-orange-950/60 leading-relaxed font-serif">
                    {character.role === 'PEASANT' && "En enkel sjel som arbeider med jorden. Din verdi måles i svette og korn, men hjulet dreier alltid..."}
                    {character.role === 'BARON' && "En forvalter av riket. Med makt følger ansvar for dine undersåtter og lojalitet til tronen."}
                    {character.role === 'KING' && "Hjulets midtpunkt. Din vilje er lov, men tronen er skjør og mange ønsker din plass."}
                </div>
            </div>
        </div>
    );
};
