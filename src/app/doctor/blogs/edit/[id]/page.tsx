'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const { t } = useLanguage();
    const blogId = params.id as string;

    const [form, setForm] = useState({ title: '', content: '', excerpt: '', image: '', published: false });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!blogId) return;

        async function loadBlog() {
            try {
                const { data, error } = await supabase
                    .from('blogs')
                    .select('*')
                    .eq('id', blogId)
                    .single();

                if (!error && data) {
                    setForm({
                        title: data.title || '',
                        content: data.content || '',
                        excerpt: data.excerpt || '',
                        image: data.image || '',
                        published: data.published || false,
                    });
                } else {
                    setError(t('errors.blogNotFound'));
                }
            } catch (err) {
                setError(t('errors.failedToLoadBlog'));
            } finally {
                setLoadingData(false);
            }
        }
        loadBlog();
    }, [blogId, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase
                .from('blogs')
                .update(form)
                .eq('id', blogId);

            if (error) throw error;
            router.push('/doctor/blogs');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('errors.failedToUpdateBlog'));
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="text-center py-20">
                <span className="text-4xl block mb-4 animate-float">📝</span>
                <p style={{ color: '#6b8f7e' }}>{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-playfair text-3xl font-bold gradient-text">{t('doctor.editBlogTitle')}</h1>
                <p className="text-sm mt-1" style={{ color: '#6b8f7e' }}>{t('doctor.editBlogDesc')}</p>
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
                                <p className="text-sm font-semibold" style={{ color: '#f0fdf4' }}>{t('doctor.published')}</p>
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
                            {loading ? t('doctor.saving') : t('doctor.saveChanges')}
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
