import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    type User
} from 'firebase/auth';
import { ref, onValue, set, get } from 'firebase/database';
import { auth, db } from '../config/firebase';
import type { SimulationAccount, SimulationPlayer } from '../game/types/simulation';

interface AuthContextType {
    user: User | null;
    account: SimulationAccount | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    createCharacter: (realmId: string, name: string) => Promise<SimulationPlayer>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [account, setAccount] = useState<SimulationAccount | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeAccount: (() => void) | null = null;

        // ULTRATHINK Fail-safe: Force loading to stop after 7 seconds if Firebase is hanging
        const loadingTimeout = setTimeout(() => {
            if (loading) {
                console.warn("Auth/Database connection timed out. Forcing UI render.");
                setLoading(false);
            }
        }, 7000);

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            console.log("Auth State Changed:", currentUser ? `User: ${currentUser.uid}` : "No User");

            // Clean up previous account listener
            if (unsubscribeAccount) {
                unsubscribeAccount();
                unsubscribeAccount = null;
            }

            if (currentUser) {
                setUser(currentUser);
                const accountRef = ref(db, `accounts/${currentUser.uid}`);

                try {
                    unsubscribeAccount = onValue(accountRef, (snapshot) => {
                        console.log("Account Data Received:", snapshot.exists() ? "Exists" : "New Account Needed");
                        if (snapshot.exists()) {
                            setAccount(snapshot.val());
                        } else {
                            const newAccount: SimulationAccount = {
                                uid: currentUser.uid,
                                displayName: currentUser.displayName || (currentUser.isAnonymous ? 'Gjest' : 'Eventyrer'),
                                globalXp: 0,
                                globalLevel: 1,
                                accountAge: Date.now(),
                                characterRoster: {},
                                achievements: []
                            };
                            set(accountRef, newAccount).catch(err => console.error("Failed to init account:", err));
                        }
                        setLoading(false);
                        clearTimeout(loadingTimeout);
                    }, (error) => {
                        console.error("Database connection blocked (Rules?):", error);
                        setLoading(false);
                        clearTimeout(loadingTimeout);
                    });
                } catch (err) {
                    console.error("Database listener setup crashed:", err);
                    setLoading(false);
                    clearTimeout(loadingTimeout);
                }
            } else {
                console.log("Attempting Anonymous Login...");
                try {
                    await signInAnonymously(auth);
                } catch (err) {
                    console.error("Anonymous Sign-in failed (Disabled in Firebase console?):", err);
                    setLoading(false);
                    clearTimeout(loadingTimeout);
                }
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeAccount) unsubscribeAccount();
            clearTimeout(loadingTimeout);
        };
    }, []);

    const login = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass).then(() => { });

    const register = async (email: string, pass: string, name: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        // Display name is set on the account object, not just Firebase Auth
        const newAccount: SimulationAccount = {
            uid: result.user.uid,
            displayName: name,
            globalXp: 0,
            globalLevel: 1,
            accountAge: Date.now(),
            characterRoster: {},
            achievements: []
        };
        await set(ref(db, `accounts/${result.user.uid}`), newAccount);
    };

    const logout = () => signOut(auth);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        // Account initialization is handled by onAuthStateChanged
    };

    const createCharacter = async (realmId: string, name: string): Promise<SimulationPlayer> => {
        if (!user) throw new Error("Må være logget inn for å skape karakter.");

        const characterId = 'char-' + Math.random().toString(36).substr(2, 9);
        const newCharacter: SimulationPlayer = {
            id: characterId,
            uid: user.uid,
            name: name,
            role: 'PEASANT',
            regionId: 'capital',
            position: { x: 720, y: 720 }, // Default center for 30x30 map (16px * 30 * 3 / 2)
            resources: {
                gold: 150, grain: 20, wood: 10, stone: 5, iron_ore: 0,
                wool: 0, honey: 0, meat: 0, egg: 0, ore: 0,
                flour: 0, bread: 5, plank: 0, iron_ingot: 0,
                cloth: 0, glass: 0, omelette: 0,
                swords: 0, armor: 0, favor: 0
            },
            inventory: [],
            equipment: {},
            status: { hp: 100, stamina: 100, morale: 100, legitimacy: 0, isJailed: false },
            stats: { level: 1, xp: 0, reputation: 0 },
            lastActive: Date.now()
        };

        // 1. Write to Realm
        await set(ref(db, `rooms/${realmId}/players/${characterId}`), newCharacter);

        // 2. Add to Account Roster
        const rosterPath = `accounts/${user.uid}/characterRoster/${realmId}`;
        const existingRosterSnap = await get(ref(db, rosterPath));
        const currentRoster = existingRosterSnap.exists() ? existingRosterSnap.val() : [];
        await set(ref(db, rosterPath), [...currentRoster, characterId]);

        return newCharacter;
    };

    return (
        <AuthContext.Provider value={{ user, account, loading, login, register, logout, loginWithGoogle, createCharacter }}>
            {loading ? (
                <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-[9999]">
                    <div className="w-16 h-16 border-4 border-orange-900/20 border-t-orange-600 rounded-full animate-spin shadow-[0_0_20px_rgba(234,179,8,0.2)]" />
                    <p className="text-orange-100/40 font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
                        Kobler til riket...
                    </p>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
