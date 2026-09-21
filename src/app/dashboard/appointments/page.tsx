'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    symptoms?: string;
    notes?: string;
    doctor?: { user: { name: string }; specialty: string };
}

import { supabase } from '@/lib/supabase';

export default function AppointmentsPage() {
    const { t } = useLanguage();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filter, setFilter] = useState('ALL');

    const defaultDemoAppointments: Appointment[] = [
        {
            id: 'demo_1',
            date: new Date(Date.now() + 86400000 * 2).toISOString(),
            time: '10:00 AM',
            status: 'CONFIRMED',
            symptoms: 'Chronic shoulder & back pain, stiffness in morning',
            notes: 'Advised Varmam massage therapy & herbal oils twice daily',
            doctor: { user: { name: 'Dr. Kavitha Rajan' }, specialty: 'Varmam & Pain Management' }
        },
        {
            id: 'demo_2',
            date: new Date(Date.now() - 86400000 * 5).toISOString(),
            time: '02:30 PM',
            status: 'COMPLETED',
            symptoms: 'Digestive issues and seasonal fatigue',
            notes: 'Prescribed Thirikadugu Chooranam with honey after meals',
            doctor: { user: { name: 'Dr. Senthil Kumar' }, specialty: 'Herbal Medicine' }
        }
    ];

    const cancelAppointment = async (id: string) => {
        try {
            await supabase
                .from('appointments')
                .update({ status: 'CANCELLED' })
                .eq('id', id);
        } catch { /* silently fail */ }

        // Update state and local storage
        setAppointments((prev) => {
            const updated = prev.map((a) => a.id === id ? { ...a, status: 'CANCELLED' } : a);
            try {
                const local = JSON.parse(localStorage.getItem('siddha_appointments') || '[]');
                const updatedLocal = local.map((a: any) => a.id === id ? { ...a, status: 'CANCELLED' } : a);
                localStorage.setItem('siddha_appointments', JSON.stringify(updatedLocal));
            } catch { }
            return updated;
        });
    };

    useEffect(() => {
        const loadAppointments = async () => {
            let loaded: Appointment[] = [];
            try {
                const local = JSON.parse(localStorage.getItem('siddha_appointments') || '[]');
                if (Array.isArray(local)) loaded = local;
            } catch { }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { data, error } = await supabase
                        .from('appointments')
                        .select('*, doctor:doctors(specialty, user:users(name))')
                        .eq('userId', session.user.id)
                        .order('date', { ascending: false });

                    if (!error && data && data.length > 0) {
                        loaded = [...data, ...loaded];
                    }
                }
            } catch { }

            if (loaded.length === 0) {
                setAppointments(defaultDemoAppointments);
            } else {
                setAppointments(loaded);
            }
        };

        loadAppointments();
    }, []);

    const statusColors: Record<string, string> = {
        PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed',
        REJECTED: 'badge-rejected', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled',
    };

    const filtered = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);

    return (
        <div>
            <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">{t('appointments.title')}</h1>
            <p className="text-sm mb-8" style={{ color: '#6b8f7e' }}>{t('appointments.subtitle')}</p>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{
                            background: filter === f ? 'rgba(4,120,87,0.2)' : 'rgba(4,120,87,0.05)',
                            border: `1px solid ${filter === f ? '#059669' : 'rgba(4,120,87,0.1)'}`,
                            color: filter === f ? '#34d399' : '#6b8f7e',
                        }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Appointment Cards */}
            <div className="space-y-4">
                {filtered.map((apt) => (
                    <div key={apt.id} className="glass-card p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                                    style={{ background: 'rgba(4,120,87,0.15)' }}>👨‍⚕️</div>
                                <div>
                                    <p className="font-semibold" style={{ color: '#f0fdf4' }}>{apt.doctor?.user.name}</p>
                                    <p className="text-xs mb-1" style={{ color: '#34d399' }}>{apt.doctor?.specialty}</p>
                                    <p className="text-sm" style={{ color: '#a7c4b8' }}>
                                        📅 {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        {' '}at {apt.time}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`badge ${statusColors[apt.status]}`}>{apt.status}</span>
                                {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                                    <button onClick={() => cancelAppointment(apt.id)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                        {t('appointments.cancelBtn')}
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
                ))}
            </div>
        </div>
    );
}
