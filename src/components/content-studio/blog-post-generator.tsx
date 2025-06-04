
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
import { Loader2, Wand2, Eye } from "lucide-react";
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
  const [result, setResult] = useState<GenerateBlogPostOutput & { slug?: string } | null>(null);
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
    try {
      const output = await generateBlogPost(values as GenerateBlogPostInput);
      const slug = createSlug(output.title); // Generate slug from title
      setResult({ ...output, slug });
      toast({
        title: "Blog Post Generated!",
        description: "Your AI-powered blog post is ready.",
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
              <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90">
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-headline text-primary">{result.title}</CardTitle>
            {result.slug && (
               <Button variant="outline" asChild>
                 <Link href={`/blog/${result.slug}`} target="_blank">
                   <Eye className="mr-2 h-4 w-4" /> View Post
                 </Link>
               </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">SEO Keyword Reasoning:</h3>
              <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">{result.reasoning}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Blog Post Content:</h3>
              <ScrollArea className="h-[400px] border rounded-md p-4">
                <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none whitespace-pre-wrap font-body" dangerouslySetInnerHTML={{ __html: result.content.replace(/\n/g, '<br />') }} />
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
