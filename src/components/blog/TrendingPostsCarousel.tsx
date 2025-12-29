"use client";

import * as React from "react";
import Link from 'next/link';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay";
import { CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { BlogPost } from "@/lib/blog-data";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getVideoEmbedUrl } from "@/lib/video-utils";

interface TrendingPostsCarouselProps {
  posts: BlogPost[];
}

export function TrendingPostsCarousel({ posts }: TrendingPostsCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 60000, stopOnInteraction: true }) // Scroll every 60 seconds
  );

  if (!posts || posts.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No trending posts to display.
      </div>
    );
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full mb-12"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {posts.map((post) => {
          const videoEmbedUrl = getVideoEmbedUrl(post.videoUrl);

          return (
            <CarouselItem key={post.slug}>
              <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden group shadow-2xl bg-neutral-900">
                {videoEmbedUrl ? (
                  <iframe
                    src={videoEmbedUrl}
                    className="w-full h-full object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={post.title}
                    loading="lazy"
                  />
                ) : post.featuredImageUrl ? (
                  <Image
                    src={post.featuredImageUrl}
                    alt={post.title}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    data-ai-hint={post.featuredImageHint || "trending background"}
                    priority={posts.indexOf(post) === 0} // Prioritize loading the first image
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-400">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                  <div className="mb-3">
                    {post.categoryName && (
                      <Link href={`/blog/category/${post.categorySlugPath}`}>
                        <Badge variant="default" className="text-xs uppercase tracking-wider bg-primary/80 backdrop-blur-sm hover:bg-primary">
                          {post.categoryName}
                        </Badge>
                      </Link>
                    )}
                  </div>
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h2 className="text-2xl md:text-4xl font-bold font-headline mb-3 leading-tight hover:text-primary transition-colors duration-300">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-sm md:text-base text-neutral-300 mb-4 line-clamp-2 md:line-clamp-3">
                    {post.content.replace(/<[^>]+>/g, "").substring(0, 150)}...
                  </p>
                  <div className="flex items-center space-x-4 text-xs md:text-sm">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8 border-2 border-white/50">
                        <AvatarImage src={post.authorAvatar} alt={post.author} data-ai-hint="author avatar" />
                        <AvatarFallback>{post.author.substring(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarDays className="h-4 w-4" />
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2">
        <CarouselPrevious className="static translate-y-0 w-10 h-10 bg-background/80 hover:bg-background text-foreground backdrop-blur-sm" />
        <CarouselNext className="static translate-y-0 w-10 h-10 bg-background/80 hover:bg-background text-foreground backdrop-blur-sm" />
      </div>
    </Carousel>
  );
}
