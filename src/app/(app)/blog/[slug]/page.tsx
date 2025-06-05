
"use client";

import { useEffect, useState, useCallback } from 'react';
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import { CalendarDays, Globe, Loader2, Tag, Folder, ExternalLink } from "lucide-react";
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
import type { BlogPost } from '@/lib/blog-data';
import type { CategoryNode } from '@/lib/categories-data';
import type { Tag as TagType } from '@/lib/tags-data'; // Import Tag type
import { getPostBySlug } from '@/lib/blog-data';
import { translateBlogContent } from '@/ai/flows/translate-blog-content';
import { CommentSection } from "@/components/blog/comment-section";
import { RelatedPostsSection } from "@/components/blog/related-posts-section";
import { BreadcrumbDisplay } from '@/components/blog/breadcrumb-display';

// generateStaticParams and its helper removed as this is a Client Component

async function getPostData(slug: string): Promise<BlogPost | null> {
  try {
    const post = getPostBySlug(slug);
    return post || null;
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
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
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  
  const [postTags, setPostTags] = useState<TagType[]>([]); // For storing resolved Tag objects
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const fetchAndSetPost = useCallback(async () => {
    if (!slug) return;
    setIsLoadingPost(true);
    setCategoryDetails(null);
    setPostTags([]);

    const fetchedPost = await getPostData(slug);
    if (fetchedPost) {
      setPost(fetchedPost);
      setSelectedLanguage(fetchedPost.originalLanguage);
      setTranslatedContent(null);

      if (fetchedPost.categoryId) {
        setIsLoadingCategory(true);
        try {
          const catResponse = await fetch(`/api/categories/${fetchedPost.categoryId}?include_path=true`);
          if (catResponse.ok) {
            const catData: CategoryNode & { path?: CategoryNode[] } = await catResponse.json();
            setCategoryDetails(catData);
          } else {
            console.warn(`Could not fetch category details for ID: ${fetchedPost.categoryId}`);
            setCategoryDetails({ id: fetchedPost.categoryId, name: "Unknown Category", slug: "unknown", children: [] }); // Fallback
          }
        } catch (error) {
          console.error("Error fetching category:", error);
           setCategoryDetails({ id: fetchedPost.categoryId, name: "Error loading category", slug: "error", children: [] }); // Error Fallback
        } finally {
          setIsLoadingCategory(false);
        }
      } else {
        setCategoryDetails({ id: 'uncategorized', name: "Uncategorized", slug: "uncategorized", children: [] });
        setIsLoadingCategory(false);
      }

      // Fetch tag details if tagIds exist
      if (fetchedPost.tagIds && fetchedPost.tagIds.length > 0) {
        setIsLoadingTags(true);
        try {
          // This assumes an API endpoint that can take multiple IDs or we fetch one by one
          // For simplicity, let's assume we fetch all tags and filter, or an endpoint like /api/tags?ids=id1,id2
          // A more robust way: fetch each tag by ID if not too many, or have a dedicated batch endpoint.
          // For now, we'll simulate by using a general GET /api/tags and filtering client-side (not ideal for many tags)
          const tagsResponse = await fetch('/api/tags');
          if (tagsResponse.ok) {
            const allTags: TagType[] = await tagsResponse.json();
            const resolvedTags = allTags.filter(t => fetchedPost.tagIds?.includes(t.id));
            setPostTags(resolvedTags);
          } else {
            console.warn("Could not fetch all tags to resolve post tags.");
          }
        } catch (error) {
            console.error("Error fetching tags for post:", error);
        } finally {
            setIsLoadingTags(false);
        }
      } else if (fetchedPost.tags && fetchedPost.tags.length > 0) {
        // Fallback for older posts that might only have string tags
        setPostTags(fetchedPost.tags.map(t_name => ({id: t_name, name: t_name, slug: t_name.toLowerCase().replace(/\s+/g, '-')})));
      }


    } else {
      notFound();
    }
    setIsLoadingPost(false);
  }, [slug]);

  useEffect(() => {
    fetchAndSetPost();
  }, [fetchAndSetPost]);

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
    } catch (error) {
      console.error("Error translating content:", error);
      toast({ title: "Translation Error", description: "Could not translate content. Reverting to original.", variant: "destructive" });
      setTranslatedContent(null);
      setSelectedLanguage(post.originalLanguage);
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoadingPost || !post) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
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
          
          {(isLoadingTags || postTags.length > 0) && (
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

        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={800}
            height={400}
            className="rounded-lg mb-8 shadow-lg w-full object-cover aspect-[2/1]"
            data-ai-hint={post.imageHint}
          />
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
