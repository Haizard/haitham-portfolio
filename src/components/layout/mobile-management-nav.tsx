"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    href: string;
    icon: string;
    isCenter?: boolean;
}

const navItems: NavItem[] = [
    { label: 'Home', href: '/dashboard', icon: 'dashboard' },
    { label: 'Vendors', href: '/vendor/dashboard', icon: 'store' },
    { label: 'Add', href: '#', icon: 'add', isCenter: true },
    { label: 'Bookings', href: '/account/bookings', icon: 'shopping_bag' },
    { label: 'Profile', href: '/profile', icon: 'person' },
];

export function MobileManagementNav() {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-[#1a0f0b] border-t border-gray-200 dark:border-white/5 pb-5 pt-2 px-6 z-40 flex justify-between items-end">
            {navItems.map((item) => {
                const isActive = pathname === item.href;

                if (item.isCenter) {
                    return (
                        <div key={item.label} className="relative -top-6">
                            <button className="h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                                <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                            </button>
                        </div>
                    );
                }

                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 group transition-colors",
                            isActive ? "text-primary" : "text-gray-400 dark:text-gray-500 hover:text-primary"
                        )}
                    >
                        <span className={cn(
                            "material-symbols-outlined text-[28px] transition-transform group-hover:scale-110",
                            isActive && "filled"
                        )}>
                            {item.icon}
                        </span>
                        <span className={cn(
                            "text-[10px] font-bold",
                            !isActive && "font-medium"
                        )}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
