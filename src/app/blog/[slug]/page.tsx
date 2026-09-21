'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Fallback static data for when API is down
const staticBlogData: Record<string, { title: string; date: string; category: string; content: string }> = {
    'understanding-siddha-medicine': {
        title: 'Understanding Siddha Medicine: A Complete Guide',
        date: 'February 20, 2026',
        category: 'Education',
        content: `Siddha medicine is one of the oldest traditional medicine systems in the world, originating in ancient Tamil Nadu, India. It was developed by 18 Siddhars — enlightened sages who achieved mastery over body, mind, and nature.\n\n## The Three Humors\n\nSiddha medicine is based on the concept of three vital humors (Mukkuttram):\n\n**Vatham (Wind):** Controls movement, breathing, and nervous system functions.\n\n**Pitham (Fire):** Governs metabolism, digestion, and body temperature.\n\n**Kabam (Water):** Manages structure, lubrication, and immune function.\n\nDisease occurs when these three humors go out of balance. Siddha treatment aims to restore this balance through natural means.\n\n## Treatment Methods\n\nSiddha uses a comprehensive approach including:\n\n1. **Internal Medicine** — Herbal preparations, mineral-based medicines\n2. **External Therapy** — Oil massage, poultices, steam therapy\n3. **Varmam** — Pressure-point healing\n4. **Diet Therapy** — Food as medicine\n5. **Yoga & Meditation** — Mind-body harmony\n\n## Modern Relevance\n\nSiddha medicine has been recognized by WHO and is officially supported by the Government of India under AYUSH. Modern research continues to validate the effectiveness of Siddha treatments for chronic diseases, skin conditions, and neurological disorders.`,
    },
    '5-herbs-for-kitchen': {
        title: '5 Medicinal Herbs Every Kitchen Should Have',
        date: 'February 15, 2026',
        category: 'Nutrition',
        content: `Your kitchen is already a mini pharmacy. Many herbs and spices used daily in Indian cooking have powerful medicinal properties recognized by Siddha medicine for thousands of years.\n\n## 1. Turmeric (Manjal)\n\nThe golden spice contains curcumin, a potent anti-inflammatory and antioxidant. In Siddha medicine, turmeric is used to treat wounds, skin conditions, and digestive problems.\n\n**Daily use:** Add to warm milk, curries, or rice for daily immunity support.\n\n## 2. Holy Basil (Thulasi)\n\nConsidered sacred in Indian tradition, tulsi is an adaptogen that helps the body cope with stress. It boosts immunity and has strong antibacterial properties.\n\n**Daily use:** Brew 4-5 fresh leaves in hot water for a calming herbal tea.\n\n## 3. Ginger (Inji)\n\nA powerful digestive aid and anti-nausea remedy. Siddha practitioners prescribe ginger for cold, cough, and respiratory issues.\n\n**Daily use:** Fresh ginger tea, or add to stir-fries and soups.\n\n## 4. Curry Leaves (Kariveppilai)\n\nRich in iron and antioxidants, curry leaves support liver health, improve digestion, and help manage blood sugar levels.\n\n**Daily use:** Add fresh leaves to tempering (tadka) for dals and curries.\n\n## 5. Black Pepper (Milagu)\n\nKnown as the "King of Spices," black pepper enhances nutrient absorption, especially of curcumin. It has strong antimicrobial properties.\n\n**Daily use:** Add freshly ground pepper to any dish for flavor and health benefits.`,
    },
    'varmam-therapy-guide': {
        title: 'Varmam Therapy: Healing Through 108 Vital Points',
        date: 'February 10, 2026',
        category: 'Treatments',
        content: `Varmam therapy is a unique and powerful treatment modality within Siddha medicine. It involves the application of precise pressure on specific energy points (varma points) on the human body.\n\n## What are Varma Points?\n\nThe human body has 108 varma points — vital energy centers where prana (life force) concentrates. These points control various physiological functions and organ systems.\n\n## How Does Varmam Therapy Work?\n\nA trained Varmam practitioner applies calculated pressure on specific points to:\n\n- **Restore energy flow** through blocked channels\n- **Stimulate nerve function** in affected areas\n- **Release muscle tension** and reduce inflammation\n- **Activate the body's natural healing** mechanisms\n\n## Conditions Treated\n\nVarmam therapy is especially effective for:\n\n- Chronic back pain and sciatica\n- Frozen shoulder and joint stiffness\n- Paralysis and stroke rehabilitation\n- Sports injuries\n- Headaches and migraines\n- Neurological conditions\n\n## What to Expect\n\nA typical session lasts 45-60 minutes. The practitioner assesses your condition and applies precise pressure techniques. Most patients feel significant relief within 1-3 sessions.`,
    },
};

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    image?: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
}


