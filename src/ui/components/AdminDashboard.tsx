import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Server, Plus, Trash2, Cpu, Globe, ArrowLeft, Terminal, Users, Search, Save } from 'lucide-react';
import { db } from '../../config/firebase';
import { ref, get, update, set } from 'firebase/database';
import { useAuth } from '../AuthContext';
import type { SimulationPlayer } from '../../game/types/simulation';

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [scannedPlayers, setScannedPlayers] = useState<(SimulationPlayer & { foundInRealm: string })[]>([]);
    const [loadingScan, setLoadingScan] = useState(false);
    const [realms, setRealms] = useState([
        { id: 'VALHALL', riders: 12, status: 'Active', load: '12%' },
        { id: 'MIDGARD', riders: 45, status: 'Active', load: '45%' },
        { id: 'NIDAVELLIR', riders: 8, status: 'Active', load: '5%' }
    ]);

    const createRealm = () => {
        const name = prompt('Navn på nytt rike:');
        if (name) {
            setRealms([...realms, { id: name.toUpperCase(), riders: 0, status: 'Provisioning', load: '0%' }]);
        }
    };

    const scanForOrphans = async () => {
        setLoadingScan(true);
        setScannedPlayers([]);
        const realmsToScan = ['VALHALL', 'MIDGARD', 'NIDAVELLIR'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allFound: (SimulationPlayer & { foundInRealm: string })[] = [];

        try {
            console.log("Starting scan...");
            for (const realm of realmsToScan) {
                console.log(`Scanning ${realm}...`);
                const snapshot = await get(ref(db, `rooms/${realm}/players`));
                if (snapshot.exists()) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const players: SimulationPlayer[] = Object.values(snapshot.val() as any);
                    console.log(`Found ${players.length} in ${realm}`);
                    players.forEach(p => allFound.push({ ...p, foundInRealm: realm }));
                } else {
                    console.log(`No players in ${realm}`);
                }
            }

            console.log("Total found:", allFound.length);
            setScannedPlayers(allFound);
            if (allFound.length === 0) {
                alert("Søk ferdig: Fant INGEN spillere i databasen.");
            }
        } catch (error) {
            console.error("Scan failed:", error);
            alert("Kunne ikke scanne - sjekk konsoll (F12) for detaljer.");
        } finally {
            setLoadingScan(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const claimCharacter = async (char: SimulationPlayer & { foundInRealm: string }) => {
        if (!user || !window.confirm(`Er du sikker på at du vil koble "${char.name}" (fra ${char.foundInRealm}) til din konto?`)) return;

        try {
            // 1. Update Character UID using the realm found
            await update(ref(db, `rooms/${char.foundInRealm}/players/${char.id}`), { uid: user.uid });

            // 2. Add to Account Roster for that specific realm
            const rosterPath = `accounts/${user.uid}/characterRoster/${char.foundInRealm}`;
            const rosterSnap = await get(ref(db, rosterPath));
            const currentRoster = rosterSnap.exists() ? rosterSnap.val() : [];

            if (!currentRoster.includes(char.id)) {
                await set(ref(db, rosterPath), [...currentRoster, char.id]);
            }

            alert(`Suksess! "${char.name}" er reddet i ${char.foundInRealm}.`);
            scanForOrphans(); // Refresh
        } catch (error) {
            console.error("Claim failed:", error);
            alert("Redning feilet.");
        }
    };


    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-mono p-12 overflow-x-hidden">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                        <Shield className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase text-white">Admin Portalen</h1>
                        <p className="text-[10px] text-indigo-400 font-bold tracking-[0.3em]">Architect Context v1.2</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-bold"
                >
                    <ArrowLeft size={16} /> Tilbake til Gateway
                </button>
            </div>

            {/* Stats Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl">
                    <div className="text-indigo-400 mb-2"><Globe size={20} /></div>
                    <div className="text-3xl font-black text-white">{realms.length}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Aktive Riker</div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl">
                    <div className="text-emerald-400 mb-2"><Users size={20} /></div>
                    <div className="text-3xl font-black text-white">65</div>
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Totale Spillere</div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl">
                    <div className="text-amber-400 mb-2"><Cpu size={20} /></div>
                    <div className="text-3xl font-black text-white">12ms</div>
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Database Latency</div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl">
                    <div className="text-rose-400 mb-2"><Terminal size={20} /></div>
                    <div className="text-3xl font-black text-white">0</div>
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Errors 24h</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
                    <h2 className="text-lg font-black text-white flex items-center gap-3">
                        <Server size={20} className="text-indigo-400" /> Server Management
                    </h2>
                    <button
                        onClick={createRealm}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={16} /> Opprett Nytt Rike
                    </button>
                </div>

                <div className="divide-y divide-white/5">
                    {realms.map((realm) => (
                        <div key={realm.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5">
                                    <span className="text-lg font-black text-indigo-400">{realm.id[0]}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-widest">{realm.id}</p>
                                    <div className="flex gap-4 mt-1">
                                        <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                                            <Users size={10} /> {realm.riders} Spillere
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                                            <Cpu size={10} /> {realm.load} Load
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20">
                                    {realm.status}
                                </div>
                                <button className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RESCUE TOOL */}
            <div className="max-w-6xl mx-auto mt-12 bg-amber-950/20 border border-amber-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <div className="p-8 border-b border-amber-500/10 flex items-center justify-between bg-amber-900/10 backdrop-blur-md">
                    <h2 className="text-lg font-black text-amber-500 flex items-center gap-3">
                        <Search size={20} /> Character Rescue Tool (Emergency)
                    </h2>
                    <button
                        onClick={scanForOrphans}
                        disabled={loadingScan}
                        className="bg-amber-600 hover:bg-amber-500 text-amber-950 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loadingScan ? <Cpu className="animate-spin" size={16} /> : <Search size={16} />}
                        Scan Valhall
                    </button>
                </div>

                <div className="max-h-96 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scannedPlayers.map((player) => (
                        <div key={player.id} className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col gap-2 group hover:border-amber-500/30 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white text-sm">{player.name} <span className="text-[9px] text-amber-500/50 ml-2">({player.foundInRealm})</span></h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{player.role} • Lvl {player.stats?.level || 1}</p>
                                    <p className="text-[9px] text-slate-600 font-mono mt-1">{player.id}</p>
                                    <p className="text-[9px] text-slate-600 font-mono">UID: {player.uid?.substring(0, 8)}...</p>
                                </div>
                                {user && player.uid !== user.uid && (
                                    <button
                                        onClick={() => claimCharacter(player)}
                                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-emerald-950 p-2 rounded-lg transition-all"
                                        title="Claim Ownership"
                                    >
                                        <Save size={16} />
                                    </button>
                                )}
                                {user && player.uid === user.uid && (
                                    <span className="text-emerald-500 text-[10px] uppercase font-black tracking-widest bg-emerald-500/10 px-2 py-1 rounded">Eier</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {scannedPlayers.length === 0 && !loadingScan && (
                        <div className="col-span-full text-center text-slate-600 italic py-8">
                            Klikk "Scan Valhall" for å finne tapte sjeler...
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-12 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">
                Secure Arch-Nexus Connection • Makthjulet Internal Use Only
            </p>
        </div>
    );
};
