'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Blog {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    createdAt: string;
}

const staticBlogs = [
    { slug: 'understanding-siddha-medicine', titleKey: 'b1', date: 'Feb 20, 2026', categoryKey: 'edu' },
    { slug: '5-herbs-for-kitchen', titleKey: 'b2', date: 'Feb 15, 2026', categoryKey: 'nutri' },
    { slug: 'varmam-therapy-guide', titleKey: 'b3', date: 'Feb 10, 2026', categoryKey: 'treat' },
];

export default function BlogPage() {
    const { t } = useLanguage();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/blogs`)
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) { setBlogs(data); setLoaded(true); } })
            .catch(() => setLoaded(true));
    }, []);

    return (
        <>
            <section className="hero-gradient py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#d4a017' }}>{t('home.healthBlog')}</p>
                    <h1 className="font-playfair text-4xl md:text-5xl font-bold gradient-text mb-4">{t('blog.pageTitle')}</h1>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: '#a7c4b8' }}>
                        {t('blog.pageDesc')}
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(blogs.length > 0 ? blogs : (loaded ? [] : [])).map((b) => (
                            <Link key={b.slug} href={`/blog/${b.slug}`} className="glass-card overflow-hidden group flex flex-col">
                                <div className="h-48 flex items-center justify-center relative"
                                    style={{ background: 'linear-gradient(135deg, rgba(4,120,87,0.2), rgba(212,160,23,0.1))' }}>
                                    <span className="text-6xl group-hover:scale-110 transition-transform">📰</span>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <p className="text-xs mb-2" style={{ color: '#6b8f7e' }}>
                                        {new Date(b.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                    <h3 className="text-lg font-semibold mb-3 group-hover:text-emerald-400 transition-colors"
                                        style={{ color: '#f0fdf4' }}>{b.title}</h3>
                                    <p className="text-sm flex-1" style={{ color: '#a7c4b8' }}>{b.excerpt}</p>
                                    <span className="text-sm font-semibold mt-4 inline-block" style={{ color: '#34d399' }}>{t('common.readMore')}</span>
                                </div>
                            </Link>
                        ))}
                        {blogs.length === 0 && loaded && staticBlogs.map((b) => (
                            <Link key={b.slug} href={`/blog/${b.slug}`} className="glass-card overflow-hidden group flex flex-col">
                                <div className="h-48 flex items-center justify-center relative"
                                    style={{ background: 'linear-gradient(135deg, rgba(4,120,87,0.2), rgba(212,160,23,0.1))' }}>
                                    <span className="text-6xl group-hover:scale-110 transition-transform">📰</span>
                                    <span className="absolute top-4 left-4 text-xs px-3 py-1 rounded-full font-medium"
                                        style={{ background: 'rgba(4,120,87,0.3)', color: '#34d399' }}>{t(`blogList.categories.${b.categoryKey}`)}</span>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <p className="text-xs mb-2" style={{ color: '#6b8f7e' }}>{b.date}</p>
                                    <h3 className="text-lg font-semibold mb-3 group-hover:text-emerald-400 transition-colors"
                                        style={{ color: '#f0fdf4' }}>{t(`blogList.titles.${b.titleKey}`)}</h3>
                                    <p className="text-sm flex-1" style={{ color: '#a7c4b8' }}>{t(`blogList.excerpts.${b.titleKey}`)}</p>
                                    <span className="text-sm font-semibold mt-4 inline-block" style={{ color: '#34d399' }}>{t('common.readMore')}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
