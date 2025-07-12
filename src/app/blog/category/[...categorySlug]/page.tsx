
"use client";

import { useEffect, useState, useMemo } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation'; 
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, CalendarDays, FolderOpen } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-data';
import type { CategoryNode } from '@/lib/categories-data';
import { BreadcrumbDisplay } from '@/components/blog/breadcrumb-display';
import { RelatedPostsSection } from '@/components/blog/related-posts-section';
import { Separator } from '@/components/ui/separator';

// Sidebar Widgets
import { AuthorCard } from '@/components/blog/sidebar/AuthorCard';
import { SearchWidget } from '@/components/blog/sidebar/SearchWidget';
import { RecentPostsWidget } from '@/components/blog/sidebar/RecentPostsWidget';
import { CategoriesWidget } from '@/components/blog/sidebar/CategoriesWidget';
import { InstagramWidget } from '@/components/blog/sidebar/InstagramWidget';
import { TagsWidget } from '@/components/blog/sidebar/TagsWidget';


export default function CategoryArchivePage() {
  const params = useParams<{ categorySlug: string[] }>(); 
  const categorySlugArray = params.categorySlug; 
  const router = useRouter(); 

  const [category, setCategory] = useState<(CategoryNode & { path?: CategoryNode[] }) | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(""); 

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      if (!categorySlugArray || categorySlugArray.length === 0) {
        setIsLoading(false);
        notFound();
        return;
      }
      try {
        const categoryResponse = await fetch(`/api/categories/slugPath/${categorySlugArray.join('/')}?include_path=true`);

        if (!categoryResponse.ok) {
            if (categoryResponse.status === 404) notFound();
            throw new Error('Failed to fetch category details');
        }
        const categoryData: CategoryNode & { path?: CategoryNode[] } = await categoryResponse.json();
        setCategory(categoryData);

        if (categoryData && categoryData.id) {
          const postsResponse = await fetch(`/api/blog?categoryId=${categoryData.id}&enriched=true`);
          if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts for this category');
          }
          const postsData: BlogPost[] = await postsResponse.json();
          setPosts(postsData);
        } else {
            notFound(); 
        }

      } catch (err: any) {
        console.error("Error in CategoryArchivePage:", err);
        setError(err.message || "Could not load category content.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [categorySlugArray]); 

  const handleSearch = (query: string) => {
    setCurrentSearchQuery(query);
    router.push(`/blog?search=${encodeURIComponent(query)}`);
  };

  const excludedSlugs = useMemo(() => posts.map(p => p.slug), [posts]);

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
    return null; // Ensure notFound is called and component returns
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        <main className="lg:col-span-8 xl:col-span-9">
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
                            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                            data-ai-hint={post.featuredImageHint || 'category post'}
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
          {category?.id && (
            <RelatedPostsSection 
                sectionTitle={`More in ${category.name}`}
                categoryId={category.id} 
                excludeSlugs={excludedSlugs}
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
