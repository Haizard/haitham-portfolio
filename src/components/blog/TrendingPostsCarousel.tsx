
"use client";

import * as React from "react";
import Link from 'next/link';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay";

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
import { CalendarDays, MessageSquare } from "lucide-react"; // Assuming MessageSquare for comments icon

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
        {posts.map((post) => (
          <CarouselItem key={post.slug}>
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden group shadow-2xl">
              {post.featuredImageUrl && (
                <Image
                  src={post.featuredImageUrl}
                  alt={post.title}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  data-ai-hint={post.featuredImageHint || "trending background"}
                  priority={posts.indexOf(post) === 0} // Prioritize loading the first image
                />
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
                  {/* You can add more badges if you have multiple categories/tags here */}
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
                      <AvatarFallback>{post.author.substring(0,1)}</AvatarFallback>
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
                  {/* Optional: Comment count icon from example image */}
                   {/* <div className="flex items-center space-x-1">
                     <MessageSquare className="h-4 w-4" />
                     <span>{post.comments?.length || 0}</span>
                   </div> */}
                </div>
              </div>
              {/* Optional: Play button icon from example image - might be for video posts */}
              {/* <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/75 text-white rounded-full">
                  <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"></path></svg>
                </Button>
              </div> */}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2">
        <CarouselPrevious className="static translate-y-0 w-10 h-10 bg-background/80 hover:bg-background text-foreground backdrop-blur-sm" />
        <CarouselNext className="static translate-y-0 w-10 h-10 bg-background/80 hover:bg-background text-foreground backdrop-blur-sm" />
      </div>
    </Carousel>
  );
}
