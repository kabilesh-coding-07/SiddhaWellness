'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client';
import { useLanguage } from '@/i18n';
import { useUser } from '@/providers/user-context';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const { loginDemoUser } = useUser();
    const supabase = createClient();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [infoMsg, setInfoMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        const messageParam = searchParams.get('message');
        if (errorParam) setError(errorParam);
        if (messageParam) setInfoMsg(messageParam);
    }, [searchParams]);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    router.push('/dashboard');
                }
            } catch { }
        };
        checkSession();
    }, [router, supabase]);

    const handleGoogleLogin = async () => {
        setOauthLoading(true);
        setError('');

        if (!isSupabaseConfigured()) {
            // Smooth instant Google sign-in fallback when Supabase keys are not set
            loginDemoUser('USER', 'Ananya Sharma (Google)', 'ananya.sharma@gmail.com');
            setTimeout(() => {
                router.push('/dashboard');
            }, 600);
            return;
        }

        try {
            const redirectUrl = typeof window !== 'undefined' 
                ? `${window.location.origin}/auth/callback` 
                : '/auth/callback';

            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (oauthError) {
                setError(oauthError.message);
                setOauthLoading(false);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google sign-in could not be initiated.');
            setOauthLoading(false);
        }
    };

    const handlePatientDemo = () => {
        setLoading(true);
        loginDemoUser('USER', 'Ananya Sharma', 'ananya@example.com');
        router.push('/dashboard');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInfoMsg('');

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: form.email.trim(),
                password: form.password,
            });

            if (signInError) {
                if (signInError.message.toLowerCase().includes('invalid login credentials')) {
                    throw new Error('Invalid email or password. You can also use the 1-Click Patient Demo below.');
                }
                throw signInError;
            }

            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : (t('errors.loginFailed') || 'Login failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-4">
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #047857, #065f46)' }}>
                        <span className="text-xl">🌿</span>
                    </div>
                    <span className="text-xl font-bold gradient-text">SiddhaWellness</span>
                </Link>
                <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: '#f0fdf4' }}>{t('login.welcomeBack')}</h1>
                <p className="text-sm" style={{ color: '#a7c4b8' }}>Sign in to manage your appointments, health records, and treatment plans.</p>
            </div>

            <div className="glass-card p-8">
                {infoMsg && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                        ℹ️ {infoMsg}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">{t('login.emailLabel')}</label>
                        <input type="email" className="form-input"
                            placeholder="you@example.com"
                            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="form-label mb-0">{t('login.password')}</label>
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="text-xs transition-colors hover:text-emerald-300" style={{ color: '#6b8f7e' }}>
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="••••••••"
                            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="btn-primary w-full justify-center py-3.5 mt-2 cursor-pointer">
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('login.signingIn')}
                            </span>
                        ) : t('login.signIn')}
                    </button>
                </form>

                {/* Google Sign In */}
                <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-px" style={{ background: 'rgba(4,120,87,0.2)' }} />
                    <span className="text-xs" style={{ color: '#6b8f7e' }}>{t('login.orContinue')}</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(4,120,87,0.2)' }} />
                </div>

                <button onClick={handleGoogleLogin} disabled={oauthLoading} type="button"
                    className="btn-secondary w-full justify-center py-3 text-sm flex items-center gap-3">
                    {oauthLoading ? (
                        <span className="inline-flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting to Google...
                        </span>
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {t('login.signInGoogle')}
                        </>
                    )}
                </button>

                {/* 1-Click Patient Demo */}
                <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(4,120,87,0.15)' }}>
                    <button type="button" onClick={handlePatientDemo}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all hover:bg-emerald-900/40 flex items-center justify-center gap-2"
                        style={{ background: 'rgba(4,120,87,0.1)', color: '#34d399', border: '1px solid rgba(4,120,87,0.25)' }}>
                        <span>⚡</span>
                        <span>1-Click Patient Demo Access</span>
                    </button>
                </div>

                <p className="text-center text-sm mt-5" style={{ color: '#6b8f7e' }}>
                    {t('login.noAccount')}{' '}
                    <Link href="/register" className="font-semibold hover:text-emerald-300" style={{ color: '#34d399' }}>{t('login.registerHere')}</Link>
                </p>

                {/* Staff Portal Link */}
                <div className="mt-6 pt-4 text-center border-t" style={{ borderColor: 'rgba(4,120,87,0.1)' }}>
                    <p className="text-xs" style={{ color: '#6b8f7e' }}>
                        Clinic Doctor or Staff?{' '}
                        <Link href="/portal/login" className="font-semibold hover:underline" style={{ color: '#d4a017' }}>
                            Clinic Portal Login →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <section className="min-h-screen flex items-center justify-center py-20 hero-gradient">
            <Suspense fallback={
                <div className="text-center py-20 text-emerald-400">Loading...</div>
            }>
                <LoginForm />
            </Suspense>
        </section>
    );
}
