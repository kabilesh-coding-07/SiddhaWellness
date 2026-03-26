'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useLanguage } from '@/i18n';

type LoginMode = 'patient' | 'doctor';

export default function LoginPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useLanguage();
    const [mode, setMode] = useState<LoginMode>('patient');
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user && (session as any).accessToken) {
            localStorage.setItem('token', (session as any).accessToken);
            localStorage.setItem('user', JSON.stringify({
                id: (session.user as any).id,
                name: session.user.name,
                email: session.user.email,
                role: (session.user as any).role || 'USER',
            }));
            const role = (session.user as any).role;
            router.push(role === 'DOCTOR' ? '/doctor' : '/dashboard');
        }
    }, [session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                redirect: false,
                email: form.email,
                password: form.password,
                role: mode,
            });

            if (res?.error) {
                throw new Error(res.error);
            }
            
            // Note: The redirection based on role is now handled by the useEffect above
            // which watches the NextAuth session object.
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
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
                    <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: '#f0fdf4' }}>{t('login.welcomeBack')}</h1>
                    <p className="text-sm" style={{ color: '#a7c4b8' }}>{mode === 'doctor' ? t('login.doctorSubtitle') : t('login.patientSubtitle')}</p>
                </div>

                {/* Role Toggle */}
                <div className="flex mb-6 rounded-xl overflow-hidden" style={{ background: 'rgba(4,120,87,0.08)', border: '1px solid rgba(4,120,87,0.15)' }}>
                    <button onClick={() => { setMode('patient'); setError(''); }}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all duration-300"
                        style={{ background: mode === 'patient' ? 'linear-gradient(135deg, #047857, #065f46)' : 'transparent', color: mode === 'patient' ? '#f0fdf4' : '#6b8f7e' }}>
                        <span className="text-lg">👤</span> {t('login.patientLogin')}
                    </button>
                    <button onClick={() => { setMode('doctor'); setError(''); }}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all duration-300"
                        style={{ background: mode === 'doctor' ? 'linear-gradient(135deg, #0e7490, #155e75)' : 'transparent', color: mode === 'doctor' ? '#f0fdf4' : '#6b8f7e' }}>
                        <span className="text-lg">🩺</span> {t('login.doctorLogin')}
                    </button>
                </div>

                <div className="glass-card p-8" style={{ borderColor: mode === 'doctor' ? 'rgba(14,116,144,0.3)' : undefined }}>
                    <div className="flex items-center gap-2 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(4,120,87,0.1)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                            style={{ background: mode === 'doctor' ? 'rgba(14,116,144,0.2)' : 'rgba(4,120,87,0.15)', color: mode === 'doctor' ? '#22d3ee' : '#34d399' }}>
                            {mode === 'doctor' ? '🩺' : '👤'}
                        </div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: '#f0fdf4' }}>
                                {mode === 'doctor' ? t('login.doctorPortal') : t('login.patientPortal')}
                            </p>
                            <p className="text-xs" style={{ color: '#6b8f7e' }}>
                                {mode === 'doctor' ? t('login.doctorPortalDesc') : t('login.patientPortalDesc')}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="form-label">{mode === 'doctor' ? t('login.doctorEmailLabel') : t('login.emailLabel')}</label>
                            <input type="email" className="form-input"
                                placeholder={mode === 'doctor' ? 'doctor@siddhawellness.in' : 'you@example.com'}
                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                            <label className="form-label">{t('login.password')}</label>
                            <input type="password" className="form-input" placeholder="••••••••"
                                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full justify-center py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                            style={{
                                background: mode === 'doctor' ? 'linear-gradient(135deg, #0e7490, #155e75)' : 'linear-gradient(135deg, #047857, #065f46)',
                                color: '#f0fdf4', opacity: loading ? 0.7 : 1,
                            }}>
                            {loading ? t('login.signingIn') : mode === 'doctor' ? t('login.signInDoctor') : t('login.signIn')}
                        </button>
                    </form>

                    {mode === 'patient' && (
                        <>
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px" style={{ background: 'rgba(4,120,87,0.2)' }} />
                                <span className="text-xs" style={{ color: '#6b8f7e' }}>{t('login.orContinue')}</span>
                                <div className="flex-1 h-px" style={{ background: 'rgba(4,120,87,0.2)' }} />
                            </div>
                            <button onClick={() => signIn('google', { callbackUrl: '/login' })} type="button"
                                className="btn-secondary w-full justify-center py-3 text-sm">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                {t('login.signInGoogle')}
                            </button>
                        </>
                    )}

                    <p className="text-center text-sm mt-6" style={{ color: '#6b8f7e' }}>
                        {mode === 'patient' ? (
                            <>{t('login.noAccount')}{' '}<Link href="/register" className="font-semibold hover:text-emerald-300" style={{ color: '#34d399' }}>{t('login.registerHere')}</Link></>
                        ) : (
                            <span>{t('login.doctorNote')}</span>
                        )}
                    </p>
                </div>
            </div>
        </section>
    );
}
