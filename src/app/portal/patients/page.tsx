'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/user-context';

interface Patient {
    id: string;
    name: string;
    email: string;
    phone?: string;
    medicalHistory?: string;
    lastVisit: string;
    totalVisits: number;
    symptoms: string;
}

const defaultDemoPatients: Patient[] = [
    {
        id: 'pat_1',
        name: 'Ramya Shankar',
        email: 'ramya@example.com',
        phone: '+91 98765 43210',
        medicalHistory: 'Chronic lumbar disc stiffness, mild hypertension. Treated with Varmam pressure point therapy and Nirgundi oil massage.',
        lastVisit: new Date().toISOString().split('T')[0],
        totalVisits: 3,
        symptoms: 'Lower back pain & sciatica'
    },
    {
        id: 'pat_2',
        name: 'Karthik Murugan',
        email: 'karthik@example.com',
        phone: '+91 87654 32109',
        medicalHistory: 'Seasonal eczema on forearms. Prescribed blood purifier herbal decoction and Karisalankanni paste.',
        lastVisit: new Date().toISOString().split('T')[0],
        totalVisits: 2,
        symptoms: 'Skin eczema & allergy'
    },
    {
        id: 'pat_3',
        name: 'Lakshmi Priya',
        email: 'lakshmi@example.com',
        phone: '+91 76543 21098',
        medicalHistory: 'Osteoarthritis in knees, morning stiffness. Completed 2 weeks of Thokkanam massage with warm herbal poultice.',
        lastVisit: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        totalVisits: 4,
        symptoms: 'Joint arthritis'
    }
];

