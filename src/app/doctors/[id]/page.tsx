'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useLanguage } from '@/i18n';
import { useMemo } from 'react';

const doctorKeys = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];

export default function DoctorDetailPage() {
    const { t } = useLanguage();
    const params = useParams();
    const id = params.id as string;

    const doctor = useMemo(() => {
        const key = `d${id}`;
        if (!doctorKeys.includes(key)) return null;

        // Extract localized data based on the ID key
        return {
            id,
            key,
            img: id === '1' || id === '3' || id === '5' ? '👩‍⚕️' : '👨‍⚕️',
            name: t(`doctorList.names.${key}`),
            specialty: t(`doctorList.specialties.${key}`),
            exp: id === '1' ? 18 : id === '2' ? 22 : id === '3' ? 15 : id === '4' ? 12 : id === '5' ? 14 : 16,
            bio: t(`doctorList.bios.${key}`),
            fullBio: t(`doctorList.fullBios.${key}`),
            qualifications: t(`doctorList.qualifications.${key}`) as unknown as string[],
            specialties: t(`doctorList.expertise.${key}`) as unknown as string[],
            schedule: t(`doctorList.schedules.${key}`),
            languages: t(`doctorList.lang.${key}`),
        };
    }, [id, t]);

    if (!doctor) return notFound();

    return (
        <>
            {/* Hero */}
            <section className="hero-gradient py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/doctors" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-emerald-300" style={{ color: '#6b8f7e' }}>
                        {t('doctors.backToAll')}
                    </Link>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col items-center md:items-start">
                            <div className="w-36 h-36 rounded-full mb-6 flex items-center justify-center text-7xl animate-float"
                                style={{ background: 'rgba(4,120,87,0.15)', border: '3px solid rgba(4,120,87,0.3)' }}>
                                {doctor.img}
                            </div>
                            <h1 className="font-playfair text-4xl md:text-5xl font-bold gradient-text mb-2">{doctor.name}</h1>
                            <p className="text-lg font-medium mb-1" style={{ color: '#34d399' }}>{doctor.specialty}</p>
                            <p className="text-sm mb-6" style={{ color: '#6b8f7e' }}>{doctor.exp} {t('doctors.yearsExp')}</p>
                            <div className="flex flex-wrap gap-3">
                                <div className="glass-card px-4 py-2 text-sm">
                                    <span style={{ color: '#6b8f7e' }}>🗓️ </span>
                                    <span style={{ color: '#a7c4b8' }}>{doctor.schedule}</span>
                                </div>
                                <div className="glass-card px-4 py-2 text-sm">
                                    <span style={{ color: '#6b8f7e' }}>🗣️ </span>
                                    <span style={{ color: '#a7c4b8' }}>{doctor.languages}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="glass-card p-8">
                                <h3 className="font-playfair text-xl font-bold mb-4" style={{ color: '#f0fdf4' }}>{t('doctors.bookConsultation')}</h3>
                                <p className="text-sm mb-6" style={{ color: '#a7c4b8' }}>
                                    {t('doctors.bookDesc').replace('{name}', doctor.name)}
                                </p>
                                <Link href="/dashboard/book" className="btn-primary w-full justify-center text-center">
                                    {t('doctors.bookBtn')}
                                </Link>
                                <Link href="/contact" className="btn-secondary w-full justify-center text-center mt-3">
                                    {t('contact.getInTouch')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Details */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Bio */}
                        <div className="lg:col-span-2">
                            <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: '#f0fdf4' }}>{t('doctors.aboutDoctor').replace('{name}', doctor.name)}</h2>
                            <p className="text-base leading-relaxed mb-10" style={{ color: '#a7c4b8' }}>{doctor.fullBio}</p>

                            <h3 className="font-playfair text-xl font-bold mb-5" style={{ color: '#f0fdf4' }}>{t('doctors.expertise')}</h3>
                            <div className="grid sm:grid-cols-2 gap-4 mb-10">
                                {doctor.specialties.map((s) => (
                                    <div key={s} className="flex items-center gap-3 p-4 rounded-xl"
                                        style={{ background: 'rgba(4,120,87,0.06)', border: '1px solid rgba(4,120,87,0.1)' }}>
                                        <span className="text-emerald-400 text-lg">✦</span>
                                        <span className="text-sm" style={{ color: '#a7c4b8' }}>{s}</span>
                                    </div>
                                ))}
                            </div>

                            <h3 className="font-playfair text-xl font-bold mb-5" style={{ color: '#f0fdf4' }}>{t('doctors.qualifications')}</h3>
                            <div className="space-y-3">
                                {doctor.qualifications.map((q) => (
                                    <div key={q} className="flex items-start gap-3 p-4 rounded-xl"
                                        style={{ background: 'rgba(212,160,23,0.04)', border: '1px solid rgba(212,160,23,0.1)' }}>
                                        <span className="text-yellow-500 mt-0.5">🎓</span>
                                        <span className="text-sm" style={{ color: '#a7c4b8' }}>{q}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div>
                            <div className="glass-card p-6 sticky top-28">
                                <h4 className="font-semibold mb-4" style={{ color: '#f0fdf4' }}>{t('doctors.quickInfo')}</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <span>🩺</span>
                                        <div>
                                            <p style={{ color: '#6b8f7e' }}>{t('doctors.specialty')}</p>
                                            <p className="font-medium" style={{ color: '#34d399' }}>{doctor.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span>⏳</span>
                                        <div>
                                            <p style={{ color: '#6b8f7e' }}>{t('doctors.experience')}</p>
                                            <p className="font-medium" style={{ color: '#d4a017' }}>{doctor.exp} {t('doctors.yearsExp')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span>🗓️</span>
                                        <div>
                                            <p style={{ color: '#6b8f7e' }}>{t('doctors.available')}</p>
                                            <p className="font-medium" style={{ color: '#a7c4b8' }}>{doctor.schedule}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span>🗣️</span>
                                        <div>
                                            <p style={{ color: '#6b8f7e' }}>{t('doctors.languages')}</p>
                                            <p className="font-medium" style={{ color: '#a7c4b8' }}>{doctor.languages}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(4,120,87,0.15)' }}>
                                    <Link href="/dashboard/book" className="btn-gold w-full justify-center text-center text-sm">
                                        {t('doctors.bookWith').replace('{name}', doctor.name.split(' ')[0])}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