export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [usedFallback, setUsedFallback] = useState(false);

    useEffect(() => {
        if (!slug) return;
        
        async function loadBlog() {
            try {
                const { data, error } = await supabase
                    .from('blogs')
                    .select('*')
                    .eq('slug', slug)
                    .eq('published', true)
                    .single();

                if (!error && data) {
                    setBlog(data);
                    setLoading(false);
                } else {
                    throw new Error('Not found');
                }
            } catch (err) {
                // Fallback to static data
                const fallback = staticBlogData[slug];
                if (fallback) {
                    setBlog({
                        id: slug,
                        title: fallback.title,
                        slug,
                        content: fallback.content,
                        excerpt: '',
                        published: true,
                        createdAt: fallback.date,
                        updatedAt: fallback.date,
                    });
                    setUsedFallback(true);
                }
                setLoading(false);
            }
        }
        loadBlog();
    }, [slug]);

    if (loading) {
        return (
            <section className="py-32 text-center">
                <div className="animate-pulse">
                    <div className="w-16 h-16 mx-auto rounded-full mb-4" style={{ background: 'rgba(4,120,87,0.2)' }} />
                    <p style={{ color: '#6b8f7e' }}>Loading article...</p>
                </div>
            </section>
        );
    }

    if (!blog) {
        return (
            <section className="py-32 text-center">
                <h1 className="text-3xl font-bold gradient-text mb-4">Article Not Found</h1>
                <p style={{ color: '#a7c4b8' }} className="mb-8">This blog post doesn&apos;t exist or has been removed.</p>
                <Link href="/blog" className="btn-primary">← Back to Blog</Link>
            </section>
        );
    }

    return (
        <article className="py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/blog" className="text-sm transition-colors hover:text-emerald-400" style={{ color: '#6b8f7e' }}>
                        ← Back to Blog
                    </Link>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(4,120,87,0.3)', color: '#34d399' }}>
                    {usedFallback ? 'Article' : 'Published'}
                </span>
                <h1 className="font-playfair text-3xl md:text-4xl font-bold mt-4 mb-4" style={{ color: '#f0fdf4' }}>
                    {blog.title}
                </h1>
                <p className="text-sm mb-10" style={{ color: '#6b8f7e' }}>
                    {new Date(blog.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="prose prose-invert max-w-none leading-relaxed" style={{ color: '#a7c4b8' }}>
                    {blog.content.split('\n\n').map((p, i) => {
                        if (p.startsWith('## ')) return <h2 key={i} className="font-playfair text-2xl font-bold mt-10 mb-4" style={{ color: '#34d399' }}>{p.replace('## ', '')}</h2>;
                        if (p.startsWith('**') && p.endsWith('**')) return <p key={i} className="font-semibold my-2" style={{ color: '#f0fdf4' }}>{p.replace(/\*\*/g, '')}</p>;
                        if (p.startsWith('1.') || p.startsWith('-')) return <div key={i} className="my-2 ml-4">{p.split('\n').map((l, j) => <p key={j} className="mb-1">{l}</p>)}</div>;
                        return <p key={i} className="mb-4">{p}</p>;
                    })}
                </div>
            </div>
        </article>
    );
}
