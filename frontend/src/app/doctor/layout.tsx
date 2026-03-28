'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const sidebarLinks = [
    { href: '/doctor', label: 'Dashboard', icon: '📊' },
    { href: '/doctor/appointments', label: 'Appointments', icon: '📋' },
    { href: '/doctor/patients', label: 'Patients', icon: '👥' },
    { href: '/doctor/availability', label: 'Availability', icon: '🕐' },
    { href: '/doctor/blogs', label: 'Blog Management', icon: '📝' },
];

import { createClient } from '@/utils/supabase/client';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('name, email, role')
                    .eq('id', session.user.id)
                    .single();
                
                if (profile) {
                    if (profile.role !== 'DOCTOR') {
                        router.push('/dashboard');
                    } else {
                        setUser(profile);
                    }
                }
            } else {
                router.push('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex" style={{ background: '#0a0f0d' }}>
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 pt-20 transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ background: '#0d1411', borderRight: '1px solid rgba(4,120,87,0.15)' }}>
                <div className="p-6">
                    <div className="glass-card p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                style={{ background: 'linear-gradient(135deg, #047857, #065f46)', color: 'white' }}>
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: '#f0fdf4' }}>{user.name}</p>
                                <div className="flex items-center gap-1">
                                    <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                                    <span className="text-xs" style={{ color: '#34d399' }}>Doctor Portal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {sidebarLinks.map((link) => {
                            const isActive = link.href === '/doctor'
                                ? pathname === '/doctor'
                                : pathname.startsWith(link.href);
                            return (
                                <Link key={link.href} href={link.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`sidebar-link ${isActive ? 'active' : ''}`}>
                                    <span>{link.icon}</span>
                                    <span className="text-sm">{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(4,120,87,0.15)' }}>
                        <button onClick={handleLogout} className="sidebar-link w-full text-left hover:text-red-400">
                            <span>🚪</span>
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 md:ml-64">
                <div className="md:hidden fixed top-20 left-0 right-0 z-20 p-4"
                    style={{ background: 'rgba(10,15,13,0.95)', borderBottom: '1px solid rgba(4,120,87,0.15)' }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center gap-2 text-sm" style={{ color: '#a7c4b8' }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Menu
                    </button>
                </div>
                <div className="p-6 md:p-10 mt-16 md:mt-0">{children}</div>
            </div>
        </div>
    );
}
