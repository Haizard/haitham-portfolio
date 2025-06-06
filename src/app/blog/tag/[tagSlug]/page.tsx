
"use client";

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation'; 
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, CalendarDays, Tag as TagIcon } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-data';
import type { Tag } from '@/lib/tags-data';
import { RelatedPostsSection } from '@/components/blog/related-posts-section';
import { Separator } from '@/components/ui/separator';

// Sidebar Widgets
import { AuthorCard } from '@/components/blog/sidebar/AuthorCard';
import { SearchWidget } from '@/components/blog/sidebar/SearchWidget';
import { RecentPostsWidget } from '@/components/blog/sidebar/RecentPostsWidget';
import { CategoriesWidget } from '@/components/blog/sidebar/CategoriesWidget';
import { InstagramWidget } from '@/components/blog/sidebar/InstagramWidget';
import { TagsWidget } from '@/components/blog/sidebar/TagsWidget';

export default function TagArchivePage() {
  const params = useParams<{ tagSlug: string }>(); 
  const tagSlug = params.tagSlug; 
  const router = useRouter(); 

  const [tag, setTag] = useState<Tag | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(""); 

  useEffect(() => {
    if (!tagSlug) {
        setIsLoading(false);
        notFound();
        return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const tagResponse = await fetch(`/api/tags/${tagSlug}`);
        if (!tagResponse.ok) {
          if (tagResponse.status === 404) notFound();
          throw new Error('Failed to fetch tag details');
        }
        const tagData: Tag = await tagResponse.json();
        setTag(tagData);

        if (tagData && tagData.id) {
          const postsResponse = await fetch(`/api/blog?tagId=${tagData.id}&enriched=true`);
          if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts for this tag');
          }
          const postsData: BlogPost[] = await postsResponse.json();
          setPosts(postsData);
        } else {
            notFound(); 
        }

      } catch (err: any) {
        console.error("Error in TagArchivePage:", err);
        setError(err.message || "Could not load tag content.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [tagSlug]); 

  const handleSearch = (query: string) => {
    setCurrentSearchQuery(query);
    router.push(`/blog?search=${encodeURIComponent(query)}`);
  };

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
  
  if (!tag) {
    notFound();
    return null; // Ensure notFound is called and component returns
  }

  return (
    <div className="container mx-auto py-8 px-4">
       <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        <main className="lg:col-span-8 xl:col-span-9">
          <header className="mb-8">
            <div className="mb-4">
                 <Link href="/blog" className="text-sm text-primary hover:underline">
                    &larr; Back to Blog
                </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline mb-2 flex items-center">
                <TagIcon className="mr-3 h-10 w-10 text-primary"/>
                Posts tagged: {tag.name}
            </h1>
            {tag.description && <p className="text-lg text-muted-foreground">{tag.description}</p>}
          </header>

          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground text-lg py-10">No posts found with this tag yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> 
              {posts.map(post => (
                <Card key={post.slug} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col overflow-hidden group">
                    {post.featuredImageUrl && ( 
                         <div className="aspect-[16/9] overflow-hidden">
                            <Image
                            src={post.featuredImageUrl}
                            alt={post.title}
                            width={600}
                            height={338}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            data-ai-hint={post.featuredImageHint || 'tag archive post'} 
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
          {tag?.id && (
             <RelatedPostsSection 
                sectionTitle={`More with tag "${tag.name}"`}
                tagId={tag.id} 
                excludeSlugs={posts.map(p => p.slug)}
                limit={3}
            />
          )}
        </main>
        <aside className="lg:col-span-4 xl:col-span-3 mt-12 lg:mt-0">
          <div className="sticky top-24 space-y-8"> 
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
