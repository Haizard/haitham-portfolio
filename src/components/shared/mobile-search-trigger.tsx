"use client";

import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface MobileSearchTriggerProps {
    title: string;
    summary?: string;
    children: React.ReactNode;
    className?: string;
}

export function MobileSearchTrigger({ title, summary, children, className }: MobileSearchTriggerProps) {
    return (
        <div className={cn("lg:hidden w-full", className)}>
            <Sheet>
                <SheetTrigger asChild>
                    <button className="w-full flex items-center gap-3 px-5 py-3.5 bg-background border border-border shadow-md rounded-2xl text-left transition-all hover:border-primary/50 group active:scale-[0.98]">
                        <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <Search className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground leading-none mb-1.5">{title}</span>
                            {summary ? (
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{summary}</span>
                            ) : (
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic opacity-70">Tap to search...</span>
                            )}
                        </div>
                    </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[92vh] rounded-t-[3rem] px-6 pt-12 pb-8 overflow-y-auto bg-background/95 backdrop-blur-xl border-t-2 border-primary/10 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.15)]">
                    <SheetHeader className="mb-10 text-center">
                        <SheetTitle className="text-3xl font-black tracking-tight mb-2">{title}</SheetTitle>
                        <div className="w-12 h-1.5 bg-primary/20 rounded-full mx-auto" />
                    </SheetHeader>
                    <div className="max-w-xl mx-auto">
                        {children}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
