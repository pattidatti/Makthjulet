import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Shield, Lock, Mail, User as UserIcon, X, Loader2 } from 'lucide-react';
import parchmentBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panel_beige.png';
import buttonBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/buttonLong_beige.png';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { login, register, loginWithGoogle } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isRegister) {
                await register(email, password, name);
            } else {
                await login(email, password);
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const panelStyle = {
        backgroundImage: `url(${parchmentBg})`,
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-md p-10 flex flex-col shadow-2xl"
                style={panelStyle}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-orange-900/40 hover:text-orange-950 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-orange-900/10 rounded-full flex items-center justify-center mb-4 border-2 border-orange-950/20">
                        <Shield className="text-orange-900" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-orange-950 uppercase tracking-tighter">
                        {isRegister ? 'Skap Identitet' : 'Velkommen Tilbake'}
                    </h2>
                    <p className="text-orange-900/60 font-serif text-sm italic">
                        {isRegister ? 'Din reise begynner med et navn...' : 'Sjekk inn i riket ditt'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {isRegister && (
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-900/40" size={18} />
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ditt Navn"
                                className="w-full pl-12 pr-4 py-3 bg-white/40 border-2 border-orange-950/10 rounded font-serif text-orange-950 focus:outline-none focus:border-orange-950/30 transition-colors placeholder:text-orange-900/30"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-900/40" size={18} />
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-post"
                            className="w-full pl-12 pr-4 py-3 bg-white/40 border-2 border-orange-950/10 rounded font-serif text-orange-950 focus:outline-none focus:border-orange-950/30 transition-colors placeholder:text-orange-900/30"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-900/40" size={18} />
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Passord"
                            className="w-full pl-12 pr-4 py-3 bg-white/40 border-2 border-orange-950/10 rounded font-serif text-orange-950 focus:outline-none focus:border-orange-950/30 transition-colors placeholder:text-orange-900/30"
                        />
                    </div>

                    {error && (
                        <p className="text-red-800 text-xs font-bold text-center bg-red-100/50 p-2 rounded border border-red-800/10">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 pb-5 font-black uppercase text-lg transition-all hover:brightness-110 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                        style={buttonStyle}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isRegister ? 'Skap Konto' : 'Sjekk Inn')}
                    </button>

                    <div className="relative my-4 flex items-center">
                        <div className="flex-grow border-t border-orange-950/10"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-black uppercase text-orange-900/30 tracking-widest">Eller</span>
                        <div className="flex-grow border-t border-orange-950/10"></div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await loginWithGoogle();
                                onClose();
                            } catch (err: any) {
                                setError(err.message);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="w-full py-3 bg-white/60 hover:bg-white/80 border-2 border-orange-950/10 rounded flex items-center justify-center gap-3 transition-all text-orange-950 font-bold text-sm shadow-sm active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" fill="#EA4335" />
                        </svg>
                        Fortsett med Google
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-orange-950/10 flex flex-col items-center gap-2">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-orange-900/60 text-xs font-bold hover:text-orange-950 transition-colors uppercase tracking-widest"
                    >
                        {isRegister ? 'Har du allerede konto? Logg inn' : 'Ingen konto? Skap en nå'}
                    </button>
                    <button
                        onClick={onClose}
                        className="text-orange-900/40 text-[10px] font-black hover:text-orange-950 transition-colors uppercase tracking-[0.2em]"
                    >
                        Fortsett som gjest
                    </button>
                </div>
            </div>
        </div>
    );
};
