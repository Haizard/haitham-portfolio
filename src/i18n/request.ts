import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales
export const locales = ['en', 'es', 'fr', 'de', 'ar', 'sw'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

// Locale labels and flags
export const localeLabels: Record<Locale, { label: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English', flag: '🇬🇧', dir: 'ltr' },
  es: { label: 'Español', flag: '🇪🇸', dir: 'ltr' },
  fr: { label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  de: { label: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  ar: { label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  sw: { label: 'Kiswahili', flag: '🇹🇿', dir: 'ltr' },
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

