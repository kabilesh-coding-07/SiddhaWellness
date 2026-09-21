export interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'DOCTOR' | 'ADMIN';
    phone?: string;
    image?: string;
    medicalHistory?: string;
}

export interface Doctor {
    id: string;
    userId: string;
    specialty: string;
    experience: number;
    bio?: string;
    photo?: string;
    availability?: DayAvailability[];
    user: Pick<User, 'name' | 'email' | 'image'>;
}

export interface DayAvailability {
    day: string;
    slots: string[];
}

export interface Appointment {
    id: string;
    userId: string;
    doctorId: string;
    date: string;
    time: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
    symptoms?: string;
    notes?: string;
    createdAt: string;
    doctor?: Doctor;
    user?: Pick<User, 'id' | 'name' | 'email' | 'phone' | 'medicalHistory'>;
}

export interface Blog {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    image?: string;
    published: boolean;
    createdAt: string;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    icon?: string;
    price?: number;
    duration?: string;
    featured: boolean;
}
