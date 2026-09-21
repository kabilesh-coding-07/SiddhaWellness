'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer style={{ background: '#0a0f0d', borderTop: '1px solid rgba(4,120,87,0.15)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #047857, #065f46)' }}>
                                <span className="text-lg">🌿</span>
                            </div>
                            <div>
                                <span className="text-lg font-bold gradient-text">Siddha</span>
                                <span className="text-lg font-light" style={{ color: '#a7c4b8' }}>Wellness</span>
                            </div>
                        </Link>
                        <p className="text-sm leading-relaxed" style={{ color: '#6b8f7e' }}>
                            {t('footer.tagline')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4" style={{ color: '#34d399' }}>{t('footer.quickLinks')}</h4>
                        <div className="space-y-2">
                            {[
                                { href: '/about', key: 'nav.about' },
                                { href: '/services', key: 'nav.services' },
                                { href: '/doctors', key: 'nav.doctors' },
                                { href: '/blog', key: 'nav.blog' },
                                { href: '/contact', key: 'nav.contact' },
                            ].map((link) => (
                                <Link key={link.href} href={link.href}
                                    className="block text-sm transition-colors hover:text-emerald-400"
                                    style={{ color: '#6b8f7e' }}>
                                    {t(link.key)}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Treatments */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4" style={{ color: '#34d399' }}>{t('footer.treatments')}</h4>
                        <div className="space-y-2">
                            {[
                                t('services.herbalMedicine'),
                                t('services.varmam'),
                                t('services.yoga'),
                                t('services.detox'),
                                t('services.diet'),
                            ].map((name) => (
                                <Link key={name} href="/services"
                                    className="block text-sm transition-colors hover:text-emerald-400"
                                    style={{ color: '#6b8f7e' }}>
                                    {name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4" style={{ color: '#34d399' }}>{t('footer.contactInfo')}</h4>
                        <div className="space-y-3 text-sm" style={{ color: '#6b8f7e' }}>
                            <p>📍 42, Gandhi Road, T. Nagar<br />Chennai, Tamil Nadu 600017</p>
                            <p>📞 +91 44 2838 0000</p>
                            <p>✉️ care@siddhawellness.in</p>
                            <p>🕐 {t('contact.hoursText')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t" style={{ borderColor: 'rgba(4,120,87,0.1)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs" style={{ color: '#4a6658' }}>{t('footer.rights')}</p>
                    <p className="text-xs" style={{ color: '#4a6658' }}>{t('footer.madeWith')}</p>
                </div>
            </div>
        </footer>
    );
}
