'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    symptoms?: string;
    notes?: string;
    user?: { name: string; email: string; phone?: string };
}

export default function DoctorAppointmentsPage() {
    const { t } = useLanguage();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filter, setFilter] = useState('ALL');
    const [noteModal, setNoteModal] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        async function loadAppointments() {
            const stored = localStorage.getItem('user');
            if (!stored) return;
            const user = JSON.parse(stored);

            try {
                // 1. Get doctor_id
                const { data: doctor } = await supabase
                    .from('doctors')
                    .select('id')
                    .eq('userId', user.id)
                    .single();

                if (!doctor) return;

                // 2. Fetch appointments
                const { data: appts, error } = await supabase
                    .from('appointments')
                    .select('*, user:users!appointments_userId_fkey(name, email, phone)')
                    .eq('doctorId', doctor.id)
                    .order('date', { ascending: false });

                if (!error && appts) setAppointments(appts);
            } catch (err) {
                console.error('Error fetching appointments:', err);
            }
        }
        loadAppointments();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status })
                .eq('id', id);

            if (!error) {
                setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
            }
        } catch { /* silently fail */ }
    };

    const saveNote = async (id: string) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ notes: noteText })
                .eq('id', id);

            if (!error) {
                setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, notes: noteText } : a));
            }
        } catch { /* silently fail */ }
        setNoteModal(null);
        setNoteText('');
    };

    const statusColors: Record<string, string> = {
        PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed',
        REJECTED: 'badge-rejected', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled',
    };

    const filtered = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);

    return (
        <div>
            <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">{t('doctor.manageAppointments')}</h1>
            <p className="text-sm mb-8" style={{ color: '#6b8f7e' }}>{t('doctor.manageAppointmentsDesc')}</p>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{
                            background: filter === f ? 'rgba(4,120,87,0.2)' : 'rgba(4,120,87,0.05)',
                            border: `1px solid ${filter === f ? '#059669' : 'rgba(4,120,87,0.1)'}`,
                            color: filter === f ? '#34d399' : '#6b8f7e',
                        }}>
                        {f === 'ALL' ? t('common.viewAll') : t(`doctor.status${f.charAt(0) + f.slice(1).toLowerCase()}`)}
                    </button>
                ))}
            </div>

            {/* Appointment Cards */}
            <div className="space-y-4">
                {filtered.map((apt) => (
                    <div key={apt.id} className="glass-card p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                    style={{ background: 'rgba(4,120,87,0.15)' }}>👤</div>
                                <div>
                                    <p className="font-semibold" style={{ color: '#f0fdf4' }}>{apt.user?.name}</p>
                                    <p className="text-xs" style={{ color: '#6b8f7e' }}>{apt.user?.email} {apt.user?.phone && `· ${apt.user.phone}`}</p>
                                    <p className="text-sm mt-1" style={{ color: '#a7c4b8' }}>
                                        📅 {new Date(apt.date).toLocaleDateString(t('common.locale') === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} {t('doctor.at')} {apt.time}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`badge ${statusColors[apt.status]}`}>{t(`doctor.status${apt.status.charAt(0) + apt.status.slice(1).toLowerCase()}`)}</span>
                                {apt.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                                            {t('doctor.accept')}
                                        </button>
                                        <button onClick={() => updateStatus(apt.id, 'REJECTED')}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                            {t('doctor.reject')}
                                        </button>
                                    </>
                                )}
                                {apt.status === 'CONFIRMED' && (
                                    <button onClick={() => updateStatus(apt.id, 'COMPLETED')}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                        style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
                                        {t('doctor.markComplete')}
                                    </button>
                                )}
                                <button onClick={() => { setNoteModal(apt.id); setNoteText(apt.notes || ''); }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                    style={{ background: 'rgba(4,120,87,0.1)', color: '#34d399', border: '1px solid rgba(4,120,87,0.2)' }}>
                                    {t('doctor.notesBtn')}
                                </button>
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
                                <p className="text-xs font-medium mb-1" style={{ color: '#34d399' }}>{t('doctor.yourNotes')}</p>
                                <p className="text-sm" style={{ color: '#a7c4b8' }}>{apt.notes}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Notes Modal */}
            {noteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setNoteModal(null)}>
                    <div className="glass-card p-8 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}
                        style={{ background: '#111a16', border: '1px solid rgba(4,120,87,0.3)' }}>
                        <h3 className="text-xl font-semibold mb-4" style={{ color: '#f0fdf4' }}>{t('doctor.patientNotes')}</h3>
                        <textarea className="form-input mb-4" rows={5}
                            placeholder={t('doctor.notesPlaceholder')}
                            value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setNoteModal(null)} className="btn-secondary text-sm py-2 px-4">{t('common.cancel')}</button>
                            <button onClick={() => saveNote(noteModal)} className="btn-primary text-sm py-2 px-4">{t('doctor.saveNotes')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
