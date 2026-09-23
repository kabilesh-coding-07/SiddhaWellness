'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '@/providers/user-context';
import NotificationBell from '@/components/NotificationBell';

const sidebarLinks = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/book', label: 'Book Appointment', icon: '📅' },
    { href: '/dashboard/appointments', label: 'My Appointments', icon: '📋' },
    { href: '/dashboard/profile', label: 'My Profile', icon: '👤' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { profile: user, signOut } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const activeUser = user || {
        id: 'patient_demo',
        name: 'Kabilesh',
        email: 'kabileshcoding07@gmail.com',
        role: 'USER',
        phone: '+91 98765 43210'
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex bg-[#0a0f0d] text-[#f0fdf4]">
            {/* Patient Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0d1411] border-r border-emerald-950/40 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6">
                    {/* Brand Header */}
                    <Link href="/" className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-950/40 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #047857, #065f46)' }}>
                            🌿
                        </div>
                        <div>
                            <span className="font-bold text-base gradient-text">SiddhaWellness</span>
                            <p className="text-[11px]" style={{ color: '#6b8f7e' }}>Patient Portal</p>
                        </div>
                    </Link>

                    {/* Patient Profile Card */}
                    <div className="glass-card p-3.5 mb-6" style={{ borderColor: 'rgba(4,120,87,0.2)', background: 'rgba(4,120,87,0.06)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                style={{ background: 'rgba(4,120,87,0.25)', color: '#34d399' }}>
                                {activeUser.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-semibold truncate" style={{ color: '#f0fdf4' }}>{activeUser.name}</p>
                                <p className="text-[11px] truncate" style={{ color: '#6b8f7e' }}>{activeUser.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1.5">
                        {sidebarLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`sidebar-link ${isActive ? 'active' : ''}`}>
                                    <span>{link.icon}</span>
                                    <span className="text-xs font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Sidebar Actions */}
                <div className="p-6 border-t border-emerald-950/40 space-y-2">
                    <Link href="/" className="sidebar-link hover:text-emerald-400 py-2">
                        <span>🌐</span>
                        <span className="text-xs">View Public Website ↗</span>
                    </Link>
                    <button onClick={handleLogout} className="sidebar-link w-full text-left hover:text-red-400 py-2 cursor-pointer">
                        <span>🚪</span>
                        <span className="text-xs">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main Patient Content Area */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Clean Top Bar */}
                <header className="sticky top-0 z-20 bg-[#0d1411]/90 backdrop-blur-md border-b border-emerald-950/40 px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 rounded-lg text-emerald-400 hover:bg-emerald-950/40"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: '#6b8f7e' }}>
                            <span>🌿 Siddha Patient Health & Consultation Workstation</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <Link href="/dashboard/book" className="btn-primary text-xs py-1.5 px-3.5 hidden sm:inline-flex items-center gap-1.5">
                            <span>+</span>
                            <span>Book Consultation</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-xs px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-950/30 border border-red-900/30 cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page View Body */}
                <main className="flex-1 p-6 md:p-10 max-w-7xl w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
