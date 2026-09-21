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

    // If on /portal/login, render without sidebar layout
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
        <div className="min-h-screen flex" style={{ background: '#0a0f0d' }}>
            {/* Clinical Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 pt-20 transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ background: '#0d1411', borderRight: '1px solid rgba(14,116,144,0.2)' }}>
                <div className="p-6">
                    {/* Doctor Header Badge */}
                    <div className="glass-card p-4 mb-6" style={{ borderColor: 'rgba(14,116,144,0.3)', background: 'rgba(14,116,144,0.08)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                                style={{ background: 'linear-gradient(135deg, #0e7490, #155e75)', color: 'white' }}>
                                {activeUser.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: '#f0fdf4' }}>{activeUser.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="pulse-dot" style={{ width: 6, height: 6, background: '#22d3ee' }} />
                                    <span className="text-xs font-medium" style={{ color: '#22d3ee' }}>Clinical Workstation</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-1">
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
                                    <span className="text-sm">{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-8 pt-6 space-y-2" style={{ borderTop: '1px solid rgba(14,116,144,0.15)' }}>
                        <Link href="/" target="_blank" className="sidebar-link hover:text-emerald-400">
                            <span>🌐</span>
                            <span className="text-sm">View Public Site ↗</span>
                        </Link>
                        <button onClick={handleLogout} className="sidebar-link w-full text-left hover:text-red-400">
                            <span>🚪</span>
                            <span className="text-sm">Log out of Portal</span>
                        </button>
                    </div>
                </div>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main Clinical Content */}
            <div className="flex-1 md:ml-64">
                <div className="md:hidden fixed top-20 left-0 right-0 z-20 p-4"
                    style={{ background: 'rgba(10,15,13,0.95)', borderBottom: '1px solid rgba(14,116,144,0.2)' }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center gap-2 text-sm" style={{ color: '#22d3ee' }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Clinical Menu
                    </button>
                </div>
                <div className="p-6 md:p-10 mt-16 md:mt-0">{children}</div>
            </div>
        </div>
    );
}
