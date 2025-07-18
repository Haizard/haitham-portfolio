
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/hooks/use-cart';
import { WishlistProvider } from '@/hooks/use-wishlist';
import { GlobalNav } from '@/components/layout/global-nav';
import { UserProvider } from '@/providers/user-provider'; 
import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

// Note: Metadata is usually static, but we're in a client component now.
// For dynamic metadata, you would use the `generateMetadata` function in a server component layout.
// export const metadata: Metadata = { ... };

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const protectedAppRoutes = [
    '/dashboard', '/admin', '/vendor', '/content-studio', '/my-jobs', 
    '/my-proposals', '/my-projects', '/my-services', '/post-job', 
    '/client-portal', '/social-media', '/chat', '/delivery', '/profile'
  ];

  const isAppRoute = protectedAppRoutes.some(prefix => pathname.startsWith(prefix));
  
  if (isAppRoute) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Public routes
  return (
    <>
      <GlobalNav />
      <main className="pb-16 md:pb-0">{children}</main>
      <Toaster />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CreatorOS</title>
        <meta name="description" content="The all-in-one platform for content creators." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <UserProvider>
          <WishlistProvider>
            <CartProvider>
                <RootLayoutContent>{children}</RootLayoutContent>
            </CartProvider>
          </WishlistProvider>
        </UserProvider>
      </body>
    </html>
  );
}
