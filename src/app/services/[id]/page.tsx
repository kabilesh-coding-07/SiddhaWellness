import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const allServices = [
    { id: '1', icon: '🌿', title: 'Herbal Medicine', desc: 'Customized herbal formulations prepared from rare medicinal plants following ancient Siddha texts. Each medicine is carefully prepared based on your body type and condition.', price: '₹500 – ₹2,000', duration: '30–45 min consultation', benefits: ['Personalized herbal formulations', 'No synthetic chemicals', 'Root-cause treatment approach', 'Safe for long-term use', 'Boosts natural immunity'], details: 'Our Siddha physicians analyze your pulse (Naadi Pariksha), body constitution, and symptoms to prescribe a unique combination of herbs. Each formulation is freshly prepared in our in-house pharmacy using sustainably sourced medicinal plants from the Western Ghats. Treatments cover chronic illnesses, auto-immune conditions, digestive disorders, and preventive wellness.' },
    { id: '2', icon: '🤲', title: 'Varmam Therapy', desc: 'Ancient pressure-point healing technique targeting 108 vital energy points. Highly effective for pain management, neurological conditions, and sports injuries.', price: '₹1,500 – ₹3,000', duration: '45–60 min session', benefits: ['Non-invasive pain relief', 'Targets 108 vital energy points', 'Effective for chronic conditions', 'Improves nerve function', 'Accelerates injury recovery'], details: 'Varmam is one of the most powerful healing arts in Siddha medicine. Our Varmam specialists apply precise pressure on specific vital points to unblock energy channels, restore nerve function, and stimulate the body\'s natural healing response. This therapy is particularly effective for paralysis, frozen shoulder, sciatica, cervical spondylosis, and sports injuries. Results are often seen from the very first session.' },
    { id: '3', icon: '🧘', title: 'Yoga & Pranayama', desc: 'Traditional yoga practices specifically designed using Siddha medical principles. Custom sequences for your body constitution and health condition.', price: '₹800 – ₹1,500', duration: '60 min session', benefits: ['Customized for your body type', 'Combines Siddha + Yoga wisdom', 'Stress and anxiety relief', 'Improves flexibility and strength', 'Enhances respiratory function'], details: 'Unlike generic yoga classes, our Siddha-informed yoga sessions are designed specifically for your body constitution (Vatham, Pitham, or Kabam). Our therapists prescribe targeted asanas, pranayama breathing techniques, and meditation practices that complement your ongoing Siddha treatment. Sessions address specific health goals including weight management, stress reduction, hormonal balance, and chronic disease management.' },
    { id: '4', icon: '🍃', title: 'Panchakarma Detox', desc: 'Five-step deep cleansing therapy to eliminate accumulated toxins from the body. Includes Vamanam, Virechanam, Nasiyam, Vasti, and Raktamokshanam.', price: '₹5,000 – ₹15,000', duration: '5–21 day program', benefits: ['Complete body detoxification', 'Restores digestive fire (Agni)', 'Clears blocked energy channels', 'Rejuvenates skin and organs', 'Prevents chronic diseases'], details: 'Our Panchakarma program is a comprehensive detox experience supervised by senior physicians. The five therapeutic procedures — Vamanam (therapeutic emesis), Virechanam (purgation), Nasiyam (nasal therapy), Vasti (enema therapy), and Raktamokshanam (blood purification) — are carefully sequenced based on your condition. The program includes pre-detox preparation (Poorva Karma), main procedures (Pradhana Karma), and post-detox rejuvenation (Paschat Karma) with dietary guidance.' },
    { id: '5', icon: '🥗', title: 'Diet & Nutrition Therapy', desc: 'Personalized Pathya (diet) plans based on your body constitution. Siddha nutrition science ensures optimal healing and disease prevention.', price: '₹1,000 – ₹2,500', duration: '45 min consultation', benefits: ['Constitution-based diet plans', 'Food as medicine approach', 'Seasonal dietary adjustments', 'Addresses food intolerances', 'Supports ongoing treatments'], details: 'In Siddha medicine, food is the first medicine. Our nutrition consultants create personalized Pathya (dietary) plans based on your body constitution, current health conditions, and seasonal factors. We identify foods that heal your specific condition and those that aggravate it. The plan includes meal schedules, cooking methods, spice recommendations, and therapeutic food recipes that have been used in Siddha tradition for centuries.' },
    { id: '6', icon: '💆', title: 'Thokkanam (Oil Therapy)', desc: 'Traditional Siddha massage with medicated herbal oils. Nine types of specialized massage techniques for pain relief, relaxation, and rejuvenation.', price: '₹2,000 – ₹4,000', duration: '60–90 min session', benefits: ['Deep tissue healing', 'Medicated herbal oils', '9 specialized techniques', 'Relieves muscle tension', 'Improves blood circulation'], details: 'Thokkanam is the traditional Siddha massage therapy that uses nine distinct techniques — Thattal, Irukkal, Pidithal, Murukkuthal, Kattuthal, Azhuttuthal, Izhutthal, Mallathuthal, and Asaithal. Each technique targets different body systems and conditions. We use custom-prepared medicated oils infused with rare herbs like Nirgundi, Bala, and Ashwagandha. The therapy improves lymphatic drainage, reduces inflammation, and accelerates healing of musculoskeletal conditions.' },
    { id: '7', icon: '🌸', title: 'Women\'s Health', desc: 'Specialized treatments for PCOS, menstrual disorders, fertility issues, and menopausal care using time-tested Siddha formulations.', price: '₹1,000 – ₹3,000', duration: '45 min consultation', benefits: ['PCOS & PCOD management', 'Natural fertility enhancement', 'Menstrual cycle regulation', 'Menopausal symptom relief', 'Hormonal balance restoration'], details: 'Our women\'s health program addresses the full spectrum of gynecological conditions through Siddha medicine. Dr. Priya Lakshmi leads this specialty with 15+ years of experience helping women achieve hormonal balance naturally. Treatments include internal herbal medicines (Chooranam, Lehyam), external therapies (Pichu, Kizhi), and lifestyle modifications. We have helped 500+ couples achieve natural conception and provided relief to thousands of women suffering from PCOS, endometriosis, and menopausal symptoms.' },
    { id: '8', icon: '🧪', title: 'Skin & Hair Care', desc: 'Natural treatments for eczema, psoriasis, acne, hair fall, and premature greying using Siddha herbal preparations and medicated oils.', price: '₹1,000 – ₹2,500', duration: '30–45 min', benefits: ['100% natural formulations', 'Treats root cause of skin issues', 'Medicated hair oils', 'No steroid dependency', 'Long-lasting results'], details: 'Siddha medicine offers remarkably effective treatments for chronic skin conditions that often resist conventional medicine. Our dermatology specialists use a combination of internal detoxification (blood purification therapies), external applications (medicated pastes, oils, and baths), and dietary modifications. Conditions treated include psoriasis, eczema, vitiligo, acne, fungal infections, hair fall, premature greying, and dandruff. Our herbal hair oils and skin preparations are made fresh in our pharmacy.' },
    { id: '9', icon: '🦴', title: 'Joint & Bone Care', desc: 'Effective Siddha treatments for arthritis, spine disorders, fractures, and joint degeneration using Varmam, oils, and internal medicines.', price: '₹1,500 – ₹4,000', duration: '45–60 min', benefits: ['Non-surgical pain management', 'Varmam + herbal combination', 'Cartilage regeneration support', 'Spine disorder treatment', 'Post-fracture rehabilitation'], details: 'Our orthopedic Siddha program combines multiple modalities — Varmam therapy for nerve stimulation, Thokkanam massage with medicated oils, Kizhi (herbal poultice) applications, and potent internal medicines. Dr. Vijay Anand specializes in treating rheumatoid arthritis, osteoarthritis, disc prolapse, cervical and lumbar spondylosis, and sports injuries. Many patients who were advised surgery have found complete relief through our integrated Siddha approach.' },
];

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
    return allServices.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const service = allServices.find((s) => s.id === id);
    return {
        title: service ? `${service.title} — SiddhaWellness.in` : 'Service Not Found',
        description: service?.desc,
    };
}

