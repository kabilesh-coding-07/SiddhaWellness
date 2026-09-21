'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/user-context';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    symptoms?: string;
    notes?: string;
    doctor?: { specialty?: string; user?: { name: string } };
    user?: { name: string; email?: string; phone?: string };
}

const defaultDoctorAppointments: Appointment[] = [
    {
        id: 'apt_kabilesh_1',
        date: '2026-10-01',
        time: '03:30 PM',
        status: 'PENDING',
        symptoms: 'General health assessment & Siddha consultation',
        notes: '',
        user: { name: 'Kabilesh', email: 'kabileshcoding07@gmail.com', phone: '+91 98765 43210' }
    },
    {
        id: 'apt_kabilesh_2',
        date: '2026-09-30',
        time: '06:00 PM',
        status: 'CONFIRMED',
        symptoms: 'Digestive balance & wellness check',
        notes: 'Confirmed appointment. Prescribed preliminary herbal consultation.',
        user: { name: 'Kabilesh', email: 'kabileshcoding07@gmail.com', phone: '+91 98765 43210' }
    },
    {
        id: 'apt_kabilesh_3',
        date: '2026-09-22',
        time: '04:30 PM',
        status: 'PENDING',
        symptoms: 'Follow-up on Siddha dietary guidelines',
        notes: '',
        user: { name: 'Kabilesh', email: 'kabileshcoding07@gmail.com', phone: '+91 98765 43210' }
    },
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

function resolveStatus(prevStatus?: string, nextStatus?: string): string {
    const priority: Record<string, number> = {
        'CANCELLED': 4,
        'REJECTED': 4,
        'COMPLETED': 3,
        'CONFIRMED': 2,
        'PENDING': 1,
    };
    if (!nextStatus) return prevStatus || 'PENDING';
    if (!prevStatus) return nextStatus;
    const pPrev = priority[prevStatus] || 1;
    const pNext = priority[nextStatus] || 1;
    return pNext >= pPrev ? nextStatus : prevStatus;
}

export default function PortalAppointmentsPage() {
    const { profile: user } = useUser();
    const [appointments, setAppointments] = useState<Appointment[]>(defaultDoctorAppointments);
    const [filter, setFilter] = useState('ALL');
    const [noteModal, setNoteModal] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const isUpdatingRef = useRef(false);

    const getStatusOverrides = (): Record<string, string> => {
        try {
            return JSON.parse(localStorage.getItem('siddha_status_overrides') || '{}');
        } catch {
            return {};
        }
    };

    const mergeAppointments = useCallback((existingList: Appointment[], incoming: any[]): Appointment[] => {
        const overrides = getStatusOverrides();
        const map = new Map<string, Appointment>();

        // 1. Base default doctor appointments
        for (const a of defaultDoctorAppointments) {
            const finalStatus = overrides[a.id] || a.status;
            map.set(String(a.id), { ...a, status: finalStatus });
        }

        // 2. Existing items in current state
        for (const a of existingList) {
            if (!a || !a.id) continue;
            const key = String(a.id);
            const prev = map.get(key);
            const finalStatus = overrides[key] || resolveStatus(prev?.status, a.status);
            map.set(key, { ...a, status: finalStatus });
        }

        // 3. Incoming items from storage / API / Supabase
        for (const a of incoming) {
            if (!a || !a.id) continue;
            const key = String(a.id);
            const prev = map.get(key);
            const finalStatus = overrides[key] || resolveStatus(prev?.status, a.status);
            map.set(key, {
                id: key,
                date: a.date || prev?.date || new Date().toISOString().split('T')[0],
                time: a.time || prev?.time || '10:00 AM',
                status: finalStatus,
                symptoms: a.symptoms || prev?.symptoms || 'General Health Consultation',
                notes: a.notes !== undefined ? a.notes : (prev?.notes || ''),
                doctor: a.doctor || prev?.doctor,
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
        if (isUpdatingRef.current) return;

        setAppointments((prev) => {
            let current = [...prev];
            try {
                const portalApts = JSON.parse(localStorage.getItem('siddha_portal_appointments') || '[]');
                const patientApts = JSON.parse(localStorage.getItem('siddha_appointments') || '[]');
                const localCombined = [...(Array.isArray(portalApts) ? portalApts : []), ...(Array.isArray(patientApts) ? patientApts : [])];
                current = mergeAppointments(current, localCombined);
            } catch { }
            return current;
        });

        // Async API fetch
        try {
            const res = await fetch('/api/appointments');
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.appointments)) {
                    setAppointments((prev) => mergeAppointments(prev, data.appointments));
                }
            }
        } catch { }

        // Async Supabase fetch
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('date', { ascending: false });

            if (!error && data && data.length > 0) {
                setAppointments((prev) => mergeAppointments(prev, data));
            }
        } catch { }
    }, [mergeAppointments]);

    const handleManualRefresh = async () => {
        setRefreshing(true);
        await syncAll();
        setTimeout(() => setRefreshing(false), 600);
    };

    useEffect(() => {
        syncAll();

        const onStorage = () => syncAll();
        window.addEventListener('storage', onStorage);
        window.addEventListener('siddha_sync', onStorage);
        window.addEventListener('focus', onStorage);

        const timer = setInterval(() => {
            syncAll();
        }, 3000);

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('siddha_sync', onStorage);
            window.removeEventListener('focus', onStorage);
            clearInterval(timer);
        };
    }, [syncAll]);

    const updateStatus = async (id: string, status: string) => {
        isUpdatingRef.current = true;

        // 1. Save override permanently in localStorage
        try {
            const overrides = getStatusOverrides();
            overrides[id] = status;
            localStorage.setItem('siddha_status_overrides', JSON.stringify(overrides));
        } catch { }

        // 2. Optimistic instant state update
        setAppointments((prev) => {
            const updated = prev.map((a) => a.id === id ? { ...a, status } : a);
            try {
                localStorage.setItem('siddha_portal_appointments', JSON.stringify(updated));
            } catch { }
            return updated;
        });

        // 3. Update patient storage
        try {
            const patientApts = JSON.parse(localStorage.getItem('siddha_appointments') || '[]');
            if (Array.isArray(patientApts)) {
                const updatedPatients = patientApts.map((a: any) => a.id === id ? { ...a, status } : a);
                localStorage.setItem('siddha_appointments', JSON.stringify(updatedPatients));
            }
        } catch { }

        // 4. Notify all tabs
        try {
            window.dispatchEvent(new Event('siddha_sync'));
        } catch { }

        // 5. Post to Server API
        try {
            await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateStatus', id, status }),
            });
        } catch { }

        // 6. Post to Supabase
        try {
            await supabase
                .from('appointments')
                .update({ status })
                .eq('id', id);
        } catch { }

        setTimeout(() => {
            isUpdatingRef.current = false;
        }, 500);
    };

    const saveNote = async (id: string) => {
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

        try {
            window.dispatchEvent(new Event('siddha_sync'));
        } catch { }

        try {
            await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateNotes', id, notes: noteText }),
            });
        } catch { }

        try {
            await supabase
                .from('appointments')
                .update({ notes: noteText })
                .eq('id', id);
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
    const pendingCount = appointments.filter(a => a.status === 'PENDING').length;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">Appointment Queue & Approvals</h1>
                    <p className="text-sm" style={{ color: '#6b8f7e' }}>
                        Review incoming patient bookings, confirm consultations, or add diagnostic case notes.
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
                        <span>{refreshing ? 'Syncing...' : 'Sync Live Queue'}</span>
                    </button>
                    {pendingCount > 0 && (
                        <div className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)' }}>
                            ⚡ {pendingCount} Pending Approval
                        </div>
                    )}
                </div>
            </div>

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
                        {f} {f === 'ALL' ? `(${appointments.length})` : `(${appointments.filter(a => a.status === f).length})`}
                    </button>
                ))}
            </div>

            {/* Appointment Cards */}
            <div className="space-y-4">
                {filtered.map((apt) => (
                    <div key={apt.id} className="glass-card p-6" style={{ borderColor: 'rgba(14,116,144,0.2)' }}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                                    style={{ background: 'rgba(14,116,144,0.15)' }}>👤</div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-base" style={{ color: '#f0fdf4' }}>{apt.user?.name || 'Patient'}</p>
                                        <span className={`badge ${statusColors[apt.status] || 'badge-pending'}`}>{apt.status}</span>
                                    </div>
                                    <p className="text-xs mt-0.5" style={{ color: '#6b8f7e' }}>
                                        {apt.user?.email || 'patient@example.com'} {apt.user?.phone && `· ${apt.user.phone}`}
                                    </p>
                                    <p className="text-sm font-medium mt-1.5" style={{ color: '#34d399' }}>
                                        📅 {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {apt.time}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {apt.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-105"
                                            style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.4)' }}>
                                            ✓ Accept & Confirm
                                        </button>
                                        <button onClick={() => updateStatus(apt.id, 'REJECTED')}
                                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-105"
                                            style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                                            ✕ Reject
                                        </button>
                                    </>
                                )}
                                {apt.status === 'CONFIRMED' && (
                                    <button onClick={() => updateStatus(apt.id, 'COMPLETED')}
                                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-105"
                                        style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.4)' }}>
                                        ✓ Mark as Completed
                                    </button>
                                )}
                                <button onClick={() => { setNoteModal(apt.id); setNoteText(apt.notes || ''); }}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-105"
                                    style={{ background: 'rgba(14,116,144,0.15)', color: '#22d3ee', border: '1px solid rgba(14,116,144,0.3)' }}>
                                    📝 Clinical Notes
                                </button>
                            </div>
                        </div>

                        {apt.symptoms && (
                            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(14,116,144,0.15)' }}>
                                <p className="text-xs font-medium mb-1" style={{ color: '#6b8f7e' }}>Reported Symptoms & Consultation Request</p>
                                <p className="text-sm" style={{ color: '#a7c4b8' }}>{apt.symptoms}</p>
                            </div>
                        )}
                        {apt.notes && (
                            <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(14,116,144,0.08)' }}>
                                <p className="text-xs font-medium mb-1" style={{ color: '#22d3ee' }}>Doctor Diagnostic Notes & Prescriptions</p>
                                <p className="text-sm" style={{ color: '#a7c4b8' }}>{apt.notes}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Notes Modal */}
            {noteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs" onClick={() => setNoteModal(null)}>
                    <div className="glass-card p-8 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}
                        style={{ background: '#111a16', border: '1px solid rgba(14,116,144,0.4)' }}>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: '#f0fdf4' }}>Clinical Case Notes & Prescription</h3>
                        <p className="text-xs mb-4" style={{ color: '#6b8f7e' }}>Enter diagnosis, prescribed medicines (Chooranam, Lehyam), or dietary instructions for this patient.</p>
                        <textarea className="form-input mb-4" rows={5}
                            placeholder="Enter clinical notes, dosage instructions, and follow-up guidance..."
                            value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setNoteModal(null)} className="btn-secondary text-sm py-2 px-4 cursor-pointer">Cancel</button>
                            <button onClick={() => saveNote(noteModal)} className="btn-primary text-sm py-2 px-4 cursor-pointer"
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
