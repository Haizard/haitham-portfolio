"use client";

import UniversalFeed from '@/components/home/universal-feed';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Search/Discover Feed is the whole page now */}
      <UniversalFeed />
    </div>
  );
}

