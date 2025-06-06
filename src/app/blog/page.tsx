
"use client";

import { useEffect, useState, FormEvent, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, CalendarDays, Folder, Tag as TagIcon, User, MessageSquare } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-data';
import { Badge } from '@/components/ui/badge';
import type { Tag as TagType } from '@/lib/tags-data';
import { TrendingPostsCarousel } from '@/components/blog/TrendingPostsCarousel';
import { AuthorCard } from '@/components/blog/sidebar/AuthorCard';
import { SearchWidget } from '@/components/blog/sidebar/SearchWidget';
import { RecentPostsWidget } from '@/components/blog/sidebar/RecentPostsWidget';
import { CategoriesWidget } from '@/components/blog/sidebar/CategoriesWidget';
import { TagsWidget } from '@/components/blog/sidebar/TagsWidget';
import { InstagramWidget } from '@/components/blog/sidebar/InstagramWidget';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface EnrichedPost extends BlogPost {
  categoryName?: string;
  categorySlugPath?: string;
  resolvedTags?: TagType[];
}

async function fetchBlogData(searchQuery?: string, limit?: number, excludeSlug?: string): Promise<EnrichedPost[]> {
  let apiUrl = '/api/blog?enriched=true';
  if (searchQuery) {
    apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
  }
  if (limit) {
    apiUrl += `&limit=${limit}`;
  }
  if (excludeSlug) {
    apiUrl += `&excludeSlug=${encodeURIComponent(excludeSlug)}`;
  }
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }
  return response.json();
}


export default function BlogIndexPage() {
  const [trendingPosts, setTrendingPosts] = useState<EnrichedPost[]>([]);
  const [mainPosts, setMainPosts] = useState<EnrichedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");

  const loadBlogPosts = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch trending posts (e.g., latest 3-5, ensure they are not duplicated in main list if possible)
      // For simplicity, we'll fetch latest 5 for trending and then latest for main list, duplication might occur.
      // A more advanced backend could handle "trending" flags or distinct fetching.
      const fetchedTrendingPosts = await fetchBlogData(undefined, 5);
      setTrendingPosts(fetchedTrendingPosts);

      // Fetch main posts, excluding slugs from trending if necessary, or just fetch paginated
      const fetchedMainPosts = await fetchBlogData(query, 10); // Example: fetch 10 main posts
      setMainPosts(fetchedMainPosts);

    } catch (err: any) {
      console.error("Error in BlogIndexPage:", err);
      setError(err.message || "Could not load blog content.");
      setTrendingPosts([]);
      setMainPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogPosts(currentSearchQuery);
  }, [currentSearchQuery, loadBlogPosts]);

  const handleSearch = (query: string) => {
    setCurrentSearchQuery(query);
  };

  if (error && isLoading) { // Show loader initially even if there's an error from previous attempt
     return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Blog</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => loadBlogPosts(currentSearchQuery)} className="mt-4">Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Main Content Area */}
        <main className="lg:col-span-8 xl:col-span-9">
          {isLoading && trendingPosts.length === 0 ? (
            <div className="flex justify-center items-center h-64 mb-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : !isLoading && trendingPosts.length === 0 && !currentSearchQuery ? (
             <div className="py-8 text-center text-muted-foreground">No trending posts available.</div>
          ) : (
            <TrendingPostsCarousel posts={trendingPosts} />
          )}
          
          <Separator className="my-8 md:my-12" />

          {currentSearchQuery && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold">
                Search Results for: <span className="text-primary">{currentSearchQuery}</span>
              </h2>
              {mainPosts.length === 0 && !isLoading && (
                <p className="mt-2 text-muted-foreground">No posts found matching your search.</p>
              )}
            </div>
          )}
          
          {isLoading && mainPosts.length === 0 ? (
             <div className="grid grid-cols-1 gap-8">
                {[1,2,3].map(i => ( // Skeleton loaders
                    <Card key={`skeleton-${i}`} className="shadow-lg flex flex-col md:flex-row overflow-hidden group">
                        <div className="md:w-1/3 lg:w-2/5 xl:w-1/3 h-56 md:h-auto bg-muted animate-pulse"></div>
                        <div className="p-6 flex flex-col justify-between md:w-2/3 lg:w-3/5 xl:w-2/3">
                            <div>
                                <div className="h-4 bg-muted animate-pulse rounded w-1/4 mb-2"></div>
                                <div className="h-6 bg-muted animate-pulse rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-muted animate-pulse rounded w-full mb-1"></div>
                                <div className="h-4 bg-muted animate-pulse rounded w-5/6 mb-4"></div>
                            </div>
                            <div className="flex items-center space-x-3 mt-auto">
                                <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
                                <div className="h-4 bg-muted animate-pulse rounded w-1/3"></div>
                            </div>
                        </div>
                    </Card>
                ))}
             </div>
          ) : mainPosts.length === 0 && !currentSearchQuery ? (
            <p className="text-center text-muted-foreground text-lg py-10">No blog posts found yet. Stay tuned!</p>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {mainPosts.map(post => (
                <Card key={post.slug} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row overflow-hidden group">
                  {post.featuredImageUrl && (
                    <Link href={`/blog/${post.slug}`} className="md:w-1/3 lg:w-2/5 xl:w-1/3 block h-56 md:h-auto relative overflow-hidden">
                      <Image
                        src={post.featuredImageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={post.featuredImageHint || 'blog list item'}
                      />
                    </Link>
                  )}
                  <div className="p-5 md:p-6 flex flex-col justify-between md:w-2/3 lg:w-3/5 xl:w-2/3">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2 items-center">
                        {post.categoryName && post.categorySlugPath && (
                           <Link href={`/blog/category/${post.categorySlugPath}`}>
                             <Badge variant="outline" className="text-xs uppercase tracking-wider text-primary border-primary hover:bg-primary/10">
                               {post.categoryName}
                             </Badge>
                           </Link>
                        )}
                        {/* Add more tags here if needed from example */}
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-semibold font-headline line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                        {post.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                      </CardDescription>
                    </div>
                    <div className="mt-4 flex items-center space-x-3 text-xs text-muted-foreground">
                      <Link href="#" className="flex items-center space-x-1.5 hover:text-primary">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.authorAvatar} alt={post.author} data-ai-hint="author avatar small"/>
                          <AvatarFallback>{post.author.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <span>{post.author}</span>
                      </Link>
                      <span className="flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {/* <span className="flex items-center"><MessageSquare className="h-3.5 w-3.5 mr-1" /> {post.comments?.length || 0}</span> */}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {/* TODO: Add Pagination if mainPosts.length > limit */}
        </main>

        {/* Sidebar Area */}
        <aside className="lg:col-span-4 xl:col-span-3 mt-12 lg:mt-0">
          <div className="sticky top-24 space-y-8"> {/* Sticky top with offset for nav */}
            <AuthorCard />
            <SearchWidget onSearch={handleSearch} initialQuery={currentSearchQuery} isLoading={isLoading && !!currentSearchQuery} />
            <RecentPostsWidget limit={3}/>
            <CategoriesWidget />
            <InstagramWidget />
            <TagsWidget />
          </div>
        </aside>
      </div>
    </div>
  );
}
