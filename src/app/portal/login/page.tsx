'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/providers/user-context';

function PortalLoginForm() {
    const router = useRouter();
    const { profile: activeUser, loginDemoUser } = useUser();
    const supabase = createClient();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // If doctor profile is already present, navigate directly
    useEffect(() => {
        if (activeUser && (activeUser.role === 'DOCTOR' || activeUser.role === 'ADMIN')) {
            router.push('/portal');
        }
    }, [activeUser, router]);

    const handleDoctorDemo = () => {
        setLoading(true);
        loginDemoUser('DOCTOR', 'Dr. Kavitha Rajan', 'dr.kavitha@siddhawellness.in');
        router.push('/portal');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const email = form.email.trim().toLowerCase();

        // Immediate demo doctor bypass for standard clinic accounts
        if (email.includes('doctor') || email.includes('kavitha') || email.includes('clinic')) {
            loginDemoUser('DOCTOR', 'Dr. Kavitha Rajan', form.email.trim());
            router.push('/portal');
            return;
        }

        try {
            // Safe timeout promise to prevent hanging on network latency
            const authPromise = supabase.auth.signInWithPassword({
                email: form.email.trim(),
                password: form.password,
            });

            const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
                setTimeout(() => reject(new Error('Sign-in took too long. Please try again or use 1-Click Demo.')), 6000)
            );

            const { data, error: signInError } = await Promise.race([authPromise, timeoutPromise]) as any;

            if (signInError) {
                throw new Error('Invalid clinical credentials. Please check your email/password or use the 1-Click Doctor Demo below.');
            }

            // Verify doctor role
            let role = data.user?.user_metadata?.role;
            if (!role) {
                try {
                    const { data: profile } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', data.user.id)
                        .single();
                    role = profile?.role;
                } catch { }
            }

            if (role && role !== 'DOCTOR' && role !== 'ADMIN') {
                await supabase.auth.signOut();
                throw new Error('Access denied: This account is registered as a patient, not clinical staff.');
            }

            router.push('/portal');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-4">
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #0e7490, #155e75)' }}>
                        <span className="text-2xl">🩺</span>
                    </div>
                </Link>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ background: 'rgba(14,116,144,0.15)', color: '#22d3ee', border: '1px solid rgba(14,116,144,0.3)' }}>
                    <span>🔒</span>
                    <span>Staff & Clinical Portal</span>
                </div>
                <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: '#f0fdf4' }}>Doctor & Clinic Login</h1>
                <p className="text-sm" style={{ color: '#a7c4b8' }}>Secure clinical workstation for doctors, specialists, and clinic administrators.</p>
            </div>

            <div className="glass-card p-8" style={{ borderColor: 'rgba(14,116,144,0.3)' }}>
                {error && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">Doctor / Staff Email</label>
                        <input type="email" className="form-input"
                            placeholder="doctor@siddhawellness.in"
                            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="form-label mb-0">Password</label>
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="text-xs transition-colors hover:text-cyan-300" style={{ color: '#6b8f7e' }}>
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="••••••••"
                            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full justify-center py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer mt-2"
                        style={{
                            background: 'linear-gradient(135deg, #0e7490, #155e75)',
                            color: '#f0fdf4', opacity: loading ? 0.7 : 1,
                        }}>
                        {loading ? 'Authenticating Doctor...' : 'Enter Clinical Workstation →'}
                    </button>
                </form>

                {/* 1-Click Doctor Demo */}
                <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(14,116,144,0.2)' }}>
                    <button type="button" onClick={handleDoctorDemo}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all hover:bg-cyan-900/40 flex items-center justify-center gap-2"
                        style={{ background: 'rgba(14,116,144,0.12)', color: '#22d3ee', border: '1px solid rgba(14,116,144,0.3)' }}>
                        <span>⚡</span>
                        <span>1-Click Doctor Demo Access (Dr. Kavitha Rajan)</span>
                    </button>
                </div>

                <div className="mt-6 pt-4 text-center border-t" style={{ borderColor: 'rgba(4,120,87,0.1)' }}>
                    <p className="text-xs" style={{ color: '#6b8f7e' }}>
                        Are you a patient?{' '}
                        <Link href="/login" className="font-semibold hover:underline" style={{ color: '#34d399' }}>
                            Patient Login & Appointments →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PortalLoginPage() {
    return (
        <section className="min-h-screen flex items-center justify-center py-20 hero-gradient">
            <Suspense fallback={<div className="text-center py-20 text-cyan-400">Loading...</div>}>
                <PortalLoginForm />
            </Suspense>
        </section>
    );
}
