
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, ExternalLink } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-data';
import { Button } from '@/components/ui/button';

interface RelatedPostsSectionProps {
  category: string;
  subcategory?: string;
  currentPostSlug: string;
  limit?: number;
}

export function RelatedPostsSection({
  category,
  subcategory,
  currentPostSlug,
  limit = 3,
}: RelatedPostsSectionProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedPosts() {
      setIsLoading(true);
      setError(null);
      try {
        let apiUrl = `/api/blog?category=${encodeURIComponent(category)}&limit=${limit}&excludeSlug=${encodeURIComponent(currentPostSlug)}`;
        if (subcategory) {
          apiUrl += `&subcategory=${encodeURIComponent(subcategory)}`;
        }
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch related posts');
        }
        const data: BlogPost[] = await response.json();
        setRelatedPosts(data);
      } catch (err: any) {
        console.error("Error fetching related posts:", err);
        setError(err.message || "Could not load related posts.");
        setRelatedPosts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRelatedPosts();
  }, [category, subcategory, currentPostSlug, limit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading related posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (relatedPosts.length === 0) {
    return (
        <div className="py-8 text-center">
            <p className="text-muted-foreground">No related posts found in this category.</p>
        </div>
    );
  }

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline mb-6">
        Related Posts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Card key={post.slug} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-semibold line-clamp-2">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {/* Basic content stripping for preview - consider a more robust solution */}
                {post.content.replace(/<[^>]+>/g, '').substring(0, 100)}...
              </p>
            </CardContent>
            <CardContent className="pt-0"> {/* Changed from CardFooter to CardContent for tighter spacing */}
               <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                <Link href={`/blog/${post.slug}`} className="flex items-center">
                  Read Post <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
