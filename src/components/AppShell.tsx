'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isPortalRoute = pathname.startsWith('/portal') || pathname.startsWith('/doctor');
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/portal/login';

    // Dedicated standalone workspace layouts (Doctor Portal and Patient Dashboard)
    if (isPortalRoute || isDashboardRoute) {
        return (
            <div className="min-h-screen bg-[#0a0f0d] text-[#f0fdf4]">
                {children}
            </div>
        );
    }

    // Full-screen clean auth layouts
    if (isAuthRoute) {
        return (
            <div className="min-h-screen bg-[#0a0f0d] text-[#f0fdf4] flex flex-col justify-between">
                <main className="flex-1 flex items-center justify-center">
                    {children}
                </main>
            </div>
        );
    }

    // Public Consumer / Marketing Website
    return (
        <div className="min-h-screen bg-[#0a0f0d] text-[#f0fdf4] flex flex-col justify-between">
            <Navbar />
            <main className="flex-1 pt-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}
