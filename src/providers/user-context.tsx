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
}

const UserContext = createContext<UserContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => {},
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
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    }, [supabase]);

    useEffect(() => {
        // Initial session check
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            }
            setLoading(false);
        };

        initSession();

        // Auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
            if (session) {
                setUser(session.user);
                if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') {
                    await fetchProfile(session.user.id);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    return (
        <UserContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
