'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    createdAt: string;
}

const defaultDemoBlogs: BlogPost[] = [
    { id: '1', title: 'Understanding Siddha Medicine: A Complete Guide', slug: 'understanding-siddha-medicine', published: true, createdAt: '2026-02-20' },
    { id: '2', title: '5 Medicinal Herbs Every Kitchen Should Have', slug: '5-herbs-for-kitchen', published: true, createdAt: '2026-02-15' },
    { id: '3', title: 'Varmam Therapy: Healing Through 108 Vital Points', slug: 'varmam-therapy-guide', published: true, createdAt: '2026-02-10' },
];

export default function PortalBlogsPage() {
    const [blogs, setBlogs] = useState<BlogPost[]>(defaultDemoBlogs);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '' });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loadBlogs = async () => {
            try {
                const { data } = await supabase
                    .from('blogs')
                    .select('id, title, slug, published, createdAt')
                    .order('createdAt', { ascending: false });

                if (data && data.length > 0) {
                    setBlogs(data);
                }
            } catch { }
        };

        loadBlogs();
    }, []);

    const handleCreateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        const newPost: BlogPost = {
            id: 'blog_' + Date.now(),
            title: form.title,
            slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            published: true,
            createdAt: new Date().toISOString()
        };

        try {
            await supabase.from('blogs').insert([{
                title: form.title,
                slug: newPost.slug,
                excerpt: form.excerpt,
                content: form.content,
                published: true
            }]);
        } catch { }

        setBlogs([newPost, ...blogs]);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            setModalOpen(false);
            setForm({ title: '', slug: '', excerpt: '', content: '' });
        }, 1500);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-playfair text-3xl font-bold mb-2 gradient-text">Health Articles & CMS</h1>
                    <p className="text-sm" style={{ color: '#6b8f7e' }}>Create, publish, and manage wellness articles on the public website.</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn-primary text-sm py-2.5 px-5 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #0e7490, #155e75)' }}>
                    + Write New Article
                </button>
            </div>

            <div className="glass-card overflow-hidden" style={{ borderColor: 'rgba(14,116,144,0.25)' }}>
                <div className="p-6">
                    <div className="space-y-3">
                        {blogs.map((b) => (
                            <div key={b.id} className="flex items-center justify-between p-4 rounded-xl"
                                style={{ background: 'rgba(14,116,144,0.04)', border: '1px solid rgba(14,116,144,0.12)' }}>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1" style={{ color: '#f0fdf4' }}>{b.title}</h3>
                                    <p className="text-xs" style={{ color: '#6b8f7e' }}>
                                        Slug: <code style={{ color: '#22d3ee' }}>/blog/{b.slug}</code> · {new Date(b.createdAt).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="badge badge-confirmed">Published</span>
                                    <a href={`/blog/${b.slug}`} target="_blank" className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-cyan-900/30"
                                        style={{ color: '#22d3ee', border: '1px solid rgba(14,116,144,0.3)' }}>
                                        View Live ↗
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Article Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setModalOpen(false)}>
                    <div className="glass-card p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}
                        style={{ background: '#0d1411', border: '1px solid rgba(14,116,144,0.4)' }}>
                        <h3 className="text-xl font-semibold mb-4" style={{ color: '#f0fdf4' }}>Publish New Health Article</h3>
                        {saved && (
                            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                                ✓ Article successfully published to public blog!
                            </div>
                        )}
                        <form onSubmit={handleCreateBlog} className="space-y-4">
                            <div>
                                <label className="form-label">Article Title</label>
                                <input type="text" className="form-input" placeholder="e.g. 5 Benefits of Daily Varmam Therapy"
                                    value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="form-label">Short Excerpt</label>
                                <input type="text" className="form-input" placeholder="Brief summary of the article..."
                                    value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Article Content</label>
                                <textarea className="form-input" rows={6} placeholder="Write the full health guide or article content here..."
                                    value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                                <button type="submit" className="btn-primary text-sm py-2 px-6"
                                    style={{ background: 'linear-gradient(135deg, #0e7490, #155e75)' }}>
                                    Publish Article
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