export default async function ServiceDetailPage({ params }: Props) {
    const { id } = await params;
    const service = allServices.find((s) => s.id === id);

    if (!service) return notFound();

    return (
        <>
            {/* Hero */}
            <section className="hero-gradient py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/services" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-emerald-300" style={{ color: '#6b8f7e' }}>
                        ← Back to Services
                    </Link>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-7xl mb-6 block">{service.icon}</span>
                            <h1 className="font-playfair text-4xl md:text-5xl font-bold gradient-text mb-4">{service.title}</h1>
                            <p className="text-lg leading-relaxed mb-6" style={{ color: '#a7c4b8' }}>{service.desc}</p>
                            <div className="flex flex-wrap gap-6">
                                <div className="glass-card px-5 py-3">
                                    <p className="text-xs mb-1" style={{ color: '#6b8f7e' }}>Price Range</p>
                                    <p className="font-semibold" style={{ color: '#34d399' }}>{service.price}</p>
                                </div>
                                <div className="glass-card px-5 py-3">
                                    <p className="text-xs mb-1" style={{ color: '#6b8f7e' }}>Duration</p>
                                    <p className="font-semibold" style={{ color: '#d4a017' }}>{service.duration}</p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex justify-center">
                            <div className="w-72 h-72 rounded-full flex items-center justify-center animate-float"
                                style={{ background: 'radial-gradient(circle, rgba(4,120,87,0.25), transparent 70%)' }}>
                                <div className="w-52 h-52 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(4,120,87,0.1)', border: '2px solid rgba(4,120,87,0.2)' }}>
                                    <span className="text-8xl">{service.icon}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Details */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main content */}
                        <div className="lg:col-span-2">
                            <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: '#f0fdf4' }}>About This Treatment</h2>
                            <p className="text-base leading-relaxed mb-10" style={{ color: '#a7c4b8' }}>{service.details}</p>

                            <h3 className="font-playfair text-xl font-bold mb-5" style={{ color: '#f0fdf4' }}>Key Benefits</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {service.benefits.map((benefit) => (
                                    <div key={benefit} className="flex items-start gap-3 p-4 rounded-xl"
                                        style={{ background: 'rgba(4,120,87,0.06)', border: '1px solid rgba(4,120,87,0.1)' }}>
                                        <span className="text-emerald-400 text-lg mt-0.5">✓</span>
                                        <span className="text-sm" style={{ color: '#a7c4b8' }}>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar CTA */}
                        <div>
                            <div className="glass-card p-8 sticky top-28">
                                <h3 className="font-playfair text-xl font-bold mb-2" style={{ color: '#f0fdf4' }}>Book This Treatment</h3>
                                <p className="text-sm mb-6" style={{ color: '#6b8f7e' }}>Schedule a consultation with our expert Siddha physicians.</p>
                                <div className="space-y-3 mb-6" style={{ borderTop: '1px solid rgba(4,120,87,0.15)', paddingTop: '1.5rem' }}>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: '#6b8f7e' }}>Price</span>
                                        <span className="font-semibold" style={{ color: '#34d399' }}>{service.price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: '#6b8f7e' }}>Duration</span>
                                        <span className="font-semibold" style={{ color: '#d4a017' }}>{service.duration}</span>
                                    </div>
                                </div>
                                <Link href="/dashboard/book" className="btn-primary w-full justify-center text-center">
                                    Book Appointment →
                                </Link>
                                <Link href="/contact" className="btn-secondary w-full justify-center text-center mt-3">
                                    Ask a Question
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
