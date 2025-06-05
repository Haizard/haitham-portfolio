
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, CalendarDays, Newspaper, Tag as TagIcon, Folder } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-data';
import { Badge } from '@/components/ui/badge';
import type { CategoryNode } from '@/lib/categories-data';
import type { Tag as TagType } from '@/lib/tags-data';

async function fetchAllPosts(): Promise<BlogPost[]> {
  const response = await fetch('/api/blog');
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

interface EnrichedPost extends BlogPost {
  categoryName?: string;
  resolvedTags?: TagType[];
}

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allCategories, setAllCategories] = useState<CategoryNode[]>([]);
  const [allTags, setAllTags] = useState<TagType[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [postsData, categoriesData, tagsData] = await Promise.all([
          fetchAllPosts(),
          fetch('/api/categories').then(res => res.ok ? res.json() : []),
          fetch('/api/tags').then(res => res.ok ? res.json() : [])
        ]);
        
        setAllCategories(categoriesData);
        setAllTags(tagsData);

        const findCategoryName = (categoryId: string, categories: CategoryNode[]): string | undefined => {
            const findRecursive = (nodes: CategoryNode[]): CategoryNode | undefined => {
                for (const node of nodes) {
                    if (node.id === categoryId) return node;
                    if (node.children) {
                        const found = findRecursive(node.children);
                        if (found) return found;
                    }
                }
                return undefined;
            };
            return findRecursive(categories)?.name;
        };
        
        const enrichedPosts = postsData.map(post => ({
            ...post,
            categoryName: findCategoryName(post.categoryId, categoriesData),
            resolvedTags: post.tagIds?.map(tagId => tagsData.find(t => t.id === tagId)).filter(Boolean) as TagType[] || []
        }));

        setPosts(enrichedPosts);
      } catch (err: any) {
        console.error("Error in BlogIndexPage:", err);
        setError(err.message || "Could not load blog posts.");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight font-headline mb-4 flex items-center justify-center">
          <Newspaper className="mr-4 h-12 w-12 text-primary" />
          CreatorOS Blog
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Latest articles, insights, and updates from our creators.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground text-lg py-10">No blog posts found yet. Stay tuned!</p>
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
                    height={338}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={post.imageHint || 'blog index post'}
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
                 {post.categoryName && (
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Folder className="h-3.5 w-3.5 mr-1.5"/>
                        <Link href={`/blog/category/${allCategories.find(c=>c.id === post.categoryId)?.slug || '#'}`} className="hover:underline">
                            {post.categoryName}
                        </Link>
                    </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                </p>
                 {post.resolvedTags && post.resolvedTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.resolvedTags.map(tag => (
                             <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                                <Badge variant="secondary" className="text-xs hover:bg-accent hover:text-accent-foreground">
                                    {tag.name}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                )}
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
