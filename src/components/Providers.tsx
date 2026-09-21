'use client';

import { LanguageProvider } from '@/i18n';
import { UserProvider } from '@/providers/user-context';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <LanguageProvider>
                {children}
            </LanguageProvider>
        </UserProvider>
    );
}
