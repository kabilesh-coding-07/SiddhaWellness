'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import en from './en';
import ta from './ta';

type Language = 'en' | 'ta';
type Translations = typeof en;

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Translations> = { en, ta };

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => { },
    t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lang') as Language;
            if (saved && (saved === 'en' || saved === 'ta')) {
                return saved;
            }
        }
        return 'en';
    });

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('lang', newLang);
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let result: unknown = translations[lang];
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = (result as Record<string, unknown>)[k];
            } else {
                // Fallback to English
                let fallback: unknown = translations.en;
                for (const fk of keys) {
                    if (fallback && typeof fallback === 'object' && fk in fallback) {
                        fallback = (fallback as Record<string, unknown>)[fk];
                    } else {
                        return key;
                    }
                }
                return typeof fallback === 'string' ? fallback : key;
            }
        }
        return typeof result === 'string' ? result : key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
