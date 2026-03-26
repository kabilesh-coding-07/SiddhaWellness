'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n';

interface TimeSlot {
    start: string;
    end: string;
}

interface DaySchedule {
    day: string;
    enabled: boolean;
    slots: TimeSlot[];
}

const defaultSchedule: DaySchedule[] = [
    { day: 'Monday', enabled: true, slots: [{ start: '09:00', end: '12:30' }, { start: '14:00', end: '18:00' }] },
    { day: 'Tuesday', enabled: true, slots: [{ start: '09:00', end: '12:30' }, { start: '14:00', end: '18:00' }] },
    { day: 'Wednesday', enabled: true, slots: [{ start: '09:00', end: '12:30' }, { start: '14:00', end: '18:00' }] },
    { day: 'Thursday', enabled: true, slots: [{ start: '09:00', end: '12:30' }, { start: '14:00', end: '18:00' }] },
    { day: 'Friday', enabled: true, slots: [{ start: '09:00', end: '12:30' }, { start: '14:00', end: '17:00' }] },
    { day: 'Saturday', enabled: true, slots: [{ start: '09:00', end: '13:00' }] },
    { day: 'Sunday', enabled: false, slots: [] },
];

export default function AvailabilityPage() {
    const { t } = useLanguage();
    const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule);
    const [saved, setSaved] = useState(false);
    const [consultDuration, setConsultDuration] = useState('30');
    const [loadingData, setLoadingData] = useState(true);

    // Load saved availability on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setLoadingData(false); return; }

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/doctors/me/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((doctor) => {
                if (doctor.availability) {
                    try {
                        const parsed = JSON.parse(doctor.availability);
                        if (parsed.schedule) setSchedule(parsed.schedule);
                        if (parsed.consultDuration) setConsultDuration(parsed.consultDuration);
                    } catch { /* use defaults */ }
                }
            })
            .catch(() => { /* use defaults */ })
            .finally(() => setLoadingData(false));
    }, []);

    const toggleDay = (index: number) => {
        setSchedule((prev) => prev.map((d, i) => i === index ? { ...d, enabled: !d.enabled } : d));
    };

    const updateSlot = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
        setSchedule((prev) => prev.map((d, i) => {
            if (i !== dayIndex) return d;
            const newSlots = [...d.slots];
            newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
            return { ...d, slots: newSlots };
        }));
    };

    const addSlot = (dayIndex: number) => {
        setSchedule((prev) => prev.map((d, i) =>
            i === dayIndex ? { ...d, slots: [...d.slots, { start: '09:00', end: '17:00' }] } : d
        ));
    };

    const removeSlot = (dayIndex: number, slotIndex: number) => {
        setSchedule((prev) => prev.map((d, i) =>
            i === dayIndex ? { ...d, slots: d.slots.filter((_, si) => si !== slotIndex) } : d
        ));
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/doctors/availability`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ availability: JSON.stringify({ schedule, consultDuration }) }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch { /* silently fail */ }
    };

    return (
        <div>
            <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">{t('doctor.setAvailability')}</h1>
            <p className="text-sm mb-8" style={{ color: '#6b8f7e' }}>{t('doctor.setAvailabilityDesc')}</p>

            {saved && (
                <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                    {t('doctor.availabilitySaved')}
                </div>
            )}

            <div className="max-w-3xl space-y-6">
                {/* Consultation Duration */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4" style={{ color: '#34d399' }}>{t('doctor.consultDuration')}</h3>
                    <div className="flex flex-wrap gap-3">
                        {['15', '30', '45', '60'].map((d) => (
                            <button key={d} onClick={() => setConsultDuration(d)}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: consultDuration === d ? 'linear-gradient(135deg, #047857, #065f46)' : 'rgba(4,120,87,0.05)',
                                    border: `1px solid ${consultDuration === d ? '#059669' : 'rgba(4,120,87,0.1)'}`,
                                    color: consultDuration === d ? 'white' : '#a7c4b8',
                                }}>
                                {d} min
                            </button>
                        ))}
                    </div>
                </div>

                {/* Weekly Schedule */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold mb-6" style={{ color: '#34d399' }}>{t('doctor.weeklySchedule')}</h3>
                    <div className="space-y-4">
                        {schedule.map((day, di) => (
                            <div key={day.day} className="p-4 rounded-xl" style={{ background: 'rgba(4,120,87,0.03)', border: '1px solid rgba(4,120,87,0.08)' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => toggleDay(di)}
                                            className="w-10 h-6 rounded-full relative transition-all"
                                            style={{ background: day.enabled ? '#047857' : 'rgba(4,120,87,0.15)' }}>
                                            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                                                style={{ left: day.enabled ? '18px' : '2px' }} />
                                        </button>
                                        <span className={`text-sm font-semibold ${day.enabled ? '' : 'opacity-50'}`}
                                            style={{ color: '#f0fdf4' }}>{day.day}</span>
                                    </div>
                                    {day.enabled && (
                                        <button onClick={() => addSlot(di)} className="text-xs transition-colors hover:text-emerald-300"
                                            style={{ color: '#34d399' }}>{t('doctor.addSlot')}</button>
                                    )}
                                </div>

                                {day.enabled && (
                                    <div className="space-y-2 ml-13 pl-10">
                                        {day.slots.map((slot, si) => (
                                            <div key={si} className="flex items-center gap-3">
                                                <input type="time" className="form-input py-1.5 text-sm" style={{ width: '140px' }}
                                                    value={slot.start} onChange={(e) => updateSlot(di, si, 'start', e.target.value)} />
                                                <span className="text-xs" style={{ color: '#6b8f7e' }}>to</span>
                                                <input type="time" className="form-input py-1.5 text-sm" style={{ width: '140px' }}
                                                    value={slot.end} onChange={(e) => updateSlot(di, si, 'end', e.target.value)} />
                                                {day.slots.length > 1 && (
                                                    <button onClick={() => removeSlot(di, si)} className="text-xs hover:text-red-400 transition-colors"
                                                        style={{ color: '#6b8f7e' }}>✕</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={handleSave} className="btn-gold w-full justify-center py-4 text-base">
                    {t('doctor.saveAvailability')}
                </button>
            </div>
        </div>
    );
}
