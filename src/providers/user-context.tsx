'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User as Profile } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { User as AuthUser } from '@supabase/supabase-js';

interface UserContextType {
    user: AuthUser | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    loginDemoUser: (role: 'USER' | 'DOCTOR', name?: string, email?: string) => void;
}

const UserContext = createContext<UserContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => {},
    loginDemoUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setProfile(data);
                return data;
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
        return null;
    }, [supabase]);

    useEffect(() => {
        const initSession = async () => {
            try {
                // 1. Check Supabase session
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setUser(session.user);
                    const p = await fetchProfile(session.user.id);
                    if (!p) {
                        setProfile({
                            id: session.user.id,
                            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                            email: session.user.email || '',
                            role: (session.user.user_metadata?.role as any) || 'USER',
                            phone: session.user.user_metadata?.phone || '',
                        });
                    }
                    setLoading(false);
                    return;
                }
            } catch { }

            // 2. Check Local Demo Session
            try {
                const savedDemo = localStorage.getItem('siddha_demo_user');
                if (savedDemo) {
                    const parsed = JSON.parse(savedDemo);
                    setProfile(parsed);
                }
            } catch { }

            setLoading(false);
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
            if (session) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            } else {
                const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('siddha_demo_user') : null;
                if (savedDemo) {
                    try {
                        setProfile(JSON.parse(savedDemo));
                    } catch {
                        setUser(null);
                        setProfile(null);
                    }
                } else {
                    setUser(null);
                    setProfile(null);
                }
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile]);

    const loginDemoUser = (role: 'USER' | 'DOCTOR', name?: string, email?: string) => {
        const demoProfile: Profile = role === 'DOCTOR' ? {
            id: 'demo_doc_1',
            name: name || 'Dr. Kavitha Rajan',
            email: email || 'dr.kavitha@siddhawellness.in',
            role: 'DOCTOR',
            phone: '+91 98765 43210',
        } : {
            id: 'demo_user_1',
            name: name || 'Ananya Sharma',
            email: email || 'ananya@example.com',
            role: 'USER',
            phone: '+91 91234 56789',
        };

        setProfile(demoProfile);
        try {
            localStorage.setItem('siddha_demo_user', JSON.stringify(demoProfile));
        } catch { }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch { }
        try {
            localStorage.removeItem('siddha_demo_user');
        } catch { }
        setUser(null);
        setProfile(null);
    };

    return (
        <UserContext.Provider value={{ user, profile, loading, signOut, loginDemoUser }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
