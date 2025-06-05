
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateBlogPost, type GenerateBlogPostInput, type GenerateBlogPostOutput } from "@/ai/flows/generate-blog-post";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, Eye, Send, ListTree, Tags } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { CategoryNode } from '@/lib/categories-data';

const formSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters."),
  seoKeywords: z.string().min(3, "SEO Keywords must be at least 3 characters."),
  brandVoice: z.string().min(5, "Brand Voice description must be at least 5 characters."),
  categoryId: z.string().min(1, "Category selection is required."),
  tags: z.string().optional().describe("Comma-separated list of tags"), // For user input
});

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-')          
    .replace(/-+/g, '-');          
};

interface FlattenedCategory {
  value: string;
  label: string;
  level: number;
}

const flattenCategories = (categories: CategoryNode[], parentPath = "", level = 0): FlattenedCategory[] => {
  let flatList: FlattenedCategory[] = [];
  const indent = "\u00A0\u00A0".repeat(level * 2); // Indentation using non-breaking spaces for visual hierarchy
  for (const category of categories) {
    const currentPath = parentPath ? `${parentPath} > ${category.name}` : category.name;
    flatList.push({ value: category.id, label: `${indent}${category.name}`, level }); // Store level for potential styling
    if (category.children && category.children.length > 0) {
      flatList = flatList.concat(flattenCategories(category.children, currentPath, level + 1));
    }
  }
  return flatList;
};

export function BlogPostGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<GenerateBlogPostOutput & { slug?: string } | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      seoKeywords: "",
      brandVoice: "",
      categoryId: "",
      tags: "",
    },
  });

  useEffect(() => {
    async function fetchCategories() {
      setIsLoadingCategories(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data: CategoryNode[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({ title: "Error", description: "Could not load categories for selection.", variant: "destructive" });
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, [toast]);

  const flattenedCategoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setPublishedSlug(null);
    try {
      const aiInput: GenerateBlogPostInput = {
        topic: values.topic,
        seoKeywords: values.seoKeywords,
        brandVoice: values.brandVoice,
      };
      const output = await generateBlogPost(aiInput);
      const slug = createSlug(output.title);
      setResult({ ...output, slug });
      toast({
        title: "Blog Post Generated!",
        description: "Your AI-powered blog post is ready. Review, categorize, tag, and publish.",
      });
    } catch (error) {
      console.error("Error generating blog post:", error);
      toast({
        title: "Error",
        description: "Failed to generate blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePublishPost() {
    if (!result || !result.slug) {
      toast({ title: "Error", description: "No post content to publish.", variant: "destructive" });
      return;
    }
    
    const { categoryId, topic, tags: tagsString } = form.getValues();

    if (!categoryId) {
        toast({ title: "Validation Error", description: "Category is required to publish.", variant: "destructive" });
        form.setError("categoryId", { type: "manual", message: "Category is required." });
        return;
    }

    setIsPublishing(true);
    const tagsArray = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title,
          content: result.content,
          slug: result.slug,
          author: "AI Content Studio",
          authorAvatar: "https://placehold.co/100x100.png?text=AI",
          tags: tagsArray, // Send the string array of tag names
          imageUrl: `https://placehold.co/800x400.png?text=${encodeURIComponent(result.title.substring(0,15))}`,
          imageHint: "abstract content topic",
          originalLanguage: "en",
          categoryId: categoryId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to publish post. Status: ${response.status}`);
      }

      const publishedPost = await response.json();
      setPublishedSlug(publishedPost.slug);
      toast({
        title: "Post Published!",
        description: `"${publishedPost.title}" is now live.`,
      });
    } catch (error: any) {
      console.error("Error publishing post:", error);
      toast({
        title: "Publishing Error",
        description: error.message || "Could not publish the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
            <Wand2 className="h-7 w-7 text-primary" />
            AI Blog Post Writer
          </CardTitle>
          <CardDescription>
            Generate a complete blog post, then select a category, add tags, and publish.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Blog Post Topic</FormLabel>
                    <Input placeholder="e.g., The Future of Remote Work" {...field} className="text-base p-3" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seoKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">SEO Keywords</FormLabel>
                    <Textarea
                      placeholder="e.g., remote work, productivity, collaboration tools"
                      className="min-h-[100px] text-base p-3"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brandVoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Brand Voice</FormLabel>
                    <Textarea
                      placeholder="e.g., Professional and informative, yet approachable and slightly humorous."
                      className="min-h-[100px] text-base p-3"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center"><ListTree className="mr-2 h-5 w-5 text-muted-foreground"/>Blog Post Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories || flattenedCategoryOptions.length === 0}>
                        <FormControl>
                          <SelectTrigger className="text-base p-3">
                            <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : flattenedCategoryOptions.length === 0 ? (
                            <SelectItem value="no-categories" disabled>No categories available. Create one in Admin.</SelectItem>
                          ) : (
                            flattenedCategoryOptions.map(option => (
                              <SelectItem key={option.value} value={option.value} className="text-sm" style={{ paddingLeft: `${option.level * 1 + 0.5}rem`}}>
                                {option.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center"><Tags className="mr-2 h-5 w-5 text-muted-foreground"/>Tags</FormLabel>
                      <Input placeholder="e.g., AI, React, Productivity" {...field} className="text-base p-3" />
                      <FormMessage />
                       <p className="text-xs text-muted-foreground">Comma-separated. New tags will be created if they don't exist.</p>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || isPublishing || isLoadingCategories} size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Blog Content
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {result && (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-2xl font-headline text-primary">{result.title}</CardTitle>
            <div className="flex gap-2 mt-2 sm:mt-0">
              {publishedSlug && (
                 <Button variant="outline" asChild>
                   <Link href={`/blog/${publishedSlug}`} target="_blank">
                     <Eye className="mr-2 h-4 w-4" /> View Post
                   </Link>
                 </Button>
              )}
              <Button onClick={handlePublishPost} disabled={isPublishing || isLoading || !!publishedSlug || isLoadingCategories} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> {publishedSlug ? "Published" : "Publish Post"}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">SEO Keyword Reasoning:</h3>
              <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">{result.reasoning}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Blog Post Content (HTML Preview):</h3>
              <ScrollArea className="h-[400px] border rounded-md p-4">
                <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none whitespace-pre-wrap font-body" dangerouslySetInnerHTML={{ __html: result.content }} />
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
