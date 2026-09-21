'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    symptoms?: string;
    notes?: string;
    doctor?: { user: { name: string }; specialty: string };
}

export default function AppointmentsPage() {
    const { t } = useLanguage();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filter, setFilter] = useState('ALL');

    const defaultDemoAppointments: Appointment[] = [
        {
            id: 'apt_kabilesh_1',
            date: '2026-10-01',
            time: '03:30 PM',
            status: 'PENDING',
            symptoms: 'General health assessment & Siddha consultation',
            notes: '',
            doctor: { user: { name: 'Dr. Kavitha Rajan' }, specialty: 'Varmam & Pain Management' }
        },
        {
            id: 'apt_kabilesh_2',
            date: '2026-09-30',
            time: '06:00 PM',
            status: 'CONFIRMED',
            symptoms: 'Digestive balance & wellness check',
            notes: 'Confirmed appointment. Prescribed preliminary herbal consultation.',
            doctor: { user: { name: 'Dr. Kavitha Rajan' }, specialty: 'Varmam & Pain Management' }
        },
        {
            id: 'apt_kabilesh_3',
            date: '2026-09-22',
            time: '04:30 PM',
            status: 'PENDING',
            symptoms: 'Follow-up on Siddha dietary guidelines',
            notes: '',
            doctor: { user: { name: 'Dr. Kavitha Rajan' }, specialty: 'Varmam & Pain Management' }
        }
    ];

    const cancelAppointment = async (id: string) => {
        try {
            await supabase
                .from('appointments')
                .update({ status: 'CANCELLED' })
                .eq('id', id);
        } catch { }

        try {
            await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateStatus', id, status: 'CANCELLED' }),
            });
        } catch { }

        // Update state and local storage
        setAppointments((prev) => {
            const updated = prev.map((a) => a.id === id ? { ...a, status: 'CANCELLED' } : a);
            try {
                const local = JSON.parse(localStorage.getItem('siddha_appointments') || '[]');
                const updatedLocal = local.map((a: any) => a.id === id ? { ...a, status: 'CANCELLED' } : a);
                localStorage.setItem('siddha_appointments', JSON.stringify(updatedLocal));
            } catch { }

            try {
                const portal = JSON.parse(localStorage.getItem('siddha_portal_appointments') || '[]');
                const updatedPortal = portal.map((a: any) => a.id === id ? { ...a, status: 'CANCELLED' } : a);
                localStorage.setItem('siddha_portal_appointments', JSON.stringify(updatedPortal));
            } catch { }

            return updated;
        });
    };

    const loadAppointments = useCallback(async () => {
        const appointmentMap = new Map<string, Appointment>();

        // 1. Baseline
        for (const item of defaultDemoAppointments) {
            appointmentMap.set(item.id, item);
        }

        // 2. Local storage
        try {
            const local = JSON.parse(localStorage.getItem('siddha_appointments') || '[]');
            if (Array.isArray(local)) {
                for (const item of local) {
                    if (item && item.id) appointmentMap.set(String(item.id), item);
                }
            }
        } catch { }

        // 3. Server API
        try {
            const res = await fetch('/api/appointments');
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.appointments)) {
                    for (const item of data.appointments) {
                        if (item && item.id) appointmentMap.set(String(item.id), item);
                    }
                }
            }
        } catch { }

        // 4. Supabase
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data, error } = await supabase
                    .from('appointments')
                    .select('*, doctor:doctors(specialty, user:users(name))')
                    .eq('userId', session.user.id)
                    .order('date', { ascending: false });

                if (!error && data && data.length > 0) {
                    for (const item of data) {
                        if (item && item.id) appointmentMap.set(String(item.id), item);
                    }
                }
            }
        } catch { }

        const list = Array.from(appointmentMap.values());
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAppointments(list);
    }, []);

    useEffect(() => {
        loadAppointments();

        const onStorage = (e: StorageEvent) => {
            if (e.key === 'siddha_appointments' || e.key === 'siddha_portal_appointments') {
                loadAppointments();
            }
        };
        window.addEventListener('storage', onStorage);

        const onFocus = () => loadAppointments();
        window.addEventListener('focus', onFocus);

        const timer = setInterval(() => {
            loadAppointments();
        }, 3000);

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('focus', onFocus);
            clearInterval(timer);
        };
    }, [loadAppointments]);

    const statusColors: Record<string, string> = {
        PENDING: 'badge-pending',
        CONFIRMED: 'badge-confirmed',
        REJECTED: 'badge-rejected',
        COMPLETED: 'badge-completed',
        CANCELLED: 'badge-cancelled',
    };

    const filtered = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);

    return (
        <div>
            <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">{t('appointments.title')}</h1>
            <p className="text-sm mb-8" style={{ color: '#6b8f7e' }}>{t('appointments.subtitle')}</p>

            {/* Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'btn-gold' : 'btn-secondary'}`}
                        style={{ cursor: 'pointer' }}>
                        {f} {f === 'ALL' ? `(${appointments.length})` : `(${appointments.filter(a => a.status === f).length})`}
                    </button>
                ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <span className="text-4xl mb-4 block">📅</span>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: '#f0fdf4' }}>{t('appointments.noAppointments')}</h3>
                    <p className="text-sm mb-6" style={{ color: '#6b8f7e' }}>{t('appointments.noAppointmentsDesc')}</p>
                    <a href="/dashboard/book" className="btn-gold inline-flex">{t('appointments.bookNow')}</a>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((apt) => {
                        const doctorName = apt.doctor?.user?.name || 'Dr. Kavitha Rajan';
                        const specialty = apt.doctor?.specialty || 'Siddha Specialist';
                        const formattedDate = new Date(apt.date).toLocaleDateString('en-IN', {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        });

                        return (
                            <div key={apt.id} className="glass-card p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                            style={{ background: 'rgba(4,120,87,0.15)' }}>🌿</div>
                                        <div>
                                            <p className="font-semibold" style={{ color: '#f0fdf4' }}>{doctorName}</p>
                                            <p className="text-xs" style={{ color: '#6b8f7e' }}>{specialty}</p>
                                            <p className="text-sm mt-1" style={{ color: '#34d399' }}>
                                                📅 {formattedDate} at {apt.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`badge ${statusColors[apt.status] || 'badge-pending'}`}>{apt.status}</span>
                                        {apt.status === 'PENDING' && (
                                            <button onClick={() => cancelAppointment(apt.id)}
                                                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                                                style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', cursor: 'pointer' }}>
                                                {t('appointments.cancel')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {apt.symptoms && (
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(4,120,87,0.1)' }}>
                                        <p className="text-xs font-medium mb-1" style={{ color: '#6b8f7e' }}>{t('appointments.symptoms')}</p>
                                        <p className="text-sm" style={{ color: '#a7c4b8' }}>{apt.symptoms}</p>
                                    </div>
                                )}
                                {apt.notes && (
                                    <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(4,120,87,0.08)' }}>
                                        <p className="text-xs font-medium mb-1" style={{ color: '#34d399' }}>{t('appointments.doctorNotes')}</p>
                                        <p className="text-sm" style={{ color: '#a7c4b8' }}>{apt.notes}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
