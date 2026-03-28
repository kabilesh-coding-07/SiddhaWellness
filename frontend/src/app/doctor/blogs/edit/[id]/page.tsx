'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';


import { supabase } from '@/lib/supabase';

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
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
                    setError('Blog post not found');
                }
            } catch (err) {
                setError('Failed to load blog');
            } finally {
                setLoadingData(false);
            }
        }
        loadBlog();
    }, [blogId]);

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
        } catch (err: any) {
            setError(err.message || 'Failed to update blog');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="text-center py-20">
                <span className="text-4xl block mb-4 animate-float">📝</span>
                <p style={{ color: '#6b8f7e' }}>Loading blog post...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-playfair text-3xl font-bold gradient-text">Edit Blog Post</h1>
                <p className="text-sm mt-1" style={{ color: '#6b8f7e' }}>Update your article content and settings.</p>
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
                        <label className="form-label">Blog Title *</label>
                        <input type="text" className="form-input text-lg"
                            placeholder="e.g. Top 5 Siddha Remedies for Joint Pain"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required />
                    </div>

                    {/* Cover Image URL */}
                    <div className="glass-card p-6">
                        <label className="form-label">Cover Image URL</label>
                        <input type="url" className="form-input"
                            placeholder="https://example.com/image.jpg"
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
                        <label className="form-label">Excerpt / Summary</label>
                        <textarea className="form-input" rows={2}
                            placeholder="A brief summary that appears on the blog listing page"
                            value={form.excerpt}
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
                    </div>

                    {/* Content */}
                    <div className="glass-card p-6">
                        <label className="form-label">Content *</label>
                        <textarea className="form-input font-mono text-sm" rows={16}
                            placeholder="Write your blog post content here..."
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            required />
                    </div>

                    {/* Publish Toggle */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold" style={{ color: '#f0fdf4' }}>Published</p>
                                <p className="text-xs" style={{ color: '#6b8f7e' }}>Toggle to publish or unpublish this post.</p>
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
                            {loading ? 'Saving...' : '💾 Save Changes'}
                        </button>
                        <button type="button" onClick={() => router.push('/doctor/blogs')}
                            className="btn-secondary px-6 py-3">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
