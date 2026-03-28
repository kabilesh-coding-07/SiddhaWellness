'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/i18n';

import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const supabase = createClient();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // Register via Supabase Auth
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        name: form.name,
                        phone: form.phone,
                        role: 'USER' // Default role
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (signUpError) throw signUpError;

            if (data.user && data.session) {
                // If auto-confirm is on in Supabase, we are logged in
                router.push('/dashboard');
            } else {
                // If email confirmation is required
                router.push('/login?message=Check your email to confirm your account');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center py-20 hero-gradient">
            <div className="max-w-md w-full mx-4">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #047857, #065f46)' }}>
                            <span className="text-xl">🌿</span>
                        </div>
                        <span className="text-xl font-bold gradient-text">SiddhaWellness</span>
                    </Link>
                    <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: '#f0fdf4' }}>{t('register.createAccount')}</h1>
                    <p className="text-sm" style={{ color: '#a7c4b8' }}>{t('register.joinJourney')}</p>
                </div>

                <div className="glass-card p-8">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="form-label">{t('register.fullName')}</label>
                            <input type="text" className="form-input"
                                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="form-label">{t('login.emailLabel')}</label>
                            <input type="email" className="form-input" placeholder="you@example.com"
                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                            <label className="form-label">{t('contact.phone')}</label>
                            <input type="tel" className="form-input" placeholder="+91 98765 43210"
                                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">{t('login.password')}</label>
                                <input type="password" className="form-input" placeholder="••••••••"
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                            </div>
                            <div>
                                <label className="form-label">{t('register.confirmPassword')}</label>
                                <input type="password" className="form-input" placeholder="••••••••"
                                    value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                            {loading ? t('register.creating') : t('register.createBtn')}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px" style={{ background: 'rgba(4,120,87,0.2)' }} />
                        <span className="text-xs" style={{ color: '#6b8f7e' }}>{t('register.orSignUp')}</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(4,120,87,0.2)' }} />
                    </div>

                    <button onClick={() => signIn('google', { callbackUrl: '/login' })} type="button"
                        className="btn-secondary w-full justify-center py-3 text-sm">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        {t('register.signUpGoogle')}
                    </button>

                    <p className="text-center text-sm mt-6" style={{ color: '#6b8f7e' }}>
                        {t('register.haveAccount')}{' '}
                        <Link href="/login" className="font-semibold hover:text-emerald-300" style={{ color: '#34d399' }}>{t('register.signInHere')}</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
