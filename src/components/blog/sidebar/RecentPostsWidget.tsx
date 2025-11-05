
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ListChecks, CalendarDays } from "lucide-react"; 
import type { BlogPost } from '@/lib/blog-data';

interface RecentPostsWidgetProps {
  limit?: number;
  excludeSlug?: string;
}

export function RecentPostsWidget({ limit = 4, excludeSlug }: RecentPostsWidgetProps) {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        let apiUrl = `/api/blog?enriched=true&limit=${limit}`;
        if (excludeSlug) {
          apiUrl += `&excludeSlugs=${encodeURIComponent(excludeSlug)}`; // Corrected parameter
        }
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch recent posts');
        }
        const data: BlogPost[] = await response.json();
        setRecentPosts(data);
      } catch (error) {
        console.error(error);
        setRecentPosts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, [limit, excludeSlug]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <ListChecks className="mr-2 h-5 w-5 text-primary" /> Recent Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : recentPosts.length > 0 ? (
          <ul className="space-y-4">
            {recentPosts.map(post => (
              <li key={post.slug} className="flex items-start space-x-3 group">
                {post.featuredImageUrl && (
                  <Link href={`/blog/${post.slug}`} className="flex-shrink-0">
                    <Image
                      src={post.featuredImageUrl}
                      alt={post.title}
                      width={64}
                      height={64}
                      className="rounded-md object-contain aspect-square group-hover:opacity-80 transition-opacity"
                      data-ai-hint={post.featuredImageHint || "article thumbnail"}
                    />
                  </Link>
                )}
                <div className="flex-grow">
                  <Link href={`/blog/${post.slug}`}>
                    <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center">No recent posts found.</p>
        )}
      </CardContent>
    </Card>
  );
}
