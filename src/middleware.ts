/**
 * Next.js Middleware for Internationalization
 *
 * Handles locale detection and routing for all pages.
 * Automatically redirects to the appropriate locale based on user preferences.
 */

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
