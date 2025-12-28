
"use client";

import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/hooks/use-cart';
import { WishlistProvider } from '@/hooks/use-wishlist';
import { GlobalNav } from '@/components/layout/global-nav';
import { UserProvider } from '@/providers/user-provider';
import { usePathname } from 'next/navigation';
import { ComparisonProvider } from '@/hooks/use-comparison';
import { AppLayout } from '@/components/layout/app-layout';
import { ThemeProvider } from '@/providers/theme-provider';
import { CurrencyProvider } from '@/contexts/currency-context';
import { NextIntlClientProvider } from 'next-intl';
import { SocketProvider } from '@/providers/socket-provider';

export function ClientProviders({
  children,
  locale,
  messages
}: {
  children: React.ReactNode;
  locale: string;
  messages: any;
}) {
  const pathname = usePathname();

  const protectedAppRoutes = [
    '/dashboard', '/admin', '/vendor', '/content-studio', '/my-jobs',
    '/my-proposals', '/my-projects', '/my-services', '/post-job',
    '/client-portal', '/social-media', '/chat', '/delivery', '/profile', '/transport'
  ];

  const isAppRoute = protectedAppRoutes.some(prefix =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  let content;
  if (isAppRoute) {
    content = <AppLayout>{children}</AppLayout>;
  } else {
    content = (
      <>
        <GlobalNav />
        <main className="pb-16 md:pb-0">{children}</main>
        <Toaster />
      </>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <CurrencyProvider>
          <UserProvider>
            <WishlistProvider>
              <CartProvider>
                <ComparisonProvider>
                  <SocketProvider>
                    {content}
                  </SocketProvider>
                </ComparisonProvider>
              </CartProvider>
            </WishlistProvider>
          </UserProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
