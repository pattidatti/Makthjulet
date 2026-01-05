import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Volume2, Music, LogOut, X } from 'lucide-react';
import panelBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panel_beige.png';
import buttonBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/buttonLong_beige.png';
import { useAudioStore } from '../../game/state/audioStore';

interface SettingsOverlayProps {
    onClose: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const {
        masterVolume, setMasterVolume,
        musicVolume, setMusicVolume,
        sfxVolume, setSfxVolume
    } = useAudioStore();

    // Convert decimal to peercentage 0-100
    const masterPercent = Math.round(masterVolume * 100);
    const musicPercent = Math.round(musicVolume * 100);
    const sfxPercent = Math.round(sfxVolume * 100);

    const handleExit = () => {
        console.log("[Settings] Exiting realm...");
        navigate('/');
        onClose(); // Clean up state
    };

    const panelStyle = {
        backgroundImage: `url(${panelBg})`,
        backgroundSize: '100% 100%',
        imageRendering: 'pixelated' as const,
    };

    const buttonStyle = {
        backgroundImage: `url(${buttonBg})`,
        backgroundSize: '100% 100%',
        imageRendering: 'pixelated' as const,
        color: '#4a3728'
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto">
            <div
                className="relative w-full max-w-md p-10 flex flex-col gap-8 shadow-2xl"
                style={panelStyle}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-orange-900/40 hover:text-orange-950 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-orange-900/10 rounded-full flex items-center justify-center mb-4 border-2 border-orange-950/20">
                        <Settings className="text-orange-900" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-orange-950 uppercase tracking-tighter">Instillinger</h2>
                </div>

                <style>{`
                    .game-slider {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 100%;
                        height: 8px;
                        background: rgba(154, 52, 18, 0.1);
                        border-radius: 4px;
                        outline: none;
                    }

                    .game-slider::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 24px;
                        height: 24px;
                        background: #9a3412;
                        cursor: pointer;
                        border-radius: 50%;
                        border: 2px solid #ffedd5;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        transition: transform 0.1s;
                    }

                    .game-slider::-webkit-slider-thumb:hover {
                        transform: scale(1.1);
                        background: #7c2d12;
                    }

                    .game-slider::-moz-range-thumb {
                        width: 24px;
                        height: 24px;
                        background: #9a3412;
                        cursor: pointer;
                        border-radius: 50%;
                        border: 2px solid #ffedd5;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                `}</style>

                {/* Audio Controls */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-orange-950/60 uppercase text-[10px] font-black tracking-widest">
                            <div className="flex items-center gap-2">
                                <Volume2 size={14} />
                                <span>Hovedvolum</span>
                            </div>
                            <span>{masterPercent}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={masterPercent}
                            onInput={(e: any) => setMasterVolume(parseInt(e.target.value))}
                            className="game-slider cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-orange-950/60 uppercase text-[10px] font-black tracking-widest">
                            <div className="flex items-center gap-2">
                                <Music size={14} />
                                <span>Musikk</span>
                            </div>
                            <span>{musicPercent}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={musicPercent}
                            onInput={(e: any) => setMusicVolume(parseInt(e.target.value))}
                            className="game-slider cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-orange-950/60 uppercase text-[10px] font-black tracking-widest">
                            <div className="flex items-center gap-2">
                                <Volume2 size={14} className="opacity-50" />
                                <span>Lydeffekter</span>
                            </div>
                            <span>{sfxPercent}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sfxPercent}
                            onInput={(e: any) => setSfxVolume(parseInt(e.target.value))}
                            className="game-slider cursor-pointer"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-orange-950/10">
                    <button
                        onClick={handleExit}
                        className="w-full py-4 pb-5 font-black uppercase text-lg transition-all hover:brightness-110 active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
                        style={buttonStyle}
                    >
                        <LogOut size={20} />
                        Forlat Riket
                    </button>
                    <p className="text-center text-[9px] font-black uppercase text-orange-900/30 mt-4 tracking-[0.2em]">
                        Makthjulet v1.2.4
                    </p>
                </div>
            </div>
        </div>
    );
};
