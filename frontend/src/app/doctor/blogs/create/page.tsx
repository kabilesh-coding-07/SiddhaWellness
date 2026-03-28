'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';



export default function CreateBlogPage() {
    const router = useRouter();
    const [form, setForm] = useState({ title: '', content: '', excerpt: '', image: '', published: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const stored = localStorage.getItem('user');
        if (!stored) { setError('User session not found'); setLoading(false); return; }
        const user = JSON.parse(stored);

        const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        try {
            const { error } = await supabase
                .from('blogs')
                .insert([{
                    ...form,
                    slug,
                    authorId: user.id
                }]);

            if (error) throw error;
            router.push('/doctor/blogs');
        } catch (err: any) {
            setError(err.message || 'Failed to create blog');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-playfair text-3xl font-bold gradient-text">Create New Blog Post</h1>
                <p className="text-sm mt-1" style={{ color: '#6b8f7e' }}>Share your medical expertise with patients and the community.</p>
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
                            placeholder="A brief summary that appears on the blog listing page (auto-generated if left empty)"
                            value={form.excerpt}
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
                    </div>

                    {/* Content */}
                    <div className="glass-card p-6">
                        <label className="form-label">Content *</label>
                        <p className="text-xs mb-2" style={{ color: '#6b8f7e' }}>Write your article content. You can use paragraphs to structure your post.</p>
                        <textarea className="form-input font-mono text-sm" rows={16}
                            placeholder="Write your blog post content here...

Start with an engaging introduction about the topic.

Elaborate on key points with examples from your clinical experience.

Include practical tips that patients can follow at home.

End with a summary and call-to-action for booking an appointment."
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            required />
                    </div>

                    {/* Publish Toggle */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold" style={{ color: '#f0fdf4' }}>Publish immediately?</p>
                                <p className="text-xs" style={{ color: '#6b8f7e' }}>Published posts are visible to all visitors. Drafts are only visible to you.</p>
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
                            {loading ? 'Creating...' : form.published ? '📤 Publish Post' : '💾 Save as Draft'}
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
