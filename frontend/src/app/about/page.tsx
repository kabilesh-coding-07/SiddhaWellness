'use client';

import { useLanguage } from '@/i18n';

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <>
            {/* Hero */}
            <section className="hero-gradient py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#d4a017' }}>{t('nav.about')}</p>
                    <h1 className="font-playfair text-4xl md:text-5xl font-bold gradient-text mb-4">{t('about.storyTitle')} & {t('about.missionTitle')}</h1>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: '#a7c4b8' }}>
                        {t('about.pageDesc')}
                    </p>
                </div>
            </section>

            {/* Story */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-card p-10 md:p-14">
                        <h2 className="font-playfair text-3xl font-bold mb-6" style={{ color: '#34d399' }}>{t('home.scienceTitle')}</h2>
                        <div className="space-y-4 text-base leading-relaxed" style={{ color: '#a7c4b8' }}>
                            <p>{t('home.scienceDesc')}</p>
                            <p>{t('about.missionText')}</p>
                            <p>{t('about.visionText')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20" style={{ background: '#0d1411' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="section-title gradient-text">{t('about.valuesTitle')}</h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: '🌱', title: t('home.ancientTitle'), desc: t('home.ancientText') },
                            { icon: '🧬', title: t('home.balanceTitle'), desc: t('home.balanceText') },
                            { icon: '💚', title: t('about.missionTitle'), desc: t('about.missionText') },
                            { icon: '📚', title: t('home.provenTitle'), desc: t('home.provenText') },
                        ].map((v) => (
                            <div key={v.title} className="glass-card p-8 text-center">
                                <span className="text-4xl mb-4 block">{v.icon}</span>
                                <h3 className="font-semibold text-lg mb-2" style={{ color: '#f0fdf4' }}>{v.title}</h3>
                                <p className="text-sm" style={{ color: '#a7c4b8' }}>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="section-title gradient-text text-center mb-12">{t('about.storyTitle')}</h2>
                    <div className="space-y-8">
                        {[
                            { year: '2018', event: t('timeline.t2018') },
                            { year: '2020', event: t('timeline.t2020') },
                            { year: '2022', event: t('timeline.t2022') },
                            { year: '2024', event: t('timeline.t2024') },
                            { year: '2026', event: t('timeline.t2026') },
                        ].map((item, i) => (
                            <div key={item.year} className="flex gap-6 items-start">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                                        style={{ background: 'rgba(4,120,87,0.2)', border: '2px solid rgba(4,120,87,0.4)', color: '#34d399' }}>
                                        {item.year}
                                    </div>
                                    {i < 4 && <div className="w-px h-8" style={{ background: 'rgba(4,120,87,0.3)' }} />}
                                </div>
                                <p className="pt-3" style={{ color: '#a7c4b8' }}>{item.event}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
