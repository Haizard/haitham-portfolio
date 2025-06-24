
"use client";

import { useEffect, useState, FormEvent, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, CalendarDays, Folder, Tag as TagIcon, User, MessageSquare, LayoutList, LayoutGrid, ThumbsUp } from 'lucide-react';
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
import { RelatedPostsSection } from '@/components/blog/related-posts-section';


interface EnrichedPost extends BlogPost {
  categoryName?: string;
  categorySlugPath?: string;
  resolvedTags?: TagType[];
}

async function fetchBlogData(searchQuery?: string, limit?: number, excludeSlugs?: string[]): Promise<EnrichedPost[]> {
  let apiUrl = '/api/blog?enriched=true';
  if (searchQuery) {
    apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
  }
  if (limit) {
    apiUrl += `&limit=${limit}`;
  }
  if (excludeSlugs && excludeSlugs.length > 0) {
    apiUrl += `&excludeSlugs=${excludeSlugs.map(s => encodeURIComponent(s)).join(',')}`;
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const loadBlogPosts = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTrendingPosts = await fetchBlogData(undefined, 5);
      setTrendingPosts(fetchedTrendingPosts);

      const fetchedMainPosts = await fetchBlogData(query, 10); 
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

  const slugsToExclude = useMemo(() => {
    const trendingSlugs = trendingPosts.map(p => p.slug);
    const mainSlugs = mainPosts.map(p => p.slug);
    return Array.from(new Set([...trendingSlugs, ...mainSlugs]));
  }, [trendingPosts, mainPosts]);

  if (error && isLoading) { 
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

          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            {currentSearchQuery ? (
              <h2 className="text-2xl font-semibold">
                Search Results for: <span className="text-primary">{currentSearchQuery}</span>
              </h2>
            ) : (
              <h2 className="text-3xl font-bold font-headline">Latest Posts</h2>
            )}
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
                <LayoutList className="h-5 w-5" />
              </Button>
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {mainPosts.length === 0 && !isLoading && (
            <p className="mt-2 text-muted-foreground text-center py-10">No posts found matching your criteria.</p>
          )}
          
          {isLoading && mainPosts.length === 0 ? (
             <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {[1,2,3,4].map(i => ( 
                    <Card key={`skeleton-${i}`} className={`shadow-lg flex flex-col overflow-hidden group ${viewMode === 'list' ? 'md:flex-row' : ''}`}>
                        <div className={`bg-muted animate-pulse ${viewMode === 'list' ? 'md:w-1/3 lg:w-2/5 xl:w-1/3 h-56 md:h-auto' : 'w-full aspect-[16/9]'}`}></div>
                        <div className={`p-5 md:p-6 flex flex-col justify-between ${viewMode === 'list' ? 'md:w-2/3 lg:w-3/5 xl:w-2/3' : 'w-full'}`}>
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
          ) : mainPosts.length > 0 && (
            <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {mainPosts.map(post => (
                <Card key={post.slug} className={`shadow-lg hover:shadow-xl transition-shadow flex flex-col overflow-hidden group ${viewMode === 'list' ? 'md:flex-row' : ''}`}>
                  {post.featuredImageUrl && (
                    <Link 
                      href={`/blog/${post.slug}`} 
                      className={`block relative overflow-hidden ${viewMode === 'list' ? 'md:w-1/3 lg:w-2/5 xl:w-1/3 h-56 md:h-auto' : 'w-full aspect-[16/9]'}`}
                    >
                      <Image
                        src={post.featuredImageUrl}
                        alt={post.title}
                        fill
                        sizes={viewMode === 'list' ? "(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 33vw" : "(max-width: 768px) 100vw, 50vw"}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={post.featuredImageHint || 'blog list item'}
                      />
                    </Link>
                  )}
                  <div className={`p-5 md:p-6 flex flex-col justify-between ${viewMode === 'list' ? 'md:w-2/3 lg:w-3/5 xl:w-2/3' : 'w-full'}`}>
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2 items-center">
                        {post.categoryName && post.categorySlugPath && post.categorySlugPath.trim() !== '' && (
                           <Link href={`/blog/category/${post.categorySlugPath}`}>
                             <Badge variant="outline" className="text-xs uppercase tracking-wider text-primary border-primary hover:bg-primary/10">
                               {post.categoryName}
                             </Badge>
                           </Link>
                        )}
                      </div>
                      <CardTitle className={`font-semibold font-headline line-clamp-2 group-hover:text-primary transition-colors ${viewMode === 'list' ? 'text-xl md:text-2xl' : 'text-lg'}`}>
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </CardTitle>
                      <CardDescription className={`mt-2 text-sm text-muted-foreground ${viewMode === 'list' ? 'line-clamp-2 md:line-clamp-3' : 'line-clamp-2'}`}>
                        {post.content.replace(/<[^>]+>/g, '').substring(0, viewMode === 'list' ? 120 : 80)}...
                      </CardDescription>
                    </div>
                     <div className={`mt-4 flex items-center space-x-3 text-xs text-muted-foreground ${viewMode === 'grid' ? 'text-[0.7rem]' : ''}`}>
                      <Link href="#" className="flex items-center space-x-1.5 hover:text-primary">
                        <Avatar className={viewMode === 'grid' ? 'h-5 w-5' : 'h-6 w-6'}>
                          <AvatarImage src={post.authorAvatar} alt={post.author} data-ai-hint="author avatar small"/>
                          <AvatarFallback>{post.author.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <span>{post.author}</span>
                      </Link>
                      <span className="flex items-center"><CalendarDays className={viewMode === 'grid' ? 'h-3 w-3 mr-0.5' : 'h-3.5 w-3.5 mr-1'} /> {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {viewMode === 'grid' && (
                        <CardFooter className="p-0 pt-3 mt-auto">
                             <Button asChild variant="outline" size="sm" className="w-full text-xs">
                                <Link href={`/blog/${post.slug}`} className="flex items-center justify-center">
                                    Read Post <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardFooter>
                    )}
                     {viewMode === 'list' && (
                        <CardFooter className="p-0 pt-4 mt-auto">
                            <Button asChild variant="link" className="p-0 text-primary hover:text-primary/80">
                                <Link href={`/blog/${post.slug}`}>
                                    Read more <ExternalLink className="ml-1.5 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
          {(trendingPosts.length > 0 || mainPosts.length > 0 || currentSearchQuery) && ( 
            <RelatedPostsSection 
                sectionTitle="Further Reading" 
                excludeSlugs={slugsToExclude}
                limit={3}
            />
          )}
        </main>

        <aside className="lg:col-span-4 xl:col-span-3 mt-12 lg:mt-0">
          <div className="sticky top-24 space-y-8"> 
            <AuthorCard />
            <SearchWidget onSearch={handleSearch} initialQuery={currentSearchQuery} isLoading={isLoading && !!currentSearchQuery} />
            <RecentPostsWidget limit={3} excludeSlug={ currentSearchQuery ? undefined : mainPosts.length > 0 ? mainPosts[0].slug : undefined }/>
            <CategoriesWidget />
            <InstagramWidget />
            <TagsWidget />
          </div>
        </aside>
      </div>
    </div>
  );
}
