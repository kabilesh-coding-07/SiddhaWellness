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

    const buildProfileFromSession = (authUser: AuthUser): Profile => {
        const metadata = authUser.user_metadata || {};
        const name = metadata.full_name || metadata.name || metadata.preferred_username || authUser.email?.split('@')[0] || 'Kabilesh';
        const role = (metadata.role as any) || 'USER';
        return {
            id: authUser.id,
            name: name,
            email: authUser.email || 'kabileshcoding07@gmail.com',
            role: role,
            phone: metadata.phone || '+91 98765 43210',
        };
    };

    const fetchProfile = useCallback(async (userId: string, authUser: AuthUser) => {
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
        } catch { }

        // Fallback to OAuth metadata if DB row not found
        const fallback = buildProfileFromSession(authUser);
        setProfile(fallback);
        return fallback;
    }, [supabase]);

    useEffect(() => {
        const initSession = async () => {
            try {
                // 1. Check Supabase session first (real OAuth or email login)
                const { data: { session } } = await supabase.auth.getSession();
                if (session && session.user) {
                    try { localStorage.removeItem('siddha_demo_user'); } catch { }
                    setUser(session.user);
                    await fetchProfile(session.user.id, session.user);
                    setLoading(false);
                    return;
                }
            } catch { }

            // 2. Check Local Demo Session only if no active Supabase session
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

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            if (session && session.user) {
                try { localStorage.removeItem('siddha_demo_user'); } catch { }
                setUser(session.user);
                await fetchProfile(session.user.id, session.user);
            } else if (event === 'SIGNED_OUT') {
                try { localStorage.removeItem('siddha_demo_user'); } catch { }
                setUser(null);
                setProfile(null);
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
            name: name || 'Kabilesh',
            email: email || 'kabileshcoding07@gmail.com',
            role: 'USER',
            phone: '+91 98765 43210',
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
            localStorage.removeItem('siddha_portal_auth');
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
