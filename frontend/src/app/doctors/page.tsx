'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Doctor {
    id: string;
    specialty: string;
    experience: number;
    bio?: string;
    user: { name: string; email: string; image?: string };
}

const staticDoctors = [
    { id: '1', docKey: 'd1', exp: 18, img: '👩‍⚕️' },
    { id: '2', docKey: 'd2', exp: 22, img: '👨‍⚕️' },
    { id: '3', docKey: 'd3', exp: 15, img: '👩‍⚕️' },
    { id: '4', docKey: 'd4', exp: 12, img: '👨‍⚕️' },
    { id: '5', docKey: 'd5', exp: 14, img: '👩‍⚕️' },
    { id: '6', docKey: 'd6', exp: 16, img: '👨‍⚕️' },
];

export default function DoctorsPage() {
    const { t } = useLanguage();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/doctors`)
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) setDoctors(data); })
            .catch(() => { })
            .finally(() => setLoaded(true));
    }, []);

    return (
        <>
            <section className="hero-gradient py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#d4a017' }}>{t('home.ourPhysicians')}</p>
                    <h1 className="font-playfair text-4xl md:text-5xl font-bold gradient-text mb-4">{t('doctors.pageTitle')}</h1>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: '#a7c4b8' }}>
                        {t('doctors.pageDesc')}
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {doctors.map((d) => (
                            <Link key={d.id} href={`/doctors/${d.id}`} className="glass-card p-8 text-center group block">
                                <div className="w-28 h-28 rounded-full mx-auto mb-5 flex items-center justify-center text-6xl"
                                    style={{ background: 'rgba(4,120,87,0.15)', border: '2px solid rgba(4,120,87,0.3)' }}>
                                    {d.user.image ? <img src={d.user.image} alt={d.user.name} className="w-full h-full rounded-full object-cover" /> : '👨‍⚕️'}
                                </div>
                                <h3 className="text-xl font-semibold mb-1" style={{ color: '#f0fdf4' }}>{d.user.name}</h3>
                                <p className="text-sm font-medium mb-1" style={{ color: '#34d399' }}>{d.specialty}</p>
                                <p className="text-xs mb-4" style={{ color: '#6b8f7e' }}>{d.experience} {t('common.yearsExp')}</p>
                                <p className="text-sm leading-relaxed mb-5" style={{ color: '#a7c4b8' }}>{d.bio}</p>
                                <span className="btn-primary text-sm py-2 px-6">{t('common.viewProfile')}</span>
                            </Link>
                        ))}
                        {doctors.length === 0 && loaded && staticDoctors.map((d) => (
                            <Link key={d.id} href={`/doctors/${d.id}`} className="glass-card p-8 text-center group block">
                                <div className="w-28 h-28 rounded-full mx-auto mb-5 flex items-center justify-center text-6xl"
                                    style={{ background: 'rgba(4,120,87,0.15)', border: '2px solid rgba(4,120,87,0.3)' }}>
                                    {d.img}
                                </div>
                                <h3 className="text-xl font-semibold mb-1" style={{ color: '#f0fdf4' }}>{t(`doctorList.names.${d.docKey}`)}</h3>
                                <p className="text-sm font-medium mb-1" style={{ color: '#34d399' }}>{t(`doctorList.specialties.${d.docKey}`)}</p>
                                <p className="text-xs mb-4" style={{ color: '#6b8f7e' }}>{d.exp} {t('common.yearsExp')}</p>
                                <p className="text-sm leading-relaxed mb-5" style={{ color: '#a7c4b8' }}>{t(`doctorList.bios.${d.docKey}`)}</p>
                                <span className="btn-primary text-sm py-2 px-6">{t('common.viewProfile')}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
