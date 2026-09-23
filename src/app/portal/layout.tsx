'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '@/providers/user-context';

const portalSidebarLinks = [
    { href: '/portal', label: 'Dashboard Overview', icon: '📊' },
    { href: '/portal/appointments', label: 'Appointment Queue', icon: '📋' },
    { href: '/portal/patients', label: 'Patient Records (EHR)', icon: '👥' },
    { href: '/portal/availability', label: 'Schedule & Availability', icon: '🕐' },
    { href: '/portal/blogs', label: 'Health Articles (CMS)', icon: '📝' },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { profile: user, signOut } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // If on /portal/login, render without clinical sidebar layout
    if (pathname === '/portal/login') {
        return <>{children}</>;
    }

    const activeUser = user && (user.role === 'DOCTOR' || user.role === 'ADMIN') ? user : {
        id: 'demo_doc_1',
        name: 'Dr. Kavitha Rajan',
        email: 'dr.kavitha@siddhawellness.in',
        role: 'DOCTOR',
        phone: '+91 98765 43210'
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/portal/login');
    };

    return (
        <div className="min-h-screen flex bg-[#0a0f0d] text-[#f0fdf4]">
            {/* Clinical Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0d1411] border-r border-cyan-950/40 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6">
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyan-950/40">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-md"
                            style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)', color: 'white' }}>
                            🩺
                        </div>
                        <div>
                            <span className="font-bold text-base tracking-tight" style={{ color: '#22d3ee' }}>Siddha Clinical</span>
                            <p className="text-[11px] font-medium" style={{ color: '#6b8f7e' }}>Practice Workstation</p>
                        </div>
                    </div>

                    {/* Doctor Header Badge */}
                    <div className="glass-card p-3.5 mb-6" style={{ borderColor: 'rgba(14,116,144,0.3)', background: 'rgba(14,116,144,0.08)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                style={{ background: 'linear-gradient(135deg, #0e7490, #155e75)', color: 'white' }}>
                                {activeUser.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-semibold truncate" style={{ color: '#f0fdf4' }}>{activeUser.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="text-[10px] font-medium" style={{ color: '#22d3ee' }}>Doctor Station Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1.5">
                        {portalSidebarLinks.map((link) => {
                            const isActive = link.href === '/portal'
                                ? pathname === '/portal'
                                : pathname.startsWith(link.href);
                            return (
                                <Link key={link.href} href={link.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                                    style={isActive ? { borderColor: 'rgba(14,116,144,0.4)', color: '#22d3ee', background: 'rgba(14,116,144,0.12)' } : undefined}>
                                    <span>{link.icon}</span>
                                    <span className="text-xs font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Sidebar Actions */}
                <div className="p-6 border-t border-cyan-950/40 space-y-2">
                    <Link href="/" target="_blank" className="sidebar-link hover:text-emerald-400 py-2">
                        <span>🌐</span>
                        <span className="text-xs">View Public Site ↗</span>
                    </Link>
                    <button onClick={handleLogout} className="sidebar-link w-full text-left hover:text-red-400 py-2 cursor-pointer">
                        <span>🚪</span>
                        <span className="text-xs">Log out of Portal</span>
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main Clinical Content Area */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Clean Top Bar */}
                <header className="sticky top-0 z-20 bg-[#0d1411]/90 backdrop-blur-md border-b border-cyan-950/40 px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 rounded-lg text-cyan-400 hover:bg-cyan-950/40"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="hidden sm:block">
                            <span className="text-xs font-semibold" style={{ color: '#22d3ee' }}>🏥 Clinical Practice Management</span>
                            <span className="text-xs text-gray-500 mx-2">·</span>
                            <span className="text-xs text-gray-400">Dr. Kavitha Rajan (Varmam Specialist)</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/portal/appointments" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(14,116,144,0.15)', color: '#22d3ee', border: '1px solid rgba(14,116,144,0.3)' }}>
                            <span>📋</span>
                            <span>Live Queue</span>
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
