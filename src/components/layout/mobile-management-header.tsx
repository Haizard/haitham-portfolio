"use client";

import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileManagementHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

export function MobileManagementHeader({ title, subtitle, className }: MobileManagementHeaderProps) {
    return (
        <div className={cn(
            "sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm md:hidden",
            className
        )}>
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold leading-none font-display text-foreground">{title}</h1>
                    {subtitle && <p className="text-xs text-muted-foreground font-medium mt-1">{subtitle}</p>}
                </div>
            </div>
            <button className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-[24px]">notifications</span>
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background-light dark:border-background-dark"></span>
            </button>
        </div>
    );
}
