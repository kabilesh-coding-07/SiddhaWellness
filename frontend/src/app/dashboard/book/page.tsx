'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Doctor {
    id: string;
    specialty: string;
    user: { name: string };
}

const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM',
];

export default function BookAppointmentPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [form, setForm] = useState({ doctorId: '', date: '', time: '', symptoms: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch doctors from API
        fetch(`${API_URL}/doctors`)
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) setDoctors(data); })
            .catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/dashboard/appointments'), 2000);
            } else {
                const data = await res.json();
                setError(data.error || 'Booking failed');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-20">
                <span className="text-6xl mb-6 block animate-float">✅</span>
                <h2 className="font-playfair text-3xl font-bold gradient-text mb-3">{t('book.booked')}</h2>
                <p style={{ color: '#a7c4b8' }}>{t('book.bookedDesc')}</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">{t('book.title')}</h1>
            <p className="text-sm mb-8" style={{ color: '#6b8f7e' }}>{t('book.subtitle')}</p>

            <div className="max-w-2xl">
                {error && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Select Doctor */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4" style={{ color: '#34d399' }}>{t('book.chooseDoctor')}</h3>
                        {doctors.length === 0 ? (
                            <p className="text-sm" style={{ color: '#6b8f7e' }}>{t('book.loadingDoctors')}</p>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {doctors.map((doc) => (
                                    <label key={doc.id}
                                        className={`p-4 rounded-xl cursor-pointer transition-all ${form.doctorId === doc.id ? 'border-emerald-500 shadow-lg' : ''}`}
                                        style={{
                                            background: form.doctorId === doc.id ? 'rgba(4,120,87,0.15)' : 'rgba(4,120,87,0.05)',
                                            border: `1px solid ${form.doctorId === doc.id ? '#059669' : 'rgba(4,120,87,0.1)'}`,
                                        }}>
                                        <input type="radio" name="doctor" value={doc.id} className="hidden"
                                            onChange={() => setForm({ ...form, doctorId: doc.id })} required />
                                        <p className="font-semibold text-sm" style={{ color: '#f0fdf4' }}>{doc.user.name}</p>
                                        <p className="text-xs" style={{ color: '#6b8f7e' }}>{doc.specialty}</p>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date & Time */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4" style={{ color: '#34d399' }}>{t('book.selectDateTime')}</h3>
                        <div className="mb-4">
                            <label className="form-label">{t('book.preferredDate')}</label>
                            <input type="date" className="form-input" value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })} required
                                min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                            <label className="form-label">{t('book.availableSlots')}</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {timeSlots.map((slot) => (
                                    <button key={slot} type="button"
                                        onClick={() => setForm({ ...form, time: slot })}
                                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${form.time === slot ? 'text-white' : ''}`}
                                        style={{
                                            background: form.time === slot ? 'linear-gradient(135deg, #047857, #065f46)' : 'rgba(4,120,87,0.05)',
                                            border: `1px solid ${form.time === slot ? '#059669' : 'rgba(4,120,87,0.1)'}`,
                                            color: form.time === slot ? 'white' : '#a7c4b8',
                                        }}>
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Symptoms */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4" style={{ color: '#34d399' }}>{t('book.describeSymptoms')}</h3>
                        <textarea className="form-input" rows={4}
                            placeholder={t('book.symptomsPlaceholder')}
                            value={form.symptoms}
                            onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
                    </div>

                    <button type="submit" className="btn-gold w-full justify-center py-4 text-base" disabled={loading}>
                        {loading ? t('book.booking') : t('book.confirmBooking')}
                    </button>
                </form>
            </div>
        </div>
    );
}
