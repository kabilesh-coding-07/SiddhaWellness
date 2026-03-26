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

export default function AppointmentsPage() {
    const { t } = useLanguage();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filter, setFilter] = useState('ALL');

    const cancelAppointment = async (id: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/appointments/${id}/cancel`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'CANCELLED' } : a));
            }
        } catch { /* silently fail */ }
    };

    useEffect(() => {
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
