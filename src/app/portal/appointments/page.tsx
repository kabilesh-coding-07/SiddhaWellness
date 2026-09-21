'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/user-context';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    symptoms?: string;
    notes?: string;
    user?: { name: string; email?: string; phone?: string };
}

const defaultDoctorAppointments: Appointment[] = [
    {
        id: 'doc_apt_1',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        status: 'PENDING',
        symptoms: 'Chronic lower back pain & morning lumbar stiffness',
        notes: 'Recommended initial Varmam pressure point therapy assessment.',
        user: { name: 'Ramya Shankar', email: 'ramya@example.com', phone: '+91 98765 43210' }
    },
    {
        id: 'doc_apt_2',
        date: new Date().toISOString().split('T')[0],
        time: '11:30 AM',
        status: 'CONFIRMED',
        symptoms: 'Skin flare-ups and eczema on forearms',
        notes: 'Prescribed herbal ointment and internal blood purification decoction.',
        user: { name: 'Karthik Murugan', email: 'karthik@example.com', phone: '+91 87654 32109' }
    },
    {
        id: 'doc_apt_3',
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        time: '02:00 PM',
        status: 'COMPLETED',
        symptoms: 'Joint arthritis & knee inflammation',
        notes: 'Follow up after 2 weeks of Thokkanam oil therapy. 60% reduction in pain reported.',
        user: { name: 'Lakshmi Priya', email: 'lakshmi@example.com', phone: '+91 76543 21098' }
    }
];

