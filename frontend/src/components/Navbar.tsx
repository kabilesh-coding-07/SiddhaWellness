'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n';

const navKeys = [
    { href: '/', key: 'nav.home' },
    { href: '/about', key: 'nav.about' },
    { href: '/services', key: 'nav.services' },
    { href: '/doctors', key: 'nav.doctors' },
    { href: '/blog', key: 'nav.blog' },
    { href: '/contact', key: 'nav.contact' },
];

interface User {
    name: string;
    role: string;
}

import { createClient } from '@/utils/supabase/client';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { lang, setLang, t } = useLanguage();
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('name, role')
                    .eq('id', session.user.id)
                    .single();
                
                setUser({
                    name: profile?.name || session.user.email?.split('@')[0] || 'User',
                    role: profile?.role || 'USER'
                });
            } else {
                setUser(null);
            }
        };
        
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('name, role')
                    .eq('id', session.user.id)
                    .single();
                
                setUser({
                    name: profile?.name || session.user.email?.split('@')[0] || 'User',
                    role: profile?.role || 'USER'
                });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const dashboardHref = user?.role === 'DOCTOR' ? '/doctor' : '/dashboard';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50" style={{
            background: 'rgba(10, 15, 13, 0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(4, 120, 87, 0.15)',
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #047857, #065f46)' }}>
                            <span className="text-xl">🌿</span>
                        </div>
                        <div>
                            <span className="text-xl font-bold gradient-text">Siddha</span>
                            <span className="text-xl font-light" style={{ color: '#a7c4b8' }}>Wellness</span>
                            <p className="text-xs" style={{ color: '#6b8f7e' }}>.in</p>
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navKeys.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-emerald-400"
                                style={{ color: '#a7c4b8' }}
                            >
                                {t(link.key)}
                            </Link>
                        ))}
                    </div>

                    {/* Auth + Language Toggle */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Language Toggle */}
                        <button
                            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                background: 'rgba(212,160,23,0.1)',
                                border: '1px solid rgba(212,160,23,0.25)',
                                color: '#d4a017',
                            }}
                            title={lang === 'en' ? 'Switch to Tamil' : 'Switch to English'}
                        >
                            🌐 {lang === 'en' ? 'தமிழ்' : 'English'}
                        </button>

                        {user ? (
                            <>
                                <Link href={dashboardHref} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-emerald-900/30"
                                    style={{ color: '#34d399', border: '1px solid rgba(4,120,87,0.25)' }}>
                                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                        style={{ background: 'linear-gradient(135deg, #047857, #065f46)', color: '#f0fdf4' }}>
                                        {user.name.charAt(0)}
                                    </span>
                                    {t('common.dashboard')}
                                </Link>
                                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                                    {t('common.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                                    {t('common.login')}
                                </Link>
                                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                                    {t('common.bookNow')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="flex md:hidden items-center gap-2">
                        {/* Mobile Language Toggle */}
                        <button
                            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{ background: 'rgba(212,160,23,0.1)', color: '#d4a017' }}
                        >
                            {lang === 'en' ? 'த' : 'EN'}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg"
                            style={{ color: '#a7c4b8' }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-6 border-t" style={{ borderColor: 'rgba(4,120,87,0.15)' }}>
                        <div className="flex flex-col gap-1 mt-4">
                            {navKeys.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all"
                                    style={{ color: '#a7c4b8' }}
                                >
                                    {t(link.key)}
                                </Link>
                            ))}
                            <div className="flex gap-3 mt-4 px-4">
                                {user ? (
                                    <>
                                        <Link href={dashboardHref} onClick={() => setIsOpen(false)}
                                            className="btn-primary text-sm py-2 px-4 flex-1 text-center">
                                            {t('common.dashboard')}
                                        </Link>
                                        <button onClick={() => { handleLogout(); setIsOpen(false); }}
                                            className="btn-secondary text-sm py-2 px-4 flex-1 text-center">
                                            {t('common.logout')}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="btn-secondary text-sm py-2 px-4 flex-1 text-center">
                                            {t('common.login')}
                                        </Link>
                                        <Link href="/register" className="btn-primary text-sm py-2 px-4 flex-1 text-center">
                                            {t('common.bookNow')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
