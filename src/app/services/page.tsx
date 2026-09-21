'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';

interface Service {
    id: string;
    name: string;
    description: string;
    icon?: string;
    price?: number;
    duration?: string;
    featured: boolean;
}

const staticServices = [
    { id: '1', icon: '🌿', titleKey: 'services.herbalMedicine', descKey: 'services.herbalDesc', price: '₹500 – ₹2,000', duration: '30–45 min' },
    { id: '2', icon: '🤲', titleKey: 'services.varmam', descKey: 'services.varmamDesc', price: '₹1,500 – ₹3,000', duration: '45–60 min' },
    { id: '3', icon: '🧘', titleKey: 'services.yoga', descKey: 'services.yogaDesc', price: '₹800 – ₹1,500', duration: '60 min' },
    { id: '4', icon: '🍃', titleKey: 'services.detox', descKey: 'services.detoxDesc', price: '₹5,000 – ₹15,000', duration: '5–21 days' },
    { id: '5', icon: '🥗', titleKey: 'services.diet', descKey: 'services.dietDesc', price: '₹1,000 – ₹2,500', duration: '45 min' },
    { id: '6', icon: '💆', titleKey: 'services.oil', descKey: 'services.oilDesc', price: '₹2,000 – ₹4,000', duration: '60–90 min' },
];


export default function ServicesPage() {
    const { t } = useLanguage();
    const [services, setServices] = useState<Service[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function loadServices() {
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .order('name', { ascending: true });

                if (!error && data) setServices(data);
            } catch (err) {
                console.error('Error loading services:', err);
            } finally {
                setLoaded(true);
            }
        }
        loadServices();
    }, []);

    return (
        <>
            <section className="hero-gradient py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#d4a017' }}>{t('home.ourServices')}</p>
                    <h1 className="font-playfair text-4xl md:text-5xl font-bold gradient-text mb-4">{t('services.pageTitle')}</h1>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: '#a7c4b8' }}>
                        {t('services.pageDesc')}
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((s) => (
                            <Link key={s.id} href={`/services/${s.id}`} className="glass-card p-8 flex flex-col group">
                                <span className="text-5xl mb-5 group-hover:scale-110 transition-transform">{s.icon || '💊'}</span>
                                <h3 className="text-xl font-semibold mb-3" style={{ color: '#f0fdf4' }}>{s.name}</h3>
                                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: '#a7c4b8' }}>{s.description}</p>
                                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(4,120,87,0.15)' }}>
                                    <div>
                                        {s.price && <p className="text-sm font-semibold" style={{ color: '#34d399' }}>₹{s.price}</p>}
                                        {s.duration && <p className="text-xs" style={{ color: '#6b8f7e' }}>{s.duration}</p>}
                                    </div>
                                    <span className="text-sm font-semibold transition-colors group-hover:text-emerald-300" style={{ color: '#34d399' }}>
                                        {t('common.viewDetails')}
                                    </span>
                                </div>
                            </Link>
                        ))}
                        {services.length === 0 && loaded && staticServices.map((s) => (
                            <Link key={s.id} href={`/services/${s.id}`} className="glass-card p-8 flex flex-col group">
                                <span className="text-5xl mb-5 group-hover:scale-110 transition-transform">{s.icon}</span>
                                <h3 className="text-xl font-semibold mb-3" style={{ color: '#f0fdf4' }}>{t(s.titleKey)}</h3>
                                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: '#a7c4b8' }}>{t(s.descKey)}</p>
                                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(4,120,87,0.15)' }}>
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: '#34d399' }}>{s.price}</p>
                                        <p className="text-xs" style={{ color: '#6b8f7e' }}>{s.duration}</p>
                                    </div>
                                    <span className="text-sm font-semibold transition-colors group-hover:text-emerald-300" style={{ color: '#34d399' }}>
                                        {t('common.viewDetails')}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
