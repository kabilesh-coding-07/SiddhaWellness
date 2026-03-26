'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    symptoms?: string;
    doctor?: { user: { name: string } };
}

export default function DashboardPage() {
    const { t } = useLanguage();
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));

        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/appointments/my`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.json())
                .then((data) => { if (Array.isArray(data)) setAppointments(data); })
                .catch(() => { });
        }
    }, []);

    const statusColors: Record<string, string> = {
        PENDING: 'badge-pending',
        CONFIRMED: 'badge-confirmed',
        REJECTED: 'badge-rejected',
        COMPLETED: 'badge-completed',
        CANCELLED: 'badge-cancelled',
    };

    return (
        <div>
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: '#f0fdf4' }}>
                    {t('dashboard.welcomeBack')} <span className="gradient-text">{user?.name || 'User'}</span>
                </h1>
                <p className="text-sm" style={{ color: '#6b8f7e' }}>{t('dashboard.manageJourney')}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {[
                    { icon: '📅', title: t('dashboard.bookAppointment'), desc: t('dashboard.scheduleNext'), href: '/dashboard/book', color: '#047857' },
                    { icon: '📋', title: t('dashboard.viewAppointments'), desc: t('dashboard.checkHistory'), href: '/dashboard/appointments', color: '#0e7490' },
                    { icon: '👤', title: t('dashboard.myProfile'), desc: t('dashboard.updateDetails'), href: '/dashboard/profile', color: '#7c3aed' },
                ].map((action) => (
                    <Link key={action.title} href={action.href} className="glass-card p-6 group cursor-pointer">
                        <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{action.icon}</span>
                        <h3 className="font-semibold mb-1" style={{ color: '#f0fdf4' }}>{action.title}</h3>
                        <p className="text-sm" style={{ color: '#6b8f7e' }}>{action.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Upcoming Appointments */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold" style={{ color: '#f0fdf4' }}>{t('dashboard.upcomingTitle')}</h2>
                    <Link href="/dashboard/appointments" className="text-sm font-medium hover:text-emerald-300" style={{ color: '#34d399' }}>
                        {t('dashboard.viewAllLink')}
                    </Link>
                </div>

                {appointments.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">📅</span>
                        <p className="text-lg font-semibold mb-2" style={{ color: '#a7c4b8' }}>{t('dashboard.noAppointments')}</p>
                        <p className="text-sm mb-6" style={{ color: '#6b8f7e' }}>{t('dashboard.noAppointmentsDesc')}</p>
                        <Link href="/dashboard/book" className="btn-primary">{t('common.bookNow')} →</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.slice(0, 5).map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl"
                                style={{ background: 'rgba(4,120,87,0.05)', border: '1px solid rgba(4,120,87,0.1)' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(4,120,87,0.15)' }}>
                                        <span className="text-xl">👨‍⚕️</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: '#f0fdf4' }}>
                                            {apt.doctor?.user.name || 'Doctor'}
                                        </p>
                                        <p className="text-xs" style={{ color: '#6b8f7e' }}>
                                            {new Date(apt.date).toLocaleDateString()} at {apt.time}
                                        </p>
                                    </div>
                                </div>
                                <span className={`badge ${statusColors[apt.status] || 'badge-pending'}`}>{apt.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
