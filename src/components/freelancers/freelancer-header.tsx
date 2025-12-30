
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserCheck, Search } from 'lucide-react';

const navItems = [
  { href: "/find-work", label: "Find a Freelancer" },
  { href: "/our-services", label: "Browse Services" },
];

export function FreelancerHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card sticky top-16 z-40">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 mr-4">
          <UserCheck className="h-5 w-5 text-primary" />
          Freelance Marketplace
        </h2>
        <nav className="flex items-center gap-2">
          {navItems.map(item => (
            <Button key={item.href} variant={pathname.startsWith(item.href) ? "secondary" : "ghost"} size="sm" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
