'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/user-context';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    symptoms?: string;
    user?: { name: string; email?: string; phone?: string };
}

const defaultDemoQueue: Appointment[] = [
    {
        id: 'doc_apt_1',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        status: 'PENDING',
        symptoms: 'Chronic lower back pain & morning lumbar stiffness',
        user: { name: 'Ramya Shankar', phone: '+91 98765 43210' }
    },
    {
        id: 'doc_apt_2',
        date: new Date().toISOString().split('T')[0],
        time: '11:30 AM',
        status: 'CONFIRMED',
        symptoms: 'Skin flare-ups and eczema on forearms',
        user: { name: 'Karthik Murugan', phone: '+91 87654 32109' }
    },
    {
        id: 'doc_apt_3',
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        time: '02:00 PM',
        status: 'COMPLETED',
        symptoms: 'Joint arthritis & knee inflammation',
        user: { name: 'Lakshmi Priya', phone: '+91 76543 21098' }
    }
];

export default function PortalDashboard() {
    const { profile: user } = useUser();
    const [appointments, setAppointments] = useState<Appointment[]>(defaultDemoQueue);

    useEffect(() => {
        const loadDoctorData = async () => {
            try {
                if (user) {
                    const { data: doctor } = await supabase
                        .from('doctors')
                        .select('id')
                        .eq('userId', user.id)
                        .single();

                    if (doctor) {
                        const { data: appts } = await supabase
                            .from('appointments')
                            .select('*, user:users!appointments_userId_fkey(name, email, phone)')
                            .eq('doctorId', doctor.id)
                            .order('date', { ascending: false });

                        if (appts && appts.length > 0) {
                            setAppointments(appts);
                        }
                    }
                }
            } catch { }
        };

        loadDoctorData();
    }, [user]);

    const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
    const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
    const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

    const statusColors: Record<string, string> = {
        PENDING: 'badge-pending',
        CONFIRMED: 'badge-confirmed',
        COMPLETED: 'badge-completed',
        CANCELLED: 'badge-cancelled',
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ background: 'rgba(14,116,144,0.15)', color: '#22d3ee', border: '1px solid rgba(14,116,144,0.3)' }}>
                    <span>🩺</span>
                    <span>Siddha Clinical Practice Management</span>
                </div>
                <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: '#f0fdf4' }}>
                    Welcome, <span className="gradient-text">{user?.name || 'Dr. Kavitha Rajan'}</span>
                </h1>
                <p className="text-sm" style={{ color: '#6b8f7e' }}>Today&apos;s patient appointment queue, clinical schedule, and consultation records.</p>
            </div>

            {/* Quick Metrics */}
            <div className="grid sm:grid-cols-4 gap-4 mb-10">
                {[
                    { icon: '⏳', label: 'Pending Requests', value: String(pendingCount), color: '#facc15' },
                    { icon: '📅', label: 'Confirmed Today', value: String(confirmedCount), color: '#34d399' },
                    { icon: '✅', label: 'Completed Consultations', value: String(completedCount), color: '#38bdf8' },
                    { icon: '👥', label: 'Total In Queue', value: String(appointments.length), color: '#a78bfa' },
                ].map((s) => (
                    <div key={s.label} className="glass-card p-5" style={{ borderColor: 'rgba(14,116,144,0.2)' }}>
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

            {/* Today's Queue */}
            <div className="glass-card p-6 mb-8" style={{ borderColor: 'rgba(14,116,144,0.2)' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold" style={{ color: '#f0fdf4' }}>Recent Patient Queue</h2>
                    <Link href="/portal/appointments" className="text-sm font-medium hover:text-cyan-300" style={{ color: '#22d3ee' }}>
                        Manage Full Queue →
                    </Link>
                </div>
                <div className="space-y-3">
                    {appointments.slice(0, 4).map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl"
                            style={{ background: 'rgba(14,116,144,0.06)', border: '1px solid rgba(14,116,144,0.15)' }}>
                            <div className="flex items-center gap-4">
                                <div className="text-center" style={{ minWidth: '60px' }}>
                                    <p className="text-sm font-bold" style={{ color: '#22d3ee' }}>{apt.time}</p>
                                </div>
                                <div className="w-px h-8" style={{ background: 'rgba(14,116,144,0.3)' }} />
                                <div>
                                    <p className="font-semibold text-sm" style={{ color: '#f0fdf4' }}>{apt.user?.name || 'Patient'}</p>
                                    <p className="text-xs" style={{ color: '#a7c4b8' }}>{apt.symptoms || 'General Consultation'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`badge ${statusColors[apt.status] || 'badge-pending'}`}>{apt.status}</span>
                                <Link href="/portal/appointments" className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-cyan-900/30"
                                    style={{ color: '#22d3ee', border: '1px solid rgba(14,116,144,0.3)' }}>
                                    Review
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { icon: '📋', title: 'Manage Appointments', desc: 'Accept, reject, and add prescription notes', href: '/portal/appointments' },
                    { icon: '👥', title: 'Patient Records (EHR)', desc: 'View past medical histories and treatment logs', href: '/portal/patients' },
                    { icon: '🕐', title: 'Set Clinic Availability', desc: 'Update consultation hours and slot durations', href: '/portal/availability' },
                ].map((action) => (
                    <Link key={action.title} href={action.href} className="glass-card p-6 group cursor-pointer" style={{ borderColor: 'rgba(14,116,144,0.2)' }}>
                        <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{action.icon}</span>
                        <h3 className="font-semibold mb-1" style={{ color: '#f0fdf4' }}>{action.title}</h3>
                        <p className="text-sm" style={{ color: '#6b8f7e' }}>{action.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
