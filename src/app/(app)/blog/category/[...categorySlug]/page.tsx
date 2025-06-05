
"use client";

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, CalendarDays, FolderOpen } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-data';
import type { CategoryNode } from '@/lib/categories-data';
import { BreadcrumbDisplay } from '@/components/blog/breadcrumb-display'; // Assuming this component exists

interface CategoryArchivePageProps {
  params: {
    categorySlug: string[]; // e.g., ['technology', 'web-development']
  };
}

export default function CategoryArchivePage({ params }: CategoryArchivePageProps) {
  const { categorySlug } = params;
  const [category, setCategory] = useState<(CategoryNode & { path?: CategoryNode[] }) | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch category details including its path
        // We need an API endpoint or lib function to get category by full slug path
        const categoryResponse = await fetch(`/api/categories/slugPath/${categorySlug.join('/')}?include_path=true`);

        if (!categoryResponse.ok) {
            if (categoryResponse.status === 404) notFound();
            throw new Error('Failed to fetch category details');
        }
        const categoryData: CategoryNode & { path?: CategoryNode[] } = await categoryResponse.json();
        setCategory(categoryData);

        // 2. Fetch posts for this category
        if (categoryData && categoryData.id) {
          const postsResponse = await fetch(`/api/blog?categoryId=${categoryData.id}`);
          if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts for this category');
          }
          const postsData: BlogPost[] = await postsResponse.json();
          setPosts(postsData);
        } else {
            notFound(); // Category data doesn't have ID
        }

      } catch (err: any) {
        console.error("Error in CategoryArchivePage:", err);
        setError(err.message || "Could not load category content.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [categorySlug]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button asChild className="mt-4"><Link href="/blog">Back to Blog</Link></Button>
      </div>
    );
  }
  
  if (!category) {
    notFound();
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        {category.path && <BreadcrumbDisplay path={category.path} className="mb-4" />}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline mb-2 flex items-center">
            <FolderOpen className="mr-3 h-10 w-10 text-primary"/>
            Category: {category.name}
        </h1>
        {category.description && <p className="text-lg text-muted-foreground">{category.description}</p>}
      </header>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground text-lg py-10">No posts found in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Card key={post.slug} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col overflow-hidden group">
                {post.imageUrl && (
                    <div className="aspect-[16/9] overflow-hidden">
                        <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={600}
                        height={338} // Adjusted for 16:9
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={post.imageHint || 'category post'}
                        />
                    </div>
                )}
              <CardHeader>
                <CardTitle className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </CardTitle>
                 <div className="text-xs text-muted-foreground flex items-center mt-1">
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/blog/${post.slug}`} className="flex items-center">
                    Read Post <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// We need a new API endpoint (or modify existing) to fetch category by slug path
// For example: /api/categories/slugPath/technology/software-development
// This is because the categorySlug param is an array.
// For now, I'll assume such an endpoint will be created or logic adapted.
// If not, the category fetching part will need to be client-side tree traversal
// or a more complex API query if categories are not deeply nested.
// The code above assumes an API endpoint /api/categories/slugPath/[...path] can resolve this.
// Let's create this specific API endpoint:
// Create /src/app/api/categories/slugPath/[...slugPath]/route.ts
