'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';

export default function CreateBlogPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [form, setForm] = useState({ title: '', content: '', excerpt: '', image: '', published: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError(t('errors.sessionNotFound')); setLoading(false); return; }

        const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        try {
            const { error } = await supabase
                .from('blogs')
                .insert([{
                    ...form,
                    slug,
                    authorId: session.user.id
                }]);

            if (error) throw error;
            router.push('/doctor/blogs');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('errors.failedToCreateBlog'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-playfair text-3xl font-bold gradient-text">{t('doctor.createBlogTitle')}</h1>
                <p className="text-sm mt-1" style={{ color: '#6b8f7e' }}>{t('doctor.createBlogDesc')}</p>
            </div>

            <div className="max-w-3xl">
                {error && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="glass-card p-6">
                        <label className="form-label">{t('doctor.blogTitleLabel')}</label>
                        <input type="text" className="form-input text-lg"
                            placeholder={t('doctor.blogTitlePlaceholder')}
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required />
                    </div>

                    {/* Cover Image URL */}
                    <div className="glass-card p-6">
                        <label className="form-label">{t('doctor.coverImageLabel')}</label>
                        <input type="url" className="form-input"
                            placeholder={t('doctor.coverImagePlaceholder')}
                            value={form.image}
                            onChange={(e) => setForm({ ...form, image: e.target.value })} />
                        {form.image && (
                            <div className="mt-3 rounded-xl overflow-hidden" style={{ maxHeight: '200px' }}>
                                <img src={form.image} alt="Cover preview" className="w-full object-cover"
                                    onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                        )}
                    </div>

                    {/* Excerpt */}
                    <div className="glass-card p-6">
                        <label className="form-label">{t('doctor.excerptLabel')}</label>
                        <textarea className="form-input" rows={2}
                            placeholder={t('doctor.excerptPlaceholder')}
                            value={form.excerpt}
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
                    </div>

                    {/* Content */}
                    <div className="glass-card p-6">
                        <label className="form-label">{t('doctor.contentLabel')}</label>
                        <textarea className="form-input font-mono text-sm" rows={16}
                            placeholder={t('doctor.contentPlaceholder')}
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            required />
                    </div>

                    {/* Publish Toggle */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold" style={{ color: '#f0fdf4' }}>{t('doctor.publishImmediately')}</p>
                                <p className="text-xs" style={{ color: '#6b8f7e' }}>{t('doctor.publishImmediatelyDesc')}</p>
                            </div>
                            <button type="button" onClick={() => setForm({ ...form, published: !form.published })}
                                className="relative w-12 h-6 rounded-full transition-all duration-300"
                                style={{
                                    background: form.published ? 'linear-gradient(135deg, #047857, #065f46)' : 'rgba(4,120,87,0.15)',
                                }}>
                                <span className="absolute top-0.5 transition-all duration-300 w-5 h-5 rounded-full"
                                    style={{
                                        left: form.published ? '26px' : '2px',
                                        background: form.published ? '#f0fdf4' : '#6b8f7e',
                                    }} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button type="submit" disabled={loading}
                            className="btn-primary flex-1 justify-center py-3">
                            {loading ? t('doctor.saving') : form.published ? `📤 ${t('doctor.publish')}` : t('doctor.saveDraft')}
                        </button>
                        <button type="button" onClick={() => router.push('/doctor/blogs')}
                            className="btn-secondary px-6 py-3">
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
