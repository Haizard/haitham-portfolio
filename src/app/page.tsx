"use client";

import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  ArrowRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import UniversalFeed from '@/components/home/universal-feed';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section - More Compact & Integrated */}
      <section className="relative pt-32 pb-20 flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-background z-10" />
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600"
            className="w-full h-full object-cover opacity-40 scale-105"
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
              Revolutionizing Your Experience
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
              WHERE MAGIC <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-purple-500 italic">
                HAPPENS EVERY DAY
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mx-auto mb-10 font-medium">
              Explore a curated feed of extraordinary stays, tours, and experiences. Your next adventure is just a scroll away.
            </p>

            {/* Simple Search */}
            <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-2xl flex items-center gap-2">
              <div className="flex-1 flex items-center px-4 gap-3 text-white/50">
                <Search className="w-4 h-4" />
                <Input
                  placeholder="Discover something new..."
                  className="bg-transparent border-none text-white placeholder:text-white/40 focus-visible:ring-0 text-md h-10"
                />
              </div>
              <Button size="sm" className="rounded-full h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold">
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Feed - Takes Center Stage */}
      <main className="container mx-auto">
        <UniversalFeed />
      </main>

      {/* Secondary CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] p-12 relative overflow-hidden group shadow-3xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 grid md:grid-cols-2 items-center gap-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                  READY TO JOIN <br />
                  <span className="text-primary italic">OUR COMMUNITY?</span>
                </h2>
                <p className="text-slate-400 text-sm mb-10 max-w-sm uppercase tracking-widest font-bold">
                  Start hosting your properties, tours, or vehicles and scale your business today.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="rounded-full px-12 h-14 bg-white text-slate-900 font-black hover:bg-slate-100 group">
                    JOIN NOW
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
              <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=800"
                  className="w-full h-full object-cover"
                  alt="Vendor"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="fill-primary text-primary ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Text */}
      <div className="py-12 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] border-t border-border/50">
        &copy; {new Date().getFullYear()} CreatorOS Ecosystem. All Rights Reserved. Crafted for the curious.
      </div>
    </div>
  );
}

