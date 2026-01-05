import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../game/state/store';
import { Shield, PlusCircle, UserCircle, Globe, Users, ChevronRight, Volume2, VolumeX, LogIn, LogOut, ArrowRight } from 'lucide-react';
import { useAudioStore } from '../../game/state/audioStore';
import { useAuth } from '../AuthContext';
import { AuthModal } from './AuthModal';
import { ref, get } from 'firebase/database';
import { db } from '../../config/firebase';
import type { SimulationPlayer } from '../../game/types/simulation';

// Use the generated image
import bgImage from '../../assets/gfx/landing_bg.png';

export const LandingPage = () => {
    const navigate = useNavigate();
    const { user, account, createCharacter, logout } = useAuth();
    const [rooms] = useState<string[]>(['VALHALL', 'MIDGARD', 'NIDAVELLIR']);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [roster, setRoster] = useState<SimulationPlayer[]>([]);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [loadingRoster, setLoadingRoster] = useState(false);
    const { isMuted, toggleMute, init: initAudio } = useAudioStore();

    const setUser = useGameStore((state: any) => state.setUser);

    // Browser policy: Music must start on user interaction
    const handleInteraction = () => {
        initAudio();
    };

    // Secret Admin Shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
                navigate('/admin');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    // Fetch Roster for selected room
    useEffect(() => {
        if (!selectedRoom || !account) {
            setRoster([]);
            return;
        }

        const fetchRoster = async () => {
            setLoadingRoster(true);
            const roomCharIds = account.characterRoster?.[selectedRoom] || [];
            const realmChars: SimulationPlayer[] = [];

            for (const charId of roomCharIds) {
                const charSnap = await get(ref(db, `rooms/${selectedRoom}/players/${charId}`));
                if (charSnap.exists()) {
                    realmChars.push(charSnap.val());
                }
            }

            setRoster(realmChars);
            setLoadingRoster(false);
        };

        fetchRoster();
    }, [selectedRoom, account]);

    const handleSelectCharacter = (character: SimulationPlayer) => {
        setUser(character);
        navigate(`/play/${selectedRoom}?charId=${character.id}`);
    };

    const handleCreateCharacter = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!name.trim() || !selectedRoom) return;
        try {
            const character = await createCharacter(selectedRoom, name);
            setUser(character);
            navigate(`/play/${selectedRoom}?charId=${character.id}`);
        } catch (err) {
            alert("Kunne ikke skape karakter.");
        }
    };

    return (
        <div className="relative w-screen h-screen bg-neutral-950 overflow-hidden font-serif select-none flex flex-col items-center justify-center" onClick={handleInteraction}>
            {/* Background Music Mute Toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                }}
                className="fixed bottom-8 right-8 z-[200] p-4 bg-black/40 hover:bg-black/60 border border-orange-100/10 rounded-full text-orange-100/40 hover:text-orange-100 transition-all active:scale-95 shadow-2xl backdrop-blur-md group"
            >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} className="animate-pulse" />}
                <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 text-[9px] font-black uppercase tracking-widest rounded border border-orange-100/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isMuted ? 'Slå på musikk' : 'Demp musikk'}
                </span>
            </button>
            {/* Background Layer */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 animate-pulse-slow opacity-60 transition-transform duration-[10000ms] hover:scale-100"
                style={{ backgroundImage: `url(${bgImage})` }}
            />

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

            {/* Content Layer */}
            <div className="relative z-10 max-w-4xl w-full px-6 flex flex-col items-center">
                <div className="mb-12 text-center animate-in fade-in slide-in-from-top-12 duration-1000">
                    <h1 className="text-8xl font-black italic tracking-tighter text-orange-100 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] uppercase">
                        Makthjulet
                    </h1>
                    <p className="text-orange-200/60 font-mono text-sm tracking-[0.5em] mt-4 uppercase">
                        Fra Møkk til Majestet
                    </p>
                </div>

                <div className="flex justify-center w-full mb-8">
                    {(!user || user.isAnonymous) ? (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-orange-100/10 hover:bg-orange-100/20 rounded-full border border-orange-100/10 text-xs font-black uppercase tracking-widest transition-all text-orange-100/60"
                        >
                            <LogIn size={14} /> Logg Inn for å Lagre Fremgang
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className="text-orange-100/60 text-xs font-bold font-mono">
                                LOGGET INN SOM: <span className="text-orange-100 ml-1">{account?.displayName?.toUpperCase() || 'EVENTYRER'}</span>
                            </span>
                            <button
                                onClick={() => logout()}
                                className="text-orange-100/20 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                                <LogOut size={12} /> Logg Ut
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                    {/* Realm Browser */}
                    <div className="bg-orange-100/5 backdrop-blur-md border border-orange-100/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-4 border-b border-orange-100/10 pb-4">
                            <div className="w-12 h-12 bg-orange-100/10 rounded-xl flex items-center justify-center">
                                <Globe className="text-orange-200" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-orange-200/50">Tilgjengelige Riker</h3>
                                <p className="text-lg font-black text-orange-100">Velg din destinasjon</p>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {rooms.map((room) => (
                                <button
                                    key={room}
                                    onClick={() => setSelectedRoom(room)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${selectedRoom === room
                                        ? 'bg-orange-100/20 border-orange-400 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                                        : 'bg-orange-100/5 border-orange-100/10 hover:bg-orange-100/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        <span className="font-bold tracking-tight text-orange-100">{room}</span>
                                    </div>
                                    <ChevronRight size={16} className={`transition-all ${selectedRoom === room ? 'text-orange-400 translate-x-1' : 'text-orange-100/20 group-hover:text-orange-100 group-hover:translate-x-1'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Character Identity Card */}
                    <div className="bg-orange-950/40 backdrop-blur-xl border-2 border-orange-100/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6 min-h-[400px]">
                        {!selectedRoom ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-pulse">
                                <Shield size={48} className="mb-6 text-orange-100/10" />
                                <h4 className="text-orange-100/60 font-black uppercase tracking-tighter text-xl mb-2">Begynn din Reise</h4>
                                <p className="text-orange-100/30 text-xs italic max-w-[200px] leading-relaxed">
                                    Velg et av rikene til venstre for å sjekke inn eller skape en ny karakter.
                                </p>
                                <div className="mt-8 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-orange-100/10">
                                    <div className="w-8 h-[1px] bg-orange-100/10" />
                                    Steg 1: Velg Server
                                    <div className="w-8 h-[1px] bg-orange-100/10" />
                                </div>
                            </div>
                        ) : loadingRoster ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-orange-100/20 border-t-orange-100 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 border-b border-orange-100/10 pb-4">
                                    <div className="w-12 h-12 bg-orange-100/10 rounded-xl flex items-center justify-center">
                                        <Users className="text-orange-200" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-orange-200/50">Karakterer i {selectedRoom}</h3>
                                        <p className="text-lg font-black text-orange-100">Velg din identitet</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {roster.map((char) => (
                                        <button
                                            key={char.id}
                                            onClick={() => handleSelectCharacter(char)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-orange-100/5 border border-orange-100/10 hover:bg-orange-100/10 transition-all text-left group"
                                        >
                                            <div className="w-10 h-10 bg-orange-100/10 rounded-full flex items-center justify-center group-hover:bg-orange-100/20 transition-colors">
                                                <UserCircle className="text-orange-100" size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-orange-100">{char.name}</div>
                                                <div className="text-[10px] text-orange-100/40 uppercase font-black tracking-widest">
                                                    Level {char.stats.level} • {char.role}
                                                </div>
                                            </div>
                                            <ArrowRight size={14} className="text-orange-100/20 group-hover:text-orange-100 group-hover:translate-x-1" />
                                        </button>
                                    ))}

                                    {/* Create New Character */}
                                    <form onSubmit={handleCreateCharacter} className="mt-4 pt-4 border-t border-orange-100/10">
                                        <div className="relative mb-3">
                                            <input
                                                type="text"
                                                placeholder="Navngi en ny karakter..."
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-black/40 border border-orange-100/10 p-3 rounded-xl text-sm font-bold focus:border-orange-400 outline-none transition-all placeholder:text-orange-100/20 pr-12"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!name.trim()}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-100 hover:text-orange-400 disabled:opacity-20 disabled:hover:text-orange-100 transition-all"
                                            >
                                                <PlusCircle size={20} />
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-orange-100/30 italic text-center">
                                            Alle begynner som bonde. Din vei er ikke staket ut ennå.
                                        </p>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-orange-100/20">
                    <span className="flex items-center gap-2"><Shield size={12} /> Sikre Servere</span>
                    <span className="flex items-center gap-2 underline cursor-pointer hover:text-orange-100 transition-colors" onClick={() => navigate('/admin')}>Admin Portalen</span>
                </div>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Version Badge */}
            <div className="absolute bottom-6 right-6 opacity-30 text-[10px] font-mono tracking-widest">
                VER-X_PHASE_7_IDENTITY
            </div>
        </div>
    );
};
