import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { GameWrapper } from './GameWrapper';
import { useGameStore } from '../game/state/store';
import { MarketOverlay } from './components/MarketOverlay';
import { EventBus } from '../game/EventBus';
import { UserCircle, ShieldCheck } from 'lucide-react';
import { InventoryOverlay } from './components/InventoryOverlay';
import { StatusBars } from './components/StatusBars';
import { MinigameOverlay } from './components/MinigameOverlay';
import { AccountPassport } from './components/AccountPassport';
import { CharacterPassport } from './components/CharacterPassport';
import { SettingsOverlay } from './components/SettingsOverlay';
import { Settings as SettingsIcon, Shield } from 'lucide-react';
import { useAuth } from './AuthContext';

// Assets
import buttonBg from '../assets/ui/kenney_ui-pack-rpg-expansion/PNG/buttonLong_beige.png';

export const GameSession = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isAccountPassOpen, setIsAccountPassOpen] = useState(false);
    const [isCharacterPassOpen, setIsCharacterPassOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activePrompt, setActivePrompt] = useState<{ type: string, id: string, name: string } | null>(null);

    const user = useGameStore((state: any) => state.user);
    const allPlayers = useGameStore((state: any) => state.allPlayers);
    const setInteraction = useGameStore((state: any) => state.setInteraction);
    const syncWithFirebase = useGameStore((state: any) => state.syncWithFirebase);
    const updateLocalPosition = useGameStore((state: any) => state.updateLocalPosition);
    const restoreCharacter = useGameStore((state: any) => state.restoreCharacter);
    const [searchParams] = useSearchParams();
    const { user: authUser, loading: authLoading } = useAuth();
    const [restoring, setRestoring] = useState(false);

    // 0. Permanent Session Restoration Guard
    useEffect(() => {
        if (authLoading) return;

        const charIdInUrl = searchParams.get('charId');

        if (!user && charIdInUrl && authUser && roomId) {
            setRestoring(true);
            restoreCharacter(roomId, charIdInUrl, authUser.uid).then((success: boolean) => {
                if (!success) {
                    console.error("Restoration failed, redirecting...");
                    navigate('/');
                }
                setRestoring(false);
            });
        } else if (!user && !charIdInUrl) {
            console.log("No character in session or URL, redirecting...");
            navigate('/');
        }
    }, [user, searchParams, authUser, authLoading, roomId, restoreCharacter, navigate]);

    // 1. Sync World
    useEffect(() => {
        if (!roomId || !user) return;

        // Start real-time sync
        const cleanup = syncWithFirebase(roomId);
        return () => cleanup && cleanup();
    }, [roomId, user, syncWithFirebase]);

    // 2. Phaser Events
    useEffect(() => {
        const onInteractionPrompt = (data: any) => {
            setActivePrompt(data);
        };

        const onInteractionClear = () => {
            setActivePrompt(null);
        };

        EventBus.on('interaction-prompt', onInteractionPrompt);
        EventBus.on('interaction-clear', onInteractionClear);

        return () => {
            EventBus.off('interaction-prompt', onInteractionPrompt);
            EventBus.off('interaction-clear', onInteractionClear);
        };
    }, []);

    // 2.5 Sync Store to Phaser
    useEffect(() => {
        if (!user) return;
        EventBus.emit('sync-players', allPlayers, user.id);
    }, [allPlayers, user]);

    // 2.6 Listen for Phaser movement
    useEffect(() => {
        const onPlayerMoved = (coords: { x: number, y: number }) => {
            updateLocalPosition(coords.x, coords.y);
        };

        EventBus.on('local-player-moved', onPlayerMoved);
        return () => {
            EventBus.off('local-player-moved', onPlayerMoved);
        };
    }, [updateLocalPosition]);

    // 3. Hotkeys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'b') {
                setIsInventoryOpen(prev => !prev);
            }
            if (e.key.toLowerCase() === 'e' && activePrompt) {
                setInteraction({ type: activePrompt.type, targetId: activePrompt.id });
            }
            // Esc to close overlays or go back to landing
            if (e.key === 'Escape') {
                if (isMarketOpen || isInventoryOpen || isAccountPassOpen || isCharacterPassOpen || isSettingsOpen) {
                    setIsMarketOpen(false);
                    setIsInventoryOpen(false);
                    setIsAccountPassOpen(false);
                    setIsCharacterPassOpen(false);
                    setIsSettingsOpen(false);
                } else {
                    setIsSettingsOpen(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activePrompt, isMarketOpen, isInventoryOpen, isAccountPassOpen, isCharacterPassOpen, navigate, setInteraction]);

    if (authLoading || restoring || !user) {
        return (
            <div className="w-screen h-screen bg-neutral-950 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-orange-950/20 border-t-orange-500 rounded-full animate-spin" />
                    <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500/50" size={32} />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-orange-100 font-black uppercase tracking-widest animate-pulse">
                        Gjenoppretter forbindelse...
                    </p>
                    <p className="text-orange-100/30 text-[10px] uppercase font-mono tracking-tighter">
                        Verifiserer riks-identitet
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-screen h-screen bg-neutral-900 overflow-hidden">
            {/* Phaser Game Layer */}
            <GameWrapper />

            {/* React UI Overlay Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="p-6 flex flex-col items-start gap-4 pointer-events-auto">
                    {/* Realm & Identity Indicator */}
                    <div className="flex gap-2">
                        <div className="bg-orange-50/90 border-2 border-orange-950/30 p-3 rounded shadow-2xl flex flex-col">
                            <span className="text-[9px] font-black uppercase text-orange-900/50 mb-1 tracking-widest">Aktivt Rike</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-orange-950 uppercase">{roomId}</span>
                                <span className="text-[10px] text-orange-950/40">v1.2</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsCharacterPassOpen(true)}
                            className="bg-orange-100/90 border-2 border-orange-950/30 p-3 rounded shadow-2xl flex flex-col items-center justify-center hover:brightness-105 transition-all active:scale-95 group"
                        >
                            <span className="text-[9px] font-black uppercase text-orange-900/50 mb-1 tracking-widest group-hover:text-orange-900">Karakter</span>
                            <UserCircle className="text-orange-950" size={24} />
                        </button>

                        <button
                            onClick={() => setIsAccountPassOpen(true)}
                            className="bg-yellow-50/90 border-2 border-yellow-600/50 p-3 rounded shadow-2xl flex flex-col items-center justify-center hover:brightness-105 transition-all active:scale-95 group"
                        >
                            <span className="text-[9px] font-black uppercase text-yellow-800/50 mb-1 tracking-widest group-hover:text-yellow-800">Konto</span>
                            <ShieldCheck className="text-yellow-700" size={24} />
                        </button>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="bg-neutral-50/90 border-2 border-neutral-400/50 p-3 rounded shadow-2xl flex flex-col items-center justify-center hover:brightness-105 transition-all active:scale-95 group"
                        >
                            <span className="text-[9px] font-black uppercase text-neutral-500 mb-1 tracking-widest group-hover:text-neutral-800">Meny</span>
                            <SettingsIcon className="text-neutral-700" size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <button
                            onClick={() => setIsMarketOpen(true)}
                            className="px-6 py-2 text-[11px] font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-lg"
                            style={{ backgroundImage: `url(${buttonBg})`, backgroundSize: '100% 100%', color: '#4a3728' }}
                        >
                            Åpne Marked (M)
                        </button>
                        <button
                            onClick={() => setIsInventoryOpen(true)}
                            className="px-6 py-2 text-[11px] font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-lg"
                            style={{ backgroundImage: `url(${buttonBg})`, backgroundSize: '100% 100%', color: '#4a3728' }}
                        >
                            Ryggsekk (B)
                        </button>
                    </div>

                    {/* Interaction Prompt */}
                    {activePrompt && (
                        <div className="mt-8 animate-bounce-slow">
                            <div className="bg-orange-950/90 text-orange-50 px-6 py-3 rounded-full border-2 border-orange-400/50 shadow-2xl backdrop-blur-md flex items-center gap-3">
                                <span className="w-6 h-6 bg-orange-400 text-orange-950 rounded flex items-center justify-center font-black text-xs">E</span>
                                <span className="font-bold tracking-tight">{activePrompt.name}</span>
                            </div>
                        </div>
                    )}
                </div>

                <StatusBars />

                {isMarketOpen && <MarketOverlay onClose={() => setIsMarketOpen(false)} />}
                {isInventoryOpen && <InventoryOverlay onClose={() => setIsInventoryOpen(false)} />}
                {isAccountPassOpen && <AccountPassport onClose={() => setIsAccountPassOpen(false)} />}
                {isCharacterPassOpen && <CharacterPassport onClose={() => setIsCharacterPassOpen(false)} />}
                {isSettingsOpen && <SettingsOverlay onClose={() => setIsSettingsOpen(false)} />}
                <MinigameOverlay />
            </div>
        </div>
    );
};
