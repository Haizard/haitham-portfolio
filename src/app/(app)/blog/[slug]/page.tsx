
"use client";

import { useEffect, useState, useCallback } from 'react';
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays, Globe, Loader2, Tag, Folder } from "lucide-react";
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
import { getPostSlugs, getPostBySlug } from '@/lib/blog-data';
import { translateBlogContent } from '@/ai/flows/translate-blog-content';
import { CommentSection } from "@/components/blog/comment-section";
import { RelatedPostsSection } from "@/components/blog/related-posts-section"; // Added import

// Data fetching functions still outside the component for generateStaticParams
async function getAllPostSlugsForStaticParams(): Promise<{ slug: string }[]> {
  try {
    const posts = getPostSlugs();
    return posts.map((post) => ({ slug: post.slug }));
  } catch (error) {
    console.error("Error in getAllPostSlugsForStaticParams:", error);
    return [];
  }
}

export async function generateStaticParams() {
  return getAllPostSlugsForStaticParams();
}

async function getPostData(slug: string): Promise<BlogPost | null> {
  try {
    const post = getPostBySlug(slug);
    return post || null;
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

interface BlogPostPageProps {
  params: {
    slug: string;
  };
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

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const fetchAndSetPost = useCallback(async () => {
    setIsLoadingPost(true);
    const fetchedPost = await getPostData(slug);
    if (fetchedPost) {
      setPost(fetchedPost);
      setSelectedLanguage(fetchedPost.originalLanguage);
      setTranslatedContent(null); 
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
            <Badge variant="outline" className="text-sm">{post.category}</Badge>
            {post.subcategory && (
              <>
                <span className="text-muted-foreground text-sm">/</span>
                <Badge variant="outline" className="text-sm">{post.subcategory}</Badge>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2 items-center">
             <Tag className="h-4 w-4 text-muted-foreground mr-1" />
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
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
      
      <RelatedPostsSection 
        category={post.category} 
        subcategory={post.subcategory} 
        currentPostSlug={post.slug} 
      />

    </div>
  );
}