export default function PortalAppointmentsPage() {
    const { profile: user } = useUser();
    const [appointments, setAppointments] = useState<Appointment[]>(defaultDoctorAppointments);
    const [filter, setFilter] = useState('ALL');
    const [noteModal, setNoteModal] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        const loadAppointments = async () => {
            // 1. Fetch from Supabase
            let supabaseAppts: Appointment[] = [];
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select('id, date, time, status, symptoms, notes, doctorId, user:users(name, email, phone)')
                    .order('date', { ascending: false });

                if (!error && data && data.length > 0) {
                    supabaseAppts = data.map((a: any) => ({
                        id: String(a.id),
                        date: a.date,
                        time: a.time,
                        status: a.status || 'PENDING',
                        symptoms: a.symptoms || 'General Health Consultation',
                        notes: a.notes || '',
                        user: {
                            name: a.user?.name || (a.user?.email ? a.user.email.split('@')[0] : 'Kabilesh'),
                            email: a.user?.email || 'kabileshcoding07@gmail.com',
                            phone: a.user?.phone || '+91 98765 43210'
                        }
                    }));
                }
            } catch { }

            // 2. Read from patient local storage
            let localPatientAppts: Appointment[] = [];
            try {
                const stored = JSON.parse(localStorage.getItem('siddha_appointments') || '[]');
                if (Array.isArray(stored)) {
                    localPatientAppts = stored.map((a: any) => ({
                        id: String(a.id),
                        date: a.date,
                        time: a.time,
                        status: a.status || 'PENDING',
                        symptoms: a.symptoms || 'General Health Consultation',
                        notes: a.notes || '',
                        user: {
                            name: a.user?.name || 'Kabilesh',
                            email: a.user?.email || 'kabileshcoding07@gmail.com',
                            phone: a.user?.phone || '+91 98765 43210'
                        }
                    }));
                }
            } catch { }

            // 3. Read from portal local storage
            let localPortalAppts: Appointment[] = [];
            try {
                const stored = JSON.parse(localStorage.getItem('siddha_portal_appointments') || '[]');
                if (Array.isArray(stored)) {
                    localPortalAppts = stored;
                }
            } catch { }

            // 4. Merge all together: Default demo items -> Portal items -> Patient items -> Supabase items
            const appointmentMap = new Map<string, Appointment>();

            for (const a of defaultDoctorAppointments) {
                appointmentMap.set(a.id, a);
            }
            for (const a of localPortalAppts) {
                appointmentMap.set(a.id, a);
            }
            for (const a of localPatientAppts) {
                appointmentMap.set(a.id, a);
            }
            for (const a of supabaseAppts) {
                appointmentMap.set(a.id, a);
            }

            const merged = Array.from(appointmentMap.values());
            setAppointments(merged);
            try {
                localStorage.setItem('siddha_portal_appointments', JSON.stringify(merged));
            } catch { }
        };

        loadAppointments();
    }, [user]);

    const updateStatus = async (id: string, status: string) => {
        try {
            await supabase
                .from('appointments')
                .update({ status })
                .eq('id', id);
        } catch { }

        setAppointments((prev) => {
            const updated = prev.map((a) => a.id === id ? { ...a, status } : a);
            try {
                localStorage.setItem('siddha_portal_appointments', JSON.stringify(updated));
            } catch { }
            return updated;
        });

        // Synchronize with patient appointments storage
        try {
            const patientApts = JSON.parse(localStorage.getItem('siddha_appointments') || '[]');
            if (Array.isArray(patientApts)) {
                const updatedPatients = patientApts.map((a: any) => a.id === id ? { ...a, status } : a);
                localStorage.setItem('siddha_appointments', JSON.stringify(updatedPatients));
            }
        } catch { }
    };

    const saveNote = async (id: string) => {
        try {
            await supabase
                .from('appointments')
                .update({ notes: noteText })
                .eq('id', id);
        } catch { }

        setAppointments((prev) => {
            const updated = prev.map((a) => a.id === id ? { ...a, notes: noteText } : a);
            try {
                localStorage.setItem('siddha_portal_appointments', JSON.stringify(updated));
            } catch { }
            return updated;
        });

        try {
            const patientApts = JSON.parse(localStorage.getItem('siddha_appointments') || '[]');
            if (Array.isArray(patientApts)) {
                const updatedPatients = patientApts.map((a: any) => a.id === id ? { ...a, notes: noteText } : a);
                localStorage.setItem('siddha_appointments', JSON.stringify(updatedPatients));
            }
        } catch { }

        setNoteModal(null);
        setNoteText('');
    };

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
            <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">Appointment Queue & Approvals</h1>
            <p className="text-sm mb-8" style={{ color: '#6b8f7e' }}>Review incoming patient bookings, confirm consultations, or add diagnostic case notes.</p>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
                {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        style={{
                            background: filter === f ? 'rgba(14,116,144,0.25)' : 'rgba(14,116,144,0.05)',
                            border: `1px solid ${filter === f ? '#0891b2' : 'rgba(14,116,144,0.15)'}`,
                            color: filter === f ? '#22d3ee' : '#6b8f7e',
                        }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Appointment Cards */}
            <div className="space-y-4">
                {filtered.map((apt) => (
                    <div key={apt.id} className="glass-card p-6" style={{ borderColor: 'rgba(14,116,144,0.2)' }}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                    style={{ background: 'rgba(14,116,144,0.15)' }}>👤</div>
                                <div>
                                    <p className="font-semibold" style={{ color: '#f0fdf4' }}>{apt.user?.name}</p>
                                    <p className="text-xs" style={{ color: '#6b8f7e' }}>{apt.user?.email || 'Patient'} {apt.user?.phone && `· ${apt.user.phone}`}</p>
                                    <p className="text-sm mt-1" style={{ color: '#a7c4b8' }}>
                                        📅 {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.time}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`badge ${statusColors[apt.status] || 'badge-pending'}`}>{apt.status}</span>
                                {apt.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                                            ✓ Accept
                                        </button>
                                        <button onClick={() => updateStatus(apt.id, 'REJECTED')}
                                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                            ✕ Reject
                                        </button>
                                    </>
                                )}
                                {apt.status === 'CONFIRMED' && (
                                    <button onClick={() => updateStatus(apt.id, 'COMPLETED')}
                                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                        style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
                                        ✓ Mark Complete
                                    </button>
                                )}
                                <button onClick={() => { setNoteModal(apt.id); setNoteText(apt.notes || ''); }}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                    style={{ background: 'rgba(14,116,144,0.15)', color: '#22d3ee', border: '1px solid rgba(14,116,144,0.3)' }}>
                                    📝 Notes
                                </button>
                            </div>
                        </div>

                        {apt.symptoms && (
                            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(14,116,144,0.15)' }}>
                                <p className="text-xs font-medium mb-1" style={{ color: '#6b8f7e' }}>Reported Symptoms</p>
                                <p className="text-sm" style={{ color: '#a7c4b8' }}>{apt.symptoms}</p>
                            </div>
                        )}
                        {apt.notes && (
                            <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(14,116,144,0.08)' }}>
                                <p className="text-xs font-medium mb-1" style={{ color: '#22d3ee' }}>Doctor Diagnostic Notes</p>
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
                        style={{ background: '#111a16', border: '1px solid rgba(14,116,144,0.4)' }}>
                        <h3 className="text-xl font-semibold mb-4" style={{ color: '#f0fdf4' }}>Clinical Case Notes & Prescription</h3>
                        <textarea className="form-input mb-4" rows={5}
                            placeholder="Enter diagnosis, prescribed medicines (Chooranam, Lehyam), or dietary instructions..."
                            value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setNoteModal(null)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                            <button onClick={() => saveNote(noteModal)} className="btn-primary text-sm py-2 px-4"
                                style={{ background: 'linear-gradient(135deg, #0e7490, #155e75)' }}>
                                Save Clinical Notes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
