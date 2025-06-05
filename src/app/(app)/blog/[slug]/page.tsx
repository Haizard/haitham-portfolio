
"use client";

import { useEffect, useState } from 'react';
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import { CalendarDays, Globe, Loader2, Tag, Folder, ExternalLink, Download, FileText, FileDown, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost, GalleryImage, DownloadLink } from '@/lib/blog-data';
import type { CategoryNode } from '@/lib/categories-data';
import type { Tag as TagType } from '@/lib/tags-data';
import { translateBlogContent } from '@/ai/flows/translate-blog-content';
import { CommentSection } from "@/components/blog/comment-section";
import { RelatedPostsSection } from "@/components/blog/related-posts-section";
import { BreadcrumbDisplay } from '@/components/blog/breadcrumb-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getPostData(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`/api/blog/${slug}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; 
      }
      const errorText = await response.text().catch(() => "Failed to read error response");
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    const post = await response.json();
    return post || null;
  } catch (error) {
    console.error(`Error fetching post ${slug} from API:`, error);
    if (error instanceof Error) {
      throw new Error(error.message || `Unknown error fetching post ${slug}`);
    }
    throw new Error(`Unknown error fetching post ${slug}`);
  }
}


const availableLanguages = [
  { code: "en", name: "English" },
  { code: "sw", name: "Swahili" },
  { code: "ar", name: "Arabic" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
];

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [categoryDetails, setCategoryDetails] = useState<(CategoryNode & { path?: CategoryNode[] }) | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [postTags, setPostTags] = useState<TagType[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingPost(true);
    setIsLoadingCategory(true);
    setIsLoadingTags(true);
    setPost(null);
    setCategoryDetails(null);
    setPostTags([]);
    setTranslatedContent(null);
    setSelectedLanguage(undefined);
    setError(null);

    if (!slug) {
      setIsLoadingPost(false);
      setIsLoadingCategory(false);
      setIsLoadingTags(false);
      setError("No post slug provided.");
      notFound(); 
      return;
    }

    async function fetchData() {
      try {
        const fetchedPost = await getPostData(slug);

        if (fetchedPost) {
          setPost(fetchedPost);
          setSelectedLanguage(fetchedPost.originalLanguage);

          if (fetchedPost.categoryId) {
            setIsLoadingCategory(true);
            try {
              const catResponse = await fetch(`/api/categories/${fetchedPost.categoryId}?include_path=true`);
              if (catResponse.ok) {
                const catData: CategoryNode & { path?: CategoryNode[] } = await catResponse.json();
                setCategoryDetails(catData);
              } else {
                console.warn(`Could not fetch category details for ID: ${fetchedPost.categoryId}`);
                setCategoryDetails({ id: fetchedPost.categoryId, name: "Unknown Category", slug: "unknown", children: [] });
              }
            } catch (catError) {
              console.error("Error fetching category:", catError);
              setCategoryDetails({ id: fetchedPost.categoryId, name: "Error loading category", slug: "error", children: [] });
            } finally {
              setIsLoadingCategory(false);
            }
          } else {
            setCategoryDetails({ id: 'uncategorized', name: "Uncategorized", slug: "uncategorized", children: [] });
            setIsLoadingCategory(false);
          }

          if (fetchedPost.tagIds && fetchedPost.tagIds.length > 0) {
            setIsLoadingTags(true);
            try {
              const tagsResponse = await fetch('/api/tags');
              if (tagsResponse.ok) {
                const allTags: TagType[] = await tagsResponse.json();
                const resolvedTags = allTags.filter(t => fetchedPost.tagIds?.includes(t.id!));
                setPostTags(resolvedTags);
              } else {
                console.warn("Could not fetch all tags to resolve post tags.");
                setPostTags([]);
              }
            } catch (tagError) {
              console.error("Error fetching tags for post:", tagError);
              setPostTags([]);
            } finally {
              setIsLoadingTags(false);
            }
          } else {
            setPostTags([]);
            setIsLoadingTags(false);
          }
        } else {
          setError(`Post with slug "${slug}" not found. NEXT_HTTP_ERROR_FALLBACK;404`);
          notFound(); 
        }
      } catch (fetchError: any) {
        console.error("Error in fetchData for blog post:", fetchError);
        setError(fetchError.message || "An error occurred while trying to load the post.");
      } finally {
        setIsLoadingPost(false);
        if (isLoadingCategory) setIsLoadingCategory(false); 
        if (isLoadingTags) setIsLoadingTags(false);
      }
    }

    fetchData();
  }, [slug, toast]); 

  const handleLanguageChange = async (newLangCode: string) => {
    if (!post || !post.content) return;
    setSelectedLanguage(newLangCode);
    if (newLangCode === post.originalLanguage) {
      setTranslatedContent(null);
      return;
    }
    setIsTranslating(true);
    try {
      const translationResult = await translateBlogContent({
        htmlContent: post.content,
        targetLanguage: availableLanguages.find(l => l.code === newLangCode)?.name || newLangCode,
        originalLanguage: availableLanguages.find(l => l.code === post.originalLanguage)?.name || post.originalLanguage,
      });
      setTranslatedContent(translationResult.translatedHtmlContent);
      toast({ title: "Content Translated", description: `Post translated to ${availableLanguages.find(l => l.code === newLangCode)?.name}.` });
    } catch (translateError) {
      console.error("Error translating content:", translateError);
      toast({ title: "Translation Error", description: "Could not translate content. Reverting to original.", variant: "destructive" });
      setTranslatedContent(null);
      setSelectedLanguage(post.originalLanguage);
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl text-center">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Error Loading Post</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button asChild className="mt-6">
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  if (!post) {
    return null; 
  }

  const displayContent = translatedContent ?? post.content;
  const currentLanguageName = availableLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <article>
        {categoryDetails?.path && categoryDetails.path.length > 0 && (
            <BreadcrumbDisplay path={categoryDetails.path} className="mb-4" />
        )}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline mb-4">{post.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-muted-foreground mb-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.authorAvatar} alt={post.author} data-ai-hint="author avatar" />
                  <AvatarFallback>{post.author.substring(0,1)}</AvatarFallback>
                </Avatar>
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CalendarDays className="h-4 w-4" />
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isTranslating}>
                  <SelectTrigger className="w-[180px] h-9 text-sm">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} {lang.code === post.originalLanguage && "(Original)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isTranslating && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 items-center">
            <Folder className="h-4 w-4 text-muted-foreground mr-1" />
            {isLoadingCategory ? (
              <Badge variant="outline" className="text-sm">Loading category...</Badge>
            ) : categoryDetails?.name ? (
               <Link href={`/blog/category/${categoryDetails.path ? categoryDetails.path.map(p=>p.slug).join('/') : categoryDetails.slug}`} className="hover:underline">
                <Badge variant="outline" className="text-sm cursor-pointer hover:bg-secondary">{categoryDetails.name}</Badge>
              </Link>
            ) : (
              <Badge variant="outline" className="text-sm">Uncategorized</Badge>
            )}
          </div>
          
          {(isLoadingTags || (postTags && postTags.length > 0)) && (
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <Tag className="h-4 w-4 text-muted-foreground mr-1" />
              {isLoadingTags ? (
                 <Badge variant="secondary" className="text-xs">Loading tags...</Badge>
              ) : (
                postTags.map(tag => (
                  <Link key={tag.id} href={`/blog/tag/${tag.slug}`} className="hover:underline">
                    <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-accent hover:text-accent-foreground">{tag.name}</Badge>
                  </Link>
                ))
              )}
            </div>
          )}
        </header>

        {post.featuredImageUrl && (
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            width={800}
            height={400}
            className="rounded-lg mb-8 shadow-lg w-full object-cover aspect-[2/1]"
            data-ai-hint={post.featuredImageHint || "featured image"}
          />
        )}

        {post.galleryImages && post.galleryImages.length > 0 && (
          <>
            <section className="mb-8"> {/* Changed margin from my-12 to mb-8 */}
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline mb-6 flex items-center">
                <ImageIcon className="mr-3 h-7 w-7 text-primary" />
                Image Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {post.galleryImages.map((image, index) => (
                  <div key={index} className="overflow-hidden rounded-lg shadow-lg group">
                    <div className="aspect-w-4 aspect-h-3 bg-muted">
                      <Image
                        src={image.url}
                        alt={image.caption || `Gallery image ${index + 1}`}
                        width={400}
                        height={300}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={image.hint || "gallery photo"}
                      />
                    </div>
                    {image.caption && (
                      <p className="mt-2 p-2 text-xs text-center text-muted-foreground bg-card">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
            <Separator className="mb-12" /> {/* Separator now after gallery, before prose */}
          </>
        )}

        {isTranslating && selectedLanguage !== post.originalLanguage ? (
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12 flex flex-col items-center justify-center min-h-[300px] bg-muted/50 rounded-md p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Translating to {currentLanguageName}...</p>
          </div>
        ) : (
          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        )}
        
      </article>

      {post.downloads && post.downloads.length > 0 && (
        <>
          <Separator className="my-12" />
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-headline">
                <FileDown className="h-6 w-6 text-primary" />
                Downloadable Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {post.downloads.map((download, index) => (
                  <li key={index} className="p-3 bg-secondary/50 rounded-lg shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-base">{download.name}</h4>
                      {download.description && <p className="text-xs text-muted-foreground mt-0.5">{download.description}</p>}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href={download.url} download={download.fileName || true} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}


      <Separator className="my-12" />
      <CommentSection postId={post.slug} initialComments={post.comments || []} />
      <Separator className="my-12" />
      
      {post.categoryId && (
        <RelatedPostsSection 
          categoryId={post.categoryId}
          currentPostSlug={post.slug} 
        />
      )}
    </div>
  );
}

