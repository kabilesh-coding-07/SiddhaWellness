'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    user?: { name: string };
}

export default function DoctorDashboard() {
    const { t } = useLanguage();
    const [user, setUser] = useState<{ id: string, name: string } | null>(null);
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        async function loadData() {
            const stored = localStorage.getItem('user');
            if (!stored) return;
            const userData = JSON.parse(stored);
            setUser(userData);

            try {
                // 1. Get the doctor_id for this user
                const { data: doctor, error: docError } = await supabase
                    .from('doctors')
                    .select('id')
                    .eq('userId', userData.id)
                    .single();

                if (docError || !doctor) return;

                // 2. Fetch appointments for this doctor (including patient info)
                const { data: appts, error: apptError } = await supabase
                    .from('appointments')
                    .select('*, user:users!appointments_userId_fkey(name)')
                    .eq('doctorId', doctor.id)
                    .order('date', { ascending: true });

                if (apptError || !appts) return;

                const today = new Date().toISOString().split('T')[0];
                const todayAppts = appts.filter((a: any) => a.date.startsWith(today));
                
                setTodayAppointments(todayAppts.length > 0 ? todayAppts : appts.slice(0, 4));
                setAllAppointments(appts);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        loadData();
    }, []);

    const statusColors: Record<string, string> = {
        PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed',
        COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled',
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: '#f0fdf4' }}>
                    {t('doctor.goodDay')} <span className="gradient-text">{user?.name || t('doctor.doctorNameFallback')}</span>
                </h1>
                <p className="text-sm" style={{ color: '#6b8f7e' }}>{t('doctor.scheduleOverview')}</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-4 gap-4 mb-10">
                {[
                    { icon: '📅', label: t('doctor.todayAppointments'), value: String(todayAppointments.length), color: '#047857' },
                    { icon: '⏳', label: t('doctor.pendingReview'), value: String(allAppointments.filter((a) => a.status === 'PENDING').length), color: '#d97706' },
                    { icon: '✅', label: t('doctor.completed'), value: String(allAppointments.filter((a) => a.status === 'COMPLETED').length), color: '#059669' },
                    { icon: '👥', label: t('doctor.totalAppointments'), value: String(allAppointments.length), color: '#7c3aed' },
                ].map((s) => (
                    <div key={s.label} className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{s.icon}</span>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: '#f0fdf4' }}>{s.value}</p>
                                <p className="text-xs" style={{ color: '#6b8f7e' }}>{s.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's Schedule */}
            <div className="glass-card p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold" style={{ color: '#f0fdf4' }}>{t('doctor.todaySchedule')}</h2>
                    <Link href="/doctor/appointments" className="text-sm font-medium hover:text-emerald-300" style={{ color: '#34d399' }}>
                        {t('dashboard.viewAllLink')}
                    </Link>
                </div>
                <div className="space-y-3">
                    {todayAppointments.map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl"
                            style={{ background: 'rgba(4,120,87,0.05)', border: '1px solid rgba(4,120,87,0.1)' }}>
                            <div className="flex items-center gap-4">
                                <div className="text-center" style={{ minWidth: '60px' }}>
                                    <p className="text-sm font-bold" style={{ color: '#34d399' }}>{apt.time}</p>
                                </div>
                                <div className="w-px h-8" style={{ background: 'rgba(4,120,87,0.2)' }} />
                                <div>
                                    <p className="font-semibold text-sm" style={{ color: '#f0fdf4' }}>{apt.user?.name}</p>
                                    <p className="text-xs" style={{ color: '#6b8f7e' }}>{t('doctor.consultation')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`badge ${statusColors[apt.status]}`}>{t(`doctor.status${apt.status.charAt(0) + apt.status.slice(1).toLowerCase()}`)}</span>
                                <Link href="/doctor/appointments" className="text-xs px-3 py-1 rounded-lg transition-all hover:bg-emerald-900/30"
                                    style={{ color: '#34d399', border: '1px solid rgba(4,120,87,0.2)' }}>
                                    {t('doctor.view')}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { icon: '📋', title: t('doctor.manageAppointments'), desc: t('doctor.manageDesc'), href: '/doctor/appointments' },
                    { icon: '👥', title: t('doctor.patientRecords'), desc: t('doctor.recordsDesc'), href: '/doctor/patients' },
                    { icon: '🕐', title: t('doctor.setAvailability'), desc: t('doctor.availabilityDesc'), href: '/doctor/availability' },
                ].map((action) => (
                    <Link key={action.title} href={action.href} className="glass-card p-6 group">
                        <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{action.icon}</span>
                        <h3 className="font-semibold mb-1" style={{ color: '#f0fdf4' }}>{action.title}</h3>
                        <p className="text-sm" style={{ color: '#6b8f7e' }}>{action.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
