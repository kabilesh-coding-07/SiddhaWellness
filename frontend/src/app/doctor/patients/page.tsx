'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';


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

export default function PatientsPage() {
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        async function loadPatients() {
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

                // 2. Fetch appointments with patient data
                const { data: appts, error } = await supabase
                    .from('appointments')
                    .select('*, user:users!appointments_userId_fkey(name, email, phone, medicalHistory)')
                    .eq('doctorId', doctor.id);

                if (error || !appts) return;

                // 3. Extract unique patients
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
                            symptoms: apt.symptoms || t('doctor.consultation'),
                        });
                    }
                }
                setPatients(Array.from(patientMap.values()));
            } catch (err) {
                console.error('Error loading patients:', err);
            }
        }
        loadPatients();
    }, [t]);

    const filtered = patients.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.symptoms.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">{t('doctor.patientRecords')}</h1>
            <p className="text-sm mb-8" style={{ color: '#6b8f7e' }}>{t('doctor.patientRecordsDesc')}</p>

            {/* Search */}
            <div className="mb-6">
                <input type="text" className="form-input max-w-md" placeholder={t('doctor.searchPatients')}
                    value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Patient List */}
                <div className="lg:col-span-1 space-y-3">
                    {filtered.length === 0 && (
                        <div className="text-center py-8">
                            <span className="text-4xl block mb-3">👥</span>
                            <p className="text-sm" style={{ color: '#6b8f7e' }}>
                                {patients.length === 0 ? t('doctor.noPatientsYet') : t('doctor.noMatching')}
                            </p>
                        </div>
                    )}
                    {filtered.map((p) => (
                        <button key={p.id} onClick={() => setSelectedPatient(p)}
                            className="w-full text-left p-4 rounded-xl transition-all"
                            style={{
                                background: selectedPatient?.id === p.id ? 'rgba(4,120,87,0.15)' : 'rgba(4,120,87,0.03)',
                                border: `1px solid ${selectedPatient?.id === p.id ? '#059669' : 'rgba(4,120,87,0.1)'}`,
                            }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{ background: 'rgba(4,120,87,0.2)', color: '#34d399' }}>
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

                {/* Patient Detail */}
                <div className="lg:col-span-2">
                    {selectedPatient ? (
                        <div className="glass-card p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                                    style={{ background: 'rgba(4,120,87,0.2)', color: '#34d399' }}>
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold" style={{ color: '#f0fdf4' }}>{selectedPatient.name}</h2>
                                    <p className="text-sm" style={{ color: '#34d399' }}>{selectedPatient.symptoms}</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                                {[
                                    { label: t('profile.email'), value: selectedPatient.email, icon: '✉️' },
                                    { label: t('profile.phone'), value: selectedPatient.phone || '—', icon: '📞' },
                                    { label: t('doctor.lastVisit'), value: new Date(selectedPatient.lastVisit).toLocaleDateString(t('common.locale') === 'ta' ? 'ta-IN' : 'en-IN'), icon: '📅' },
                                ].map((item) => (
                                    <div key={item.label} className="p-3 rounded-lg" style={{ background: 'rgba(4,120,87,0.05)' }}>
                                        <p className="text-xs mb-1" style={{ color: '#6b8f7e' }}>{item.icon} {item.label}</p>
                                        <p className="text-sm font-medium" style={{ color: '#a7c4b8' }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 mb-6">
                                <div className="text-center p-4 rounded-lg flex-1" style={{ background: 'rgba(4,120,87,0.08)' }}>
                                    <p className="text-2xl font-bold" style={{ color: '#34d399' }}>{selectedPatient.totalVisits}</p>
                                    <p className="text-xs" style={{ color: '#6b8f7e' }}>{t('doctor.totalVisitsCard')}</p>
                                </div>
                            </div>

                            {selectedPatient.medicalHistory && (
                                <div className="mb-6">
                                    <h3 className="font-semibold mb-3" style={{ color: '#34d399' }}>{t('profile.medicalHistory')}</h3>
                                    <div className="p-4 rounded-lg" style={{ background: 'rgba(4,120,87,0.05)', border: '1px solid rgba(4,120,87,0.1)' }}>
                                        <p className="text-sm leading-relaxed" style={{ color: '#a7c4b8' }}>{selectedPatient.medicalHistory}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold mb-3" style={{ color: '#34d399' }}>{t('doctor.treatmentNotes')}</h3>
                                <textarea className="form-input" rows={4} placeholder={t('doctor.treatmentPlaceholder')} />
                                <button className="btn-primary mt-3 text-sm">{t('doctor.saveNotes')}</button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <span className="text-5xl mb-4 block">👥</span>
                            <p className="text-lg font-semibold mb-2" style={{ color: '#a7c4b8' }}>{t('doctor.selectPatient')}</p>
                            <p className="text-sm" style={{ color: '#6b8f7e' }}>{t('doctor.selectPatientDesc')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
