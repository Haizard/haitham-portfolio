
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ExternalLink, ThumbsUp } from 'lucide-react'; // Changed icon
import type { BlogPost } from '@/lib/blog-data';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';

interface RelatedPostsSectionProps {
  sectionTitle?: string;
  categoryId?: string;
  tagId?: string;
  currentPostSlug?: string; // Slug of the post currently being viewed (to exclude it)
  excludeSlugs?: string[]; // Additional slugs to exclude (e.g., already displayed posts)
  limit?: number;
}

export function RelatedPostsSection({
  sectionTitle = "Related Posts",
  categoryId,
  tagId,
  currentPostSlug,
  excludeSlugs = [],
  limit = 3,
}: RelatedPostsSectionProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedPosts() {
      setIsLoading(true);
      setError(null);

      if (!categoryId && !tagId && !sectionTitle.toLowerCase().includes("further reading")) { // Only fetch general posts if specifically for "Further Reading" or if an ID is provided
         setIsLoading(false);
         setRelatedPosts([]);
         // setError("Either categoryId or tagId must be provided for related posts, or title must indicate general fetching.");
         return;
      }
      
      let apiUrl = `/api/blog?enriched=true&limit=${limit}`;
      const allExclusions = [...excludeSlugs];
      if (currentPostSlug) {
        allExclusions.push(currentPostSlug);
      }

      if (allExclusions.length > 0) {
        apiUrl += `&excludeSlugs=${allExclusions.map(s => encodeURIComponent(s)).join(',')}`;
      }

      if (categoryId) {
        apiUrl += `&categoryId=${encodeURIComponent(categoryId)}`;
      } else if (tagId) {
        apiUrl += `&tagId=${encodeURIComponent(tagId)}`;
      }
      // If neither categoryId nor tagId is provided, it will fetch general recent posts (respecting exclusions)

      try {
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
  }, [categoryId, tagId, currentPostSlug, excludeSlugs, limit, sectionTitle]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading posts...</p>
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
            <p className="text-muted-foreground">No more posts to display in this section.</p>
        </div>
    );
  }

  return (
    <section className="mt-12">
      <Separator className="mb-8" />
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline mb-6 flex items-center">
        <ThumbsUp className="mr-3 h-7 w-7 text-primary" /> {sectionTitle}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Card key={post.slug} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-semibold line-clamp-2">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.content.replace(/<[^>]+>/g, '').substring(0, 100)}...
              </p>
            </CardContent>
            <CardContent className="pt-0">
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
