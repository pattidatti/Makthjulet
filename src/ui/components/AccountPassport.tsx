import React from 'react';
import { useAuth } from '../AuthContext';
import { Award, Star, History, X, ShieldCheck } from 'lucide-react';
import goldPanelBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panel_beigeLight.png';

interface AccountPassportProps {
    onClose: () => void;
}

export const AccountPassport: React.FC<AccountPassportProps> = ({ onClose }) => {
    const { account } = useAuth();

    if (!account) return null;

    const panelStyle = {
        backgroundImage: `url(${goldPanelBg})`,
        backgroundSize: '100% 100%',
        imageRendering: 'pixelated' as const,
        border: '4px solid #d4af37', // Real Gold color
        boxShadow: '0 0 30px rgba(212, 175, 55, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.5)'
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
            <div
                className="relative w-full max-w-lg p-12 flex flex-col items-center gap-8"
                style={panelStyle}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-orange-900/40 hover:text-orange-950 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header: The Global Soul */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 bg-gradient-to-tr from-yellow-600 to-yellow-200 rounded-full flex items-center justify-center shadow-xl border-4 border-white/20">
                            <ShieldCheck className="text-white drop-shadow-md" size={48} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full border-2 border-yellow-600 shadow-md">
                            <span className="text-[10px] font-black text-yellow-800 uppercase">Legacy V.1</span>
                        </div>
                    </div>
                    <h2 className="text-4xl font-black text-orange-950 uppercase tracking-tighter leading-none">
                        {account.displayName}
                    </h2>
                    <p className="text-yellow-800/60 font-serif text-sm italic mt-1">Ærverdig Medlem av Makthjulet</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white/40 p-4 rounded-xl border border-yellow-600/20 flex flex-col items-center">
                        <Star className="text-yellow-700 mb-1" size={20} />
                        <span className="text-[10px] uppercase font-black text-yellow-900/40 tracking-widest">Global Level</span>
                        <span className="text-2xl font-black text-yellow-900">{account.globalLevel}</span>
                    </div>
                    <div className="bg-white/40 p-4 rounded-xl border border-yellow-600/20 flex flex-col items-center">
                        <Award className="text-yellow-700 mb-1" size={20} />
                        <span className="text-[10px] uppercase font-black text-yellow-900/40 tracking-widest">Total XP</span>
                        <span className="text-2xl font-black text-yellow-900">{(account.globalXp || 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* Achievements Preview */}
                <div className="w-full">
                    <div className="flex items-center gap-2 mb-3 border-b border-yellow-600/10 pb-2">
                        <History size={16} className="text-yellow-800/60" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-yellow-900">Globale Bedrifter</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {account.achievements && account.achievements.length > 0 ? account.achievements.map((ach, i) => (
                            <div key={i} className="px-3 py-1 bg-yellow-600/10 rounded-full border border-yellow-600/20 text-[10px] font-bold text-yellow-900 italic">
                                🎖️ {ach}
                            </div>
                        )) : (
                            <p className="text-yellow-900/30 text-[10px] italic w-full text-center py-4 bg-white/20 rounded-lg">
                                Ingen globale bedrifter ennå...
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer: Account Age */}
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-900/30 mt-4">
                    Konto Opprettet: {new Date(account.accountAge).toLocaleDateString('no-NO')}
                </div>
            </div>
        </div>
    );
};
