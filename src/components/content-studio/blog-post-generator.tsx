
"use client";

import { useState } from "react";
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
import { Loader2, Wand2, Eye, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const formSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters."),
  seoKeywords: z.string().min(3, "SEO Keywords must be at least 3 characters."),
  brandVoice: z.string().min(5, "Brand Voice description must be at least 5 characters."),
});

// Helper function to create a slug (simplified)
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-');          // Replace multiple hyphens with single
};

export function BlogPostGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<GenerateBlogPostOutput & { slug?: string; topic?: string } | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      seoKeywords: "",
      brandVoice: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setPublishedSlug(null);
    try {
      const output = await generateBlogPost(values as GenerateBlogPostInput);
      const slug = createSlug(output.title);
      setResult({ ...output, slug, topic: values.topic }); // Store topic for category derivation
      toast({
        title: "Blog Post Generated!",
        description: "Your AI-powered blog post is ready. You can now publish it.",
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
    if (!result || !result.slug || !result.topic) {
      toast({ title: "Error", description: "No post content or topic to publish.", variant: "destructive" });
      return;
    }
    setIsPublishing(true);

    // Simple category derivation (first word of topic, capitalized)
    const derivedCategory = result.topic.split(' ')[0];
    const capitalizedCategory = derivedCategory.charAt(0).toUpperCase() + derivedCategory.slice(1).toLowerCase();

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
          tags: ["AI Generated", result.topic.substring(0,20)], 
          imageUrl: `https://placehold.co/800x400.png?text=${encodeURIComponent(result.title.substring(0,15))}`,
          imageHint: "abstract content topic",
          originalLanguage: "en",
          category: capitalizedCategory, // Send derived category
          subcategory: "", // Send empty subcategory for now
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
            Generate a complete blog post with SEO considerations and your unique brand voice.
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
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || isPublishing} size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Blog Post
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
              <Button onClick={handlePublishPost} disabled={isPublishing || isLoading || !!publishedSlug} className="bg-accent text-accent-foreground hover:bg-accent/90">
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
