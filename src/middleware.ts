/**
 * Next.js Middleware for Internationalization
 *
 * Handles locale detection and routing for all pages.
 * Automatically redirects to the appropriate locale based on user preferences.
 */

import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Locale prefix strategy
  // 'as-needed' - Only add locale prefix for non-default locales
  // 'always' - Always add locale prefix
  localePrefix: 'as-needed',

  // Locale detection
  localeDetection: true,
});

export const config = {
  // Match all pathnames except for:
  // - API routes (/api/*)
  // - Next.js internals (/_next/*)
  // - Static files (/*.*)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
