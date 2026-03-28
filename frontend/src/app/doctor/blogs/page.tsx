'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';


interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function DoctorBlogsPage() {
    const { t } = useLanguage();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBlogs() {
            const stored = localStorage.getItem('user');
            if (!stored) { setLoading(false); return; }
            const user = JSON.parse(stored);

            try {
                const { data, error } = await supabase
                    .from('blogs')
                    .select('*')
                    .eq('authorId', user.id)
                    .order('createdAt', { ascending: false });

                if (!error && data) setBlogs(data);
            } catch (err) {
                console.error('Error fetching blogs:', err);
            } finally {
                setLoading(false);
            }
        }
        loadBlogs();
    }, []);

    const deleteBlog = async (id: string) => {
        if (!confirm(t('doctor.deleteBlogConfirm'))) return;
        try {
            const { error } = await supabase
                .from('blogs')
                .delete()
                .eq('id', id);

            if (!error) {
                setBlogs((prev) => prev.filter((b) => b.id !== id));
            }
        } catch { /* silently fail */ }
    };

    const togglePublish = async (id: string, published: boolean) => {
        try {
            const { error } = await supabase
                .from('blogs')
                .update({ published: !published })
                .eq('id', id);

            if (!error) {
                setBlogs((prev) => prev.map((b) => b.id === id ? { ...b, published: !published } : b));
            }
        } catch { /* silently fail */ }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-playfair text-3xl font-bold gradient-text">{t('doctor.blogManagement')}</h1>
                    <p className="text-sm mt-1" style={{ color: '#6b8f7e' }}>{t('doctor.blogManagementDesc')}</p>
                </div>
                <Link href="/doctor/blogs/create"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'linear-gradient(135deg, #047857, #065f46)', color: '#f0fdf4' }}>
                    {t('doctor.newPost')}
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <span className="text-4xl block mb-4 animate-float">📝</span>
                    <p style={{ color: '#6b8f7e' }}>{t('common.loading')}</p>
                </div>
            ) : blogs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <span className="text-6xl block mb-4">📝</span>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#f0fdf4' }}>{t('doctor.noPosts')}</h3>
                    <p className="text-sm mb-6" style={{ color: '#6b8f7e' }}>{t('doctor.noPostsDesc')}</p>
                    <Link href="/doctor/blogs/create" className="btn-primary">{t('doctor.createPost')}</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="glass-card p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold" style={{ color: '#f0fdf4' }}>{blog.title}</h3>
                                        <span className="px-2 py-0.5 rounded text-xs font-semibold"
                                            style={{
                                                background: blog.published ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                                                color: blog.published ? '#22c55e' : '#eab308',
                                                border: `1px solid ${blog.published ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`,
                                            }}>
                                            {blog.published ? t('doctor.published') : t('doctor.draft')}
                                        </span>
                                    </div>
                                    {blog.excerpt && (
                                        <p className="text-sm mb-2" style={{ color: '#a7c4b8' }}>
                                            {blog.excerpt.substring(0, 120)}...
                                        </p>
                                    )}
                                    <p className="text-xs" style={{ color: '#6b8f7e' }}>
                                        {t('doctor.lastUpdated')} {new Date(blog.updatedAt).toLocaleDateString(t('common.locale') === 'ta' ? 'ta-IN' : 'en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => togglePublish(blog.id, blog.published)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                        style={{
                                            background: blog.published ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)',
                                            color: blog.published ? '#eab308' : '#22c55e',
                                            border: `1px solid ${blog.published ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`,
                                        }}>
                                        {blog.published ? t('doctor.unpublish') : t('doctor.publish')}
                                    </button>
                                    <Link href={`/doctor/blogs/edit/${blog.id}`}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                        style={{ background: 'rgba(4,120,87,0.1)', color: '#34d399', border: '1px solid rgba(4,120,87,0.2)' }}>
                                        ✏️ {t('common.edit')}
                                    </Link>
                                    <button onClick={() => deleteBlog(blog.id)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                        🗑️ {t('common.delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
