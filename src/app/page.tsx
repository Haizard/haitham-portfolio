"use client";

import { motion } from 'framer-motion';
import {
  Hotel,
  Car,
  Plane,
  Compass,
  MapPin,
  Search,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  ShoppingBag,
  UserCheck,
  Utensils,
  PlaneLanding
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import UniversalFeed from '@/components/home/universal-feed';
import Link from 'next/link';

const CATEGORIES = [
  { name: 'Hotels', icon: Hotel, href: '/hotels', color: 'bg-blue-600' },
  { name: 'Tours', icon: Compass, href: '/tours', color: 'bg-orange-600' },
  { name: 'Cars', icon: Car, href: '/cars', color: 'bg-purple-600' },
  { name: 'Transfers', icon: PlaneLanding, href: '/transfers', color: 'bg-emerald-600' },
  { name: 'Ecommerce', icon: ShoppingBag, href: '/products', color: 'bg-cyan-600' },
  { name: 'Freelancers', icon: UserCheck, href: '/freelancers', color: 'bg-indigo-600' },
  { name: 'Dining', icon: Utensils, href: '/restaurants', color: 'bg-rose-600' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Background Animation/Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 z-10" />
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600"
            className="w-full h-full object-cover opacity-60 scale-105"
            alt="Hero Background"
          />
        </div>

        <div className="container relative z-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 mr-2 inline" />
              Reimagine Your Journey
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
              EXPERIENCE THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-purple-500">
                EXTRAORDINARY
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium">
              The all-in-one platform for your next adventure. Manage hotels, tours, transport and more with seamless elegance.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2">
              <div className="flex-1 flex items-center px-4 gap-3 text-white/50 border-r border-white/10">
                <Search className="w-5 h-5" />
                <Input
                  placeholder="Where to next?"
                  className="bg-transparent border-none text-white placeholder:text-white/40 focus-visible:ring-0 text-lg"
                />
              </div>
              <Button className="rounded-xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20">
                Search Now
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-white/40">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/40?img=${i + 10}`} alt="user" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium">
                <span className="text-white">5,000+</span> satisfied travelers this month
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/30"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Quick Categories */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={cat.href} className="group flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 md:w-20 md:h-20 ${cat.color} rounded-3xl flex items-center justify-center text-white shadow-xl shadow-${cat.color.split('-')[1]}-500/20 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                    <cat.icon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <span className="font-bold text-sm md:text-base tracking-wide uppercase transition-colors group-hover:text-primary">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Feed */}
      <div className="max-w-7xl mx-auto">
        <UniversalFeed />
      </div>

      {/* Call to Action Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] p-12 relative overflow-hidden group shadow-3xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 grid md:grid-cols-2 items-center gap-12">
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                  READY TO BECOME <br />
                  <span className="text-primary italic">A VENDOR?</span>
                </h2>
                <p className="text-slate-400 text-lg mb-10 max-w-md uppercase tracking-widest font-bold">
                  Start hosting your properties, tours, or vehicles and scale your business today.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="rounded-full px-12 h-14 bg-white text-slate-900 font-black hover:bg-slate-100 group">
                    JOIN NOW
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-12 h-14 border-white/20 text-white font-black hover:bg-white/5">
                    LEARN MORE
                  </Button>
                </div>
              </div>
              <div className="relative h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=800"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  alt="Vendor"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-pulse">
                    <Play className="fill-primary text-primary ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Text */}
      <div className="py-12 text-center text-muted-foreground text-sm font-medium border-t border-border/50 bg-slate-50 dark:bg-slate-900/30">
        &copy; {new Date().getFullYear()} CreatorOS Ecosystem. All Rights Reserved. Crafted for adventurers.
      </div>
    </div>
  );
}

