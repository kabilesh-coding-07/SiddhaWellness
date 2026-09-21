import { NextResponse } from 'next/server';

export interface SharedAppointment {
    id: string;
    doctorId?: string;
    date: string;
    time: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    symptoms?: string;
    notes?: string;
    doctor?: {
        specialty: string;
        user: { name: string };
    };
    user?: {
        name: string;
        email?: string;
        phone?: string;
        medicalHistory?: string;
    };
    createdAt?: string;
}

let globalAppointments: SharedAppointment[] = [
    {
        id: 'apt_kabilesh_1',
        doctorId: 'cmn7rznoe0004rjp8n1ctzlbq',
        date: '2026-10-01',
        time: '03:30 PM',
        status: 'PENDING',
        symptoms: 'General health assessment & Siddha consultation',
        notes: '',
        doctor: {
            specialty: 'Varmam & Pain Management',
            user: { name: 'Dr. Kavitha Rajan' }
        },
        user: {
            name: 'Kabilesh',
            email: 'kabileshcoding07@gmail.com',
            phone: '+91 98765 43210'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'apt_kabilesh_2',
        doctorId: 'cmn7rznoe0004rjp8n1ctzlbq',
        date: '2026-09-30',
        time: '06:00 PM',
        status: 'CONFIRMED',
        symptoms: 'Digestive balance & wellness check',
        notes: 'Confirmed appointment. Prescribed preliminary herbal consultation.',
        doctor: {
            specialty: 'Varmam & Pain Management',
            user: { name: 'Dr. Kavitha Rajan' }
        },
        user: {
            name: 'Kabilesh',
            email: 'kabileshcoding07@gmail.com',
            phone: '+91 98765 43210'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'apt_kabilesh_3',
        doctorId: 'cmn7rznoe0004rjp8n1ctzlbq',
        date: '2026-09-22',
        time: '04:30 PM',
        status: 'PENDING',
        symptoms: 'Follow-up on Siddha dietary guidelines',
        notes: '',
        doctor: {
            specialty: 'Varmam & Pain Management',
            user: { name: 'Dr. Kavitha Rajan' }
        },
        user: {
            name: 'Kabilesh',
            email: 'kabileshcoding07@gmail.com',
            phone: '+91 98765 43210'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'doc_apt_1',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        status: 'PENDING',
        symptoms: 'Chronic lower back pain & morning lumbar stiffness',
        notes: 'Recommended initial Varmam pressure point therapy assessment.',
        user: { name: 'Ramya Shankar', email: 'ramya@example.com', phone: '+91 98765 43210' }
    },
    {
        id: 'doc_apt_2',
        date: new Date().toISOString().split('T')[0],
        time: '11:30 AM',
        status: 'CONFIRMED',
        symptoms: 'Skin flare-ups and eczema on forearms',
        notes: 'Prescribed herbal ointment and internal blood purification decoction.',
        user: { name: 'Karthik Murugan', email: 'karthik@example.com', phone: '+91 87654 32109' }
    },
    {
        id: 'doc_apt_3',
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        time: '02:00 PM',
        status: 'COMPLETED',
        symptoms: 'Joint arthritis & knee inflammation',
        notes: 'Follow up after 2 weeks of Thokkanam oil therapy. 60% reduction in pain reported.',
        user: { name: 'Lakshmi Priya', email: 'lakshmi@example.com', phone: '+91 76543 21098' }
    }
];

export async function GET() {
    return NextResponse.json({
        success: true,
        appointments: globalAppointments
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, appointment, id, status, notes } = body;

        if (action === 'create' && appointment) {
            const newEntry: SharedAppointment = {
                id: appointment.id || 'apt_' + Date.now(),
                doctorId: appointment.doctorId || 'cmn7rznoe0004rjp8n1ctzlbq',
                date: appointment.date || new Date().toISOString().split('T')[0],
                time: appointment.time || '10:00 AM',
                status: appointment.status || 'PENDING',
                symptoms: appointment.symptoms || 'General Health Consultation',
                notes: appointment.notes || '',
                doctor: appointment.doctor || {
                    specialty: 'Varmam & Pain Management',
                    user: { name: 'Dr. Kavitha Rajan' }
                },
                user: {
                    name: appointment.user?.name || 'Kabilesh',
                    email: appointment.user?.email || 'kabileshcoding07@gmail.com',
                    phone: appointment.user?.phone || '+91 98765 43210'
                },
                createdAt: appointment.createdAt || new Date().toISOString()
            };

            const filtered = globalAppointments.filter(a => a.id !== newEntry.id);
            globalAppointments = [newEntry, ...filtered];
            return NextResponse.json({ success: true, appointments: globalAppointments });
        }

        if (action === 'updateStatus' && id && status) {
            globalAppointments = globalAppointments.map(a =>
                a.id === id ? { ...a, status } : a
            );
            return NextResponse.json({ success: true, appointments: globalAppointments });
        }

        if (action === 'updateNotes' && id && notes !== undefined) {
            globalAppointments = globalAppointments.map(a =>
                a.id === id ? { ...a, notes } : a
            );
            return NextResponse.json({ success: true, appointments: globalAppointments });
        }

        return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
