'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
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
        id: 'apt_kabilesh_1',
        date: '2026-10-01',
        time: '03:30 PM',
        status: 'PENDING',
        symptoms: 'General health assessment & Siddha consultation',
        user: { name: 'Kabilesh', email: 'kabileshcoding07@gmail.com', phone: '+91 98765 43210' }
    },
    {
        id: 'apt_kabilesh_2',
        date: '2026-09-30',
        time: '06:00 PM',
        status: 'CONFIRMED',
        symptoms: 'Digestive balance & wellness check',
        user: { name: 'Kabilesh', email: 'kabileshcoding07@gmail.com', phone: '+91 98765 43210' }
    },
    {
        id: 'apt_kabilesh_3',
        date: '2026-09-22',
        time: '04:30 PM',
        status: 'PENDING',
        symptoms: 'Follow-up on Siddha dietary guidelines',
        user: { name: 'Kabilesh', email: 'kabileshcoding07@gmail.com', phone: '+91 98765 43210' }
    },
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
    const [refreshing, setRefreshing] = useState(false);

    const mergeAppointments = useCallback((existingList: Appointment[], incoming: any[]): Appointment[] => {
        const map = new Map<string, Appointment>();

        for (const a of defaultDemoQueue) {
            map.set(String(a.id), a);
        }

        for (const a of existingList) {
            if (a && a.id) map.set(String(a.id), a);
        }

        for (const a of incoming) {
            if (!a || !a.id) continue;
            const key = String(a.id);
            const prev = map.get(key);
            map.set(key, {
                id: key,
                date: a.date || prev?.date || new Date().toISOString().split('T')[0],
                time: a.time || prev?.time || '10:00 AM',
                status: a.status || prev?.status || 'PENDING',
                symptoms: a.symptoms || prev?.symptoms || 'General Health Consultation',
                user: {
                    name: a.user?.name || prev?.user?.name || 'Kabilesh',
                    email: a.user?.email || prev?.user?.email || 'kabileshcoding07@gmail.com',
                    phone: a.user?.phone || prev?.user?.phone || '+91 98765 43210'
                }
            });
        }

        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return merged;
    }, []);

    const syncAll = useCallback(async () => {
        let current = [...appointments];

        try {
            const portalApts = JSON.parse(localStorage.getItem('siddha_portal_appointments') || '[]');
            const patientApts = JSON.parse(localStorage.getItem('siddha_appointments') || '[]');
            const localCombined = [...(Array.isArray(portalApts) ? portalApts : []), ...(Array.isArray(patientApts) ? patientApts : [])];
            current = mergeAppointments(current, localCombined);
        } catch { }

        try {
            const res = await fetch('/api/appointments');
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.appointments)) {
                    current = mergeAppointments(current, data.appointments);
                }
            }
        } catch { }

        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('date', { ascending: false });

            if (!error && data && data.length > 0) {
                current = mergeAppointments(current, data);
            }
        } catch { }

        setAppointments(current);
        try {
            localStorage.setItem('siddha_portal_appointments', JSON.stringify(current));
        } catch { }
    }, [appointments, mergeAppointments]);

    const handleManualRefresh = async () => {
        setRefreshing(true);
        await syncAll();
        setTimeout(() => setRefreshing(false), 600);
    };

    useEffect(() => {
        syncAll();

        const onStorage = (e: StorageEvent) => {
            if (e.key === 'siddha_appointments' || e.key === 'siddha_portal_appointments') {
                syncAll();
            }
        };
        window.addEventListener('storage', onStorage);

        const onFocus = () => syncAll();
        window.addEventListener('focus', onFocus);

        const timer = setInterval(() => {
            syncAll();
        }, 3000);

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('focus', onFocus);
            clearInterval(timer);
        };
    }, [syncAll]);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                        style={{ background: 'rgba(14,116,144,0.15)', color: '#22d3ee', border: '1px solid rgba(14,116,144,0.3)' }}>
                        <span>🩺</span>
                        <span>Siddha Clinical Practice Management</span>
                    </div>
                    <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: '#f0fdf4' }}>
                        Welcome back, Dr. Kavitha Rajan
                    </h1>
                    <p className="text-sm" style={{ color: '#6b8f7e' }}>
                        Senior Practitioner · Varmam & Musculoskeletal Therapy
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleManualRefresh}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                        style={{
                            background: 'rgba(14,116,144,0.2)',
                            color: '#22d3ee',
                            border: '1px solid rgba(14,116,144,0.4)',
                        }}
                    >
                        <span className={`inline-block ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
                        <span>{refreshing ? 'Syncing...' : 'Refresh Queue'}</span>
                    </button>
                    <Link href="/portal/appointments" className="btn-primary text-xs py-2 px-4"
                        style={{ background: 'linear-gradient(135deg, #0e7490, #155e75)' }}>
                        Manage Appointments →
                    </Link>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="glass-card p-5" style={{ borderColor: 'rgba(14,116,144,0.2)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b8f7e' }}>Today&apos;s Queue</span>
                        <span className="text-xl">📋</span>
                    </div>
                    <p className="font-playfair text-3xl font-bold" style={{ color: '#f0fdf4' }}>{appointments.length}</p>
                    <p className="text-xs mt-1" style={{ color: '#22d3ee' }}>Patient consultations</p>
                </div>

                <div className="glass-card p-5" style={{ borderColor: 'rgba(234,179,8,0.2)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b8f7e' }}>Pending Review</span>
                        <span className="text-xl">⏳</span>
                    </div>
                    <p className="font-playfair text-3xl font-bold" style={{ color: '#eab308' }}>{pendingCount}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b8f7e' }}>Needs doctor confirmation</p>
                </div>

                <div className="glass-card p-5" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b8f7e' }}>Confirmed</span>
                        <span className="text-xl">✅</span>
                    </div>
                    <p className="font-playfair text-3xl font-bold" style={{ color: '#22c55e' }}>{confirmedCount}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b8f7e' }}>Ready for consultation</p>
                </div>

                <div className="glass-card p-5" style={{ borderColor: 'rgba(59,130,246,0.2)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b8f7e' }}>Completed</span>
                        <span className="text-xl">🏥</span>
                    </div>
                    <p className="font-playfair text-3xl font-bold" style={{ color: '#3b82f6' }}>{completedCount}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b8f7e' }}>Past treatment logs</p>
                </div>
            </div>

            {/* Upcoming Queue Section */}
            <div className="glass-card p-6 mb-8" style={{ borderColor: 'rgba(14,116,144,0.2)' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold" style={{ color: '#f0fdf4' }}>Incoming Appointments</h2>
                    <Link href="/portal/appointments" className="text-xs hover:underline font-semibold" style={{ color: '#22d3ee' }}>
                        View All Queue →
                    </Link>
                </div>

                <div className="space-y-3">
                    {appointments.slice(0, 5).map((apt) => (
                        <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-3"
                            style={{ background: 'rgba(14,116,144,0.06)', border: '1px solid rgba(14,116,144,0.15)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                                    style={{ background: 'rgba(14,116,144,0.2)', color: '#22d3ee' }}>
                                    {(apt.user?.name || 'P')[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm" style={{ color: '#f0fdf4' }}>{apt.user?.name || 'Patient'}</p>
                                    <p className="text-xs" style={{ color: '#6b8f7e' }}>{apt.symptoms || 'General Consultation'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 justify-between sm:justify-end">
                                <div className="text-right">
                                    <p className="text-xs font-semibold" style={{ color: '#f0fdf4' }}>{apt.time}</p>
                                    <p className="text-xs" style={{ color: '#6b8f7e' }}>{apt.date}</p>
                                </div>
                                <span className={`badge ${statusColors[apt.status] || 'badge-pending'}`}>{apt.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
                <Link href="/portal/appointments"
                    className="glass-card p-6 hover:border-cyan-500/40 transition-all flex items-center gap-4 group"
                    style={{ borderColor: 'rgba(14,116,144,0.2)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                        style={{ background: 'rgba(14,116,144,0.15)' }}>
                        📅
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm mb-1" style={{ color: '#f0fdf4' }}>Manage Appointments</h3>
                        <p className="text-xs" style={{ color: '#6b8f7e' }}>Accept, reschedule, or cancel patient bookings</p>
                    </div>
                </Link>

                <Link href="/portal/patients"
                    className="glass-card p-6 hover:border-cyan-500/40 transition-all flex items-center gap-4 group"
                    style={{ borderColor: 'rgba(14,116,144,0.2)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                        style={{ background: 'rgba(14,116,144,0.15)' }}>
                        📋
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm mb-1" style={{ color: '#f0fdf4' }}>EHR Patient Records</h3>
                        <p className="text-xs" style={{ color: '#6b8f7e' }}>View complete medical histories and update treatments</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
