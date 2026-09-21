'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/user-context';

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

export default function PortalAvailabilityPage() {
    const { profile: user } = useUser();
    const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule);
    const [saved, setSaved] = useState(false);
    const [consultDuration, setConsultDuration] = useState('30');
    const [doctorId, setDoctorId] = useState<string | null>(null);

    useEffect(() => {
        const loadAvailability = async () => {
            try {
                // Check local storage first
                const savedLocal = localStorage.getItem('siddha_doctor_availability');
                if (savedLocal) {
                    const parsed = JSON.parse(savedLocal);
                    if (parsed.schedule) setSchedule(parsed.schedule);
                    if (parsed.consultDuration) setConsultDuration(parsed.consultDuration);
                }

                if (user) {
                    const { data: doctor } = await supabase
                        .from('doctors')
                        .select('id, availability')
                        .eq('userId', user.id)
                        .single();

                    if (doctor) {
                        setDoctorId(doctor.id);
                        if (doctor.availability) {
                            const parsed = typeof doctor.availability === 'string' 
                                ? JSON.parse(doctor.availability) 
                                : doctor.availability;
                            
                            if (parsed.schedule) setSchedule(parsed.schedule);
                            if (parsed.consultDuration) setConsultDuration(parsed.consultDuration);
                        }
                    }
                }
            } catch { }
        };

        loadAvailability();
    }, [user]);

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
        const availabilityData = { schedule, consultDuration };
        try {
            if (doctorId) {
                await supabase
                    .from('doctors')
                    .update({ availability: availabilityData })
                    .eq('id', doctorId);
            }
        } catch { }

        try {
            localStorage.setItem('siddha_doctor_availability', JSON.stringify(availabilityData));
        } catch { }

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div>
            <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">Clinical Availability & Hours</h1>
            <p className="text-sm mb-8" style={{ color: '#6b8f7e' }}>Configure weekly consultation hours, breaks, and default session lengths for patient bookings.</p>

            {saved && (
                <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                    ✓ Clinical availability schedule successfully saved!
                </div>
            )}

            <div className="max-w-3xl space-y-6">
                {/* Consultation Duration */}
                <div className="glass-card p-6" style={{ borderColor: 'rgba(14,116,144,0.25)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: '#22d3ee' }}>Default Consultation Duration</h3>
                    <div className="flex flex-wrap gap-3">
                        {['15', '30', '45', '60'].map((d) => (
                            <button key={d} onClick={() => setConsultDuration(d)}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
                                style={{
                                    background: consultDuration === d ? 'linear-gradient(135deg, #0e7490, #155e75)' : 'rgba(14,116,144,0.06)',
                                    border: `1px solid ${consultDuration === d ? '#0891b2' : 'rgba(14,116,144,0.15)'}`,
                                    color: consultDuration === d ? 'white' : '#a7c4b8',
                                }}>
                                {d} Mins
                            </button>
                        ))}
                    </div>
                </div>

                {/* Weekly Schedule */}
                <div className="glass-card p-6" style={{ borderColor: 'rgba(14,116,144,0.25)' }}>
                    <h3 className="font-semibold mb-6" style={{ color: '#22d3ee' }}>Weekly Clinical Schedule</h3>
                    <div className="space-y-4">
                        {schedule.map((day, di) => (
                            <div key={day.day} className="p-4 rounded-xl" style={{ background: 'rgba(14,116,144,0.04)', border: '1px solid rgba(14,116,144,0.12)' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => toggleDay(di)}
                                            className="w-10 h-6 rounded-full relative transition-all cursor-pointer"
                                            style={{ background: day.enabled ? '#0891b2' : 'rgba(14,116,144,0.2)' }}>
                                            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                                                style={{ left: day.enabled ? '18px' : '2px' }} />
                                        </button>
                                        <span className={`text-sm font-semibold ${day.enabled ? '' : 'opacity-50'}`}
                                            style={{ color: '#f0fdf4' }}>{day.day}</span>
                                    </div>
                                    {day.enabled && (
                                        <button onClick={() => addSlot(di)} className="text-xs transition-colors hover:text-cyan-300 cursor-pointer"
                                            style={{ color: '#22d3ee' }}>+ Add Slot</button>
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
                                                    <button onClick={() => removeSlot(di, si)} className="text-xs hover:text-red-400 transition-colors cursor-pointer"
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

                <button onClick={handleSave} className="w-full justify-center py-4 text-base font-semibold rounded-xl text-white cursor-pointer transition-all hover:opacity-90 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #0e7490, #155e75)' }}>
                    Save Clinical Availability Schedule
                </button>
            </div>
        </div>
    );
}
