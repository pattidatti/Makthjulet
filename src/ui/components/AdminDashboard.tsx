import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Server, Plus, Trash2, Cpu, Globe, ArrowLeft, Terminal, Users } from 'lucide-react';

export const AdminDashboard = () => {
    const navigate = useNavigate();
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

            <p className="mt-12 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">
                Secure Arch-Nexus Connection • Makthjulet Internal Use Only
            </p>
        </div>
    );
};