export default function PortalPatientsPage() {
    const { profile: user } = useUser();
    const [search, setSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(defaultDemoPatients[0]);
    const [patients, setPatients] = useState<Patient[]>(defaultDemoPatients);
    const [savedNote, setSavedNote] = useState(false);
    const [treatmentText, setTreatmentText] = useState('');

    useEffect(() => {
        const loadPatients = async () => {
            try {
                if (user) {
                    const { data: doctor } = await supabase
                        .from('doctors')
                        .select('id')
                        .eq('userId', user.id)
                        .single();

                    if (doctor) {
                        const { data: appts, error } = await supabase
                            .from('appointments')
                            .select('*, user:users!appointments_userId_fkey(name, email, phone, medicalHistory)')
                            .eq('doctorId', doctor.id);

                        if (!error && appts && appts.length > 0) {
                            const patientMap = new Map<string, Patient>();
                            for (const apt of appts) {
                                if (!apt.user) continue;
                                const existing = patientMap.get(apt.userId);
                                if (existing) {
                                    existing.totalVisits++;
                                    if (new Date(apt.date) > new Date(existing.lastVisit)) {
                                        existing.lastVisit = apt.date;
                                        existing.symptoms = apt.symptoms || existing.symptoms;
                                    }
                                } else {
                                    patientMap.set(apt.userId, {
                                        id: apt.userId,
                                        name: apt.user.name,
                                        email: apt.user.email,
                                        phone: apt.user.phone,
                                        medicalHistory: apt.user.medicalHistory,
                                        lastVisit: apt.date,
                                        totalVisits: 1,
                                        symptoms: apt.symptoms || 'General Consultation',
                                    });
                                }
                            }
                            const list = Array.from(patientMap.values());
                            if (list.length > 0) {
                                setPatients(list);
                                setSelectedPatient(list[0]);
                            }
                        }
                    }
                }
            } catch { }
        };

        loadPatients();
    }, [user]);

    const handleSaveTreatmentNotes = () => {
        if (!treatmentText.trim()) return;
        setSavedNote(true);
        setTimeout(() => {
            setSavedNote(false);
            setTreatmentText('');
        }, 3000);
    };

    const filtered = patients.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.symptoms.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">Patient Health Records (EHR)</h1>
            <p className="text-sm mb-8" style={{ color: '#6b8f7e' }}>Search clinical histories, consultation counts, and past diagnostic notes.</p>

            {/* Search Box */}
            <div className="mb-6">
                <input type="text" className="form-input max-w-md" placeholder="Search patients by name, symptoms, or email..."
                    value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Patient List */}
                <div className="lg:col-span-1 space-y-3">
                    {filtered.length === 0 && (
                        <div className="text-center py-8">
                            <span className="text-4xl block mb-3">👥</span>
                            <p className="text-sm" style={{ color: '#6b8f7e' }}>No matching patient records found.</p>
                        </div>
                    )}
                    {filtered.map((p) => (
                        <button key={p.id} onClick={() => setSelectedPatient(p)}
                            className="w-full text-left p-4 rounded-xl transition-all cursor-pointer"
                            style={{
                                background: selectedPatient?.id === p.id ? 'rgba(14,116,144,0.18)' : 'rgba(14,116,144,0.04)',
                                border: `1px solid ${selectedPatient?.id === p.id ? '#0891b2' : 'rgba(14,116,144,0.15)'}`,
                            }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{ background: 'rgba(14,116,144,0.25)', color: '#22d3ee' }}>
                                    {p.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm" style={{ color: '#f0fdf4' }}>{p.name}</p>
                                    <p className="text-xs" style={{ color: '#6b8f7e' }}>{p.symptoms}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Patient Detail View */}
                <div className="lg:col-span-2">
                    {selectedPatient ? (
                        <div className="glass-card p-8" style={{ borderColor: 'rgba(14,116,144,0.25)' }}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                                    style={{ background: 'rgba(14,116,144,0.25)', color: '#22d3ee' }}>
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold" style={{ color: '#f0fdf4' }}>{selectedPatient.name}</h2>
                                    <p className="text-sm font-medium" style={{ color: '#22d3ee' }}>{selectedPatient.symptoms}</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                                {[
                                    { label: 'Email Address', value: selectedPatient.email, icon: '✉️' },
                                    { label: 'Contact Phone', value: selectedPatient.phone || '—', icon: '📞' },
                                    { label: 'Last Consultation', value: new Date(selectedPatient.lastVisit).toLocaleDateString('en-IN'), icon: '📅' },
                                ].map((item) => (
                                    <div key={item.label} className="p-3 rounded-lg" style={{ background: 'rgba(14,116,144,0.06)' }}>
                                        <p className="text-xs mb-1" style={{ color: '#6b8f7e' }}>{item.icon} {item.label}</p>
                                        <p className="text-sm font-medium" style={{ color: '#a7c4b8' }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6">
                                <div className="p-4 rounded-lg flex items-center justify-between" style={{ background: 'rgba(14,116,144,0.08)' }}>
                                    <div>
                                        <p className="text-xs" style={{ color: '#6b8f7e' }}>Total Completed Visits</p>
                                        <p className="text-2xl font-bold" style={{ color: '#22d3ee' }}>{selectedPatient.totalVisits} Consultations</p>
                                    </div>
                                    <span className="text-3xl">🩺</span>
                                </div>
                            </div>

                            {selectedPatient.medicalHistory && (
                                <div className="mb-6">
                                    <h3 className="font-semibold mb-2" style={{ color: '#22d3ee' }}>Medical & Diagnostic History</h3>
                                    <div className="p-4 rounded-lg" style={{ background: 'rgba(14,116,144,0.05)', border: '1px solid rgba(14,116,144,0.15)' }}>
                                        <p className="text-sm leading-relaxed" style={{ color: '#a7c4b8' }}>{selectedPatient.medicalHistory}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold mb-2" style={{ color: '#22d3ee' }}>Add Treatment & Prescription Notes</h3>
                                {savedNote && (
                                    <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                                        ✓ Treatment notes saved to patient history!
                                    </div>
                                )}
                                <textarea className="form-input mb-3" rows={4}
                                    placeholder="Add ongoing treatment notes, herbal dosage, or lifestyle advice..."
                                    value={treatmentText} onChange={(e) => setTreatmentText(e.target.value)} />
                                <button onClick={handleSaveTreatmentNotes} className="btn-primary text-sm py-2.5 px-6"
                                    style={{ background: 'linear-gradient(135deg, #0e7490, #155e75)' }}>
                                    Save Treatment Notes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <span className="text-5xl mb-4 block">👥</span>
                            <p className="text-lg font-semibold mb-2" style={{ color: '#a7c4b8' }}>Select a patient from the list</p>
                            <p className="text-sm" style={{ color: '#6b8f7e' }}>View their past history and clinical notes.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
