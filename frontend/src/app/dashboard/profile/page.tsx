'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';


import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
    const { t } = useLanguage();
    const [form, setForm] = useState({ name: '', email: '', phone: '', medicalHistory: '' });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalVisits: 0, activePlans: 0, nextDate: '—' });

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Fetch full profile
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (!userError && userData) {
                    setForm({
                        name: userData.name || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        medicalHistory: userData.medicalHistory || '',
                    });
                }

                // Fetch appointment stats
                const { data: apts, error: aptsError } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('userId', session.user.id);

                if (!aptsError && Array.isArray(apts)) {
                    const now = new Date();
                    const upcoming = apts
                        .filter((a: any) => new Date(a.date) >= now && a.status !== 'CANCELLED')
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    
                    setStats({
                        totalVisits: apts.filter((a: any) => a.status === 'COMPLETED').length,
                        activePlans: upcoming.length,
                        nextDate: upcoming.length > 0 ? new Date(upcoming[0].date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—',
                    });
                }
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                // Fetch full profile
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (!userError && userData) {
                    setForm({
                        name: userData.name || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        medicalHistory: userData.medicalHistory || '',
                    });
                }

                // Fetch appointment stats
                const { data: apts, error: aptsError } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('userId', session.user.id);

                if (!aptsError && Array.isArray(apts)) {
                    const now = new Date();
                    const upcoming = apts
                        .filter((a: any) => new Date(a.date) >= now && a.status !== 'CANCELLED')
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    
                    setStats({
                        totalVisits: apts.filter((a: any) => a.status === 'COMPLETED').length,
                        activePlans: upcoming.length,
                        nextDate: upcoming.length > 0 ? new Date(upcoming[0].date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—',
                    });
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const { data: updated, error } = await supabase
                .from('users')
                .update({ 
                    name: form.name, 
                    phone: form.phone, 
                    medicalHistory: form.medicalHistory 
                })
                .eq('id', session.user.id)
                .select()
                .single();

            if (!error && updated) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">{t('profile.title')}</h1>
            <p className="text-sm mb-8" style={{ color: '#6b8f7e' }}>{t('profile.subtitle')}</p>

            <div className="max-w-2xl space-y-6">
                {/* Profile Info */}
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
                    <h3 className="font-semibold text-lg" style={{ color: '#34d399' }}>{t('profile.personalInfo')}</h3>

                    {saved && (
                        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                            {t('profile.updated')}
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                            <label className="form-label">{t('profile.fullName')}</label>
                            <input type="text" className="form-input" value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label">{t('profile.email')}</label>
                            <input type="email" className="form-input" value={form.email} disabled
                                style={{ opacity: 0.6 }} />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">{t('profile.phone')}</label>
                        <input type="tel" className="form-input" placeholder={t('common.phonePlaceholder') || 'Enter your phone number'} value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>

                    {/* Medical History Section — integrated into same form */}
                    <div className="pt-4" style={{ borderTop: '1px solid rgba(4,120,87,0.15)' }}>
                        <h3 className="font-semibold text-lg mb-2" style={{ color: '#34d399' }}>{t('profile.medicalHistory')}</h3>
                        <p className="text-sm mb-3" style={{ color: '#6b8f7e' }}>
                            {t('profile.medicalHistoryDesc')}
                        </p>
                        <textarea className="form-input" rows={6}
                            placeholder={t('profile.medicalPlaceholder')}
                            value={form.medicalHistory}
                            onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? t('profile.saving') : t('common.save')}
                    </button>
                </form>

                {/* Quick Health Stats */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold text-lg mb-4" style={{ color: '#34d399' }}>{t('profile.healthSummary')}</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: t('profile.completedVisits'), value: String(stats.totalVisits), icon: '📋' },
                            { label: t('profile.upcoming'), value: String(stats.activePlans), icon: '💊' },
                            { label: t('profile.nextAppointment'), value: stats.nextDate, icon: '📅' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center p-4 rounded-xl" style={{ background: 'rgba(4,120,87,0.05)' }}>
                                <span className="text-2xl block mb-2">{stat.icon}</span>
                                <p className="text-lg font-bold" style={{ color: '#f0fdf4' }}>{stat.value}</p>
                                <p className="text-xs" style={{ color: '#6b8f7e' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
