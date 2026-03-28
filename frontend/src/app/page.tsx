'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';

import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!(token && user));

    async function loadData() {
        try {
            // 1. Fetch featured services
            const { data: svcData } = await supabase
                .from('services')
                .select('*')
                .limit(6);
            
            if (svcData && svcData.length > 0) {
                setServices(svcData.map(s => ({
                    icon: s.icon || '🌿',
                    title: s.name,
                    desc: s.description
                })));
            } else {
                setServices([
                    { icon: '🌿', title: t('services.herbalMedicine'), desc: t('services.herbalDesc') },
                    { icon: '🤲', title: t('services.varmam'), desc: t('services.varmamDesc') },
                    { icon: '🧘', title: t('services.yoga'), desc: t('services.yogaDesc') },
                    { icon: '🍃', title: t('services.detox'), desc: t('services.detoxDesc') },
                    { icon: '🥗', title: t('services.diet'), desc: t('services.dietDesc') },
                    { icon: '💆', title: t('services.oil'), desc: t('services.oilDesc') },
                ]);
            }

            // 2. Fetch recent blogs
            const { data: blogData } = await supabase
                .from('blogs')
                .select('*')
                .eq('published', true)
                .order('createdAt', { ascending: false })
                .limit(3);

            if (blogData && blogData.length > 0) {
                setBlogs(blogData.map(b => ({
                    title: b.title,
                    excerpt: b.excerpt || b.content.substring(0, 100) + '...',
                    date: new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    slug: b.slug
                })));
            } else {
                setBlogs([
                    { title: 'Understanding Siddha Medicine: A Complete Guide', excerpt: 'Discover the ancient Tamil medical system that has been healing people for over 5000 years...', date: 'Feb 20, 2026', slug: 'understanding-siddha-medicine' },
                    { title: '5 Herbs Every Kitchen Should Have', excerpt: 'These common herbs used in Siddha medicine can boost your immunity and wellbeing daily...', date: 'Feb 15, 2026', slug: '5-herbs-for-kitchen' },
                    { title: 'Varmam Therapy: Ancient Pressure Points', excerpt: 'Learn how this powerful Siddha technique uses 108 vital points to heal chronic conditions...', date: 'Feb 10, 2026', slug: 'varmam-therapy-guide' },
                ]);
            }
        } catch (err) {
            console.error('Error loading home data:', err);
        }
    }
    loadData();
  }, [t]);

  const bookHref = isLoggedIn ? '/dashboard/book' : '/register';

  const doctors = [
    { name: 'Dr. Kavitha Rajan', specialty: 'Varmam & Pain Management', exp: '18 years', img: '👩‍⚕️' },
    { name: 'Dr. Senthil Kumar', specialty: 'Herbal Medicine', exp: '22 years', img: '👨‍⚕️' },
    { name: 'Dr. Priya Lakshmi', specialty: "Women's Health & Fertility", exp: '15 years', img: '👩‍⚕️' },
    { name: 'Dr. Arjun Selvam', specialty: 'Detox & Rejuvenation', exp: '12 years', img: '👨‍⚕️' },
  ];

  const testimonials = [
    { name: 'Ramya S.', text: 'After years of chronic back pain, Varmam therapy at SiddhaWellness gave me complete relief in just 3 sessions. I wish I had found them sooner!', rating: 5 },
    { name: 'Karthik M.', text: "The herbal medicines prescribed by Dr. Senthil cured my skin condition that modern medicine couldn't treat for 5 years. Truly magical.", rating: 5 },
    { name: 'Lakshmi P.', text: "Dr. Priya's fertility treatment helped us conceive after 4 years of trying. We are forever grateful to SiddhaWellness.", rating: 5 },
  ];
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
                style={{ background: 'rgba(4,120,87,0.15)', border: '1px solid rgba(4,120,87,0.3)', color: '#34d399' }}>
                <span className="pulse-dot" />
                {t('home.badge')}
              </div>
              <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-tight mb-6">
                {t('home.heroTitle1')}{' '}
                <span className="gradient-text">{t('home.heroTitle2')}</span>
              </h1>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: '#a7c4b8' }}>
                {t('home.heroDesc')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={bookHref} className="btn-primary text-base py-3 px-8">
                  {t('common.bookAppointment')} →
                </Link>
                <Link href="/about" className="btn-secondary text-base py-3 px-8">
                  {t('common.learnMore')}
                </Link>
              </div>
              <div className="flex gap-8 mt-10">
                {[
                  { num: '5000+', label: t('home.stat1') },
                  { num: '15K+', label: t('home.stat2') },
                  { num: '25+', label: t('home.stat3') },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold gradient-text">{stat.num}</p>
                    <p className="text-sm" style={{ color: '#6b8f7e' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full animate-float"
                  style={{
                    background: 'radial-gradient(circle, rgba(4,120,87,0.3), transparent 70%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <div className="w-60 h-60 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(4,120,87,0.1)', border: '2px solid rgba(4,120,87,0.2)' }}>
                    <span className="text-8xl">🌿</span>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 glass-card p-3 px-5 text-sm" style={{ color: '#34d399' }}>
                  ✨ 100% Natural
                </div>
                <div className="absolute -bottom-4 -left-4 glass-card p-3 px-5 text-sm" style={{ color: '#d4a017' }}>
                  🏆 Award Winning
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(4,120,87,0.5), rgba(212,160,23,0.3), transparent)' }} />
      </section>

      {/* ═══ ABOUT SIDDHA ═══ */}
      <section className="py-24" style={{ background: '#0d1411' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#d4a017' }}>{t('home.aboutSiddha')}</p>
            <h2 className="section-title gradient-text">{t('home.scienceTitle')}</h2>
            <p className="section-subtitle">{t('home.scienceDesc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📜', title: t('home.ancientTitle'), text: t('home.ancientText') },
              { icon: '⚖️', title: t('home.balanceTitle'), text: t('home.balanceText') },
              { icon: '🔬', title: t('home.provenTitle'), text: t('home.provenText') },
            ].map((item) => (
              <div key={item.title} className="glass-card p-8 text-center">
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#34d399' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#a7c4b8' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#d4a017' }}>{t('home.ourServices')}</p>
            <h2 className="section-title gradient-text">{t('home.treatmentsTitle')}</h2>
            <p className="section-subtitle">{t('home.treatmentsDesc')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="glass-card p-8 group cursor-pointer">
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{s.icon}</span>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#f0fdf4' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#a7c4b8' }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/services" className="btn-secondary">
              {t('home.viewAllServices')}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ DOCTORS ═══ */}
      <section className="py-24" style={{ background: '#0d1411' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#d4a017' }}>{t('home.ourPhysicians')}</p>
            <h2 className="section-title gradient-text">{t('home.doctorsTitle')}</h2>
            <p className="section-subtitle">{t('home.doctorsDesc')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((d) => (
              <div key={d.name} className="glass-card p-6 text-center group cursor-pointer">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
                  style={{ background: 'rgba(4,120,87,0.15)', border: '2px solid rgba(4,120,87,0.3)' }}>
                  {d.img}
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: '#f0fdf4' }}>{d.name}</h3>
                <p className="text-sm mb-1" style={{ color: '#34d399' }}>{d.specialty}</p>
                <p className="text-xs" style={{ color: '#6b8f7e' }}>{d.exp} {t('common.yearsExp')}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/doctors" className="btn-secondary">{t('home.meetAllDoctors')}</Link>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#d4a017' }}>{t('home.testimonials')}</p>
            <h2 className="section-title gradient-text">{t('home.healingStories')}</h2>
            <p className="section-subtitle">{t('home.testimonialDesc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((tt) => (
              <div key={tt.name} className="glass-card p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: tt.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6 italic" style={{ color: '#a7c4b8' }}>
                  &ldquo;{tt.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ background: 'rgba(4,120,87,0.15)' }}>
                    {tt.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-sm" style={{ color: '#f0fdf4' }}>{tt.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BLOG ═══ */}
      <section className="py-24" style={{ background: '#0d1411' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#d4a017' }}>{t('home.healthBlog')}</p>
            <h2 className="section-title gradient-text">{t('home.wellnessInsights')}</h2>
            <p className="section-subtitle">{t('home.blogDesc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {blogs.map((b) => (
              <Link key={b.slug} href={`/blog/${b.slug}`} className="glass-card overflow-hidden group">
                <div className="h-48 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(4,120,87,0.2), rgba(212,160,23,0.1))' }}>
                  <span className="text-5xl group-hover:scale-110 transition-transform">📰</span>
                </div>
                <div className="p-6">
                  <p className="text-xs mb-2" style={{ color: '#6b8f7e' }}>{b.date}</p>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors"
                    style={{ color: '#f0fdf4' }}>{b.title}</h3>
                  <p className="text-sm" style={{ color: '#a7c4b8' }}>{b.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/blog" className="btn-secondary">{t('home.readAllArticles')}</Link>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT CTA ═══ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center, rgba(4,120,87,0.15), transparent 70%)' }} />
            <div className="relative z-10">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4 gradient-text">
                {t('home.ctaTitle')}
              </h2>
              <p className="text-lg mb-8" style={{ color: '#a7c4b8' }}>
                {t('home.ctaDesc')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={bookHref} className="btn-gold text-base py-3 px-8">
                  {t('common.bookFreeConsultation')}
                </Link>
                <Link href="/contact" className="btn-secondary text-base py-3 px-8">
                  {t('common.contactUs')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
