
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button'; 
import { Layers } from 'lucide-react'; 

export const metadata: Metadata = {
  title: 'CreatorOS',
  description: 'The all-in-one platform for content creators.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <nav className="bg-card border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/landing" className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
                <Layers className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-semibold text-primary group-hover:text-primary/90 transition-colors font-headline">
                CreatorOS
              </h1>
            </Link>
            <div className="space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/landing">Home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/blog">Blog</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/showcase">Showcase</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/our-services">Our Services</Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/">Dashboard</Link>
              </Button>
            </div>
          </div>
        </nav>
        <div className="min-h-[calc(100vh-4rem)]">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
