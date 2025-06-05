
"use client";

import 'react-quill/dist/quill.snow.css'; // Import Quill CSS here
import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dynamic from 'next/dynamic';
import { generateBlogPost, type GenerateBlogPostInput, type GenerateBlogPostOutput } from "@/ai/flows/generate-blog-post";
import { generateImageForPost } from "@/ai/flows/generate-image-for-post";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, Eye, Send, ListTree, Tags, ImagePlus, PlusCircle, Trash2, BookOpen, Edit, FileText, Sparkles as SparklesIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { CategoryNode } from '@/lib/categories-data';
import { Separator } from "../ui/separator";
import Image from "next/image";

// Dynamically import ReactQuill
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[300px] border rounded-md bg-muted"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Loading Editor...</p></div>,
});


const galleryImageSchema = z.object({
  url: z.string().url("Image URL must be a valid URL.").min(1, "URL is required."),
  caption: z.string().optional(),
  hint: z.string().optional(),
});

const downloadLinkSchema = z.object({
  name: z.string().min(1, "File name is required."),
  url: z.string().url("File URL must be a valid URL.").min(1, "URL is required."),
  description: z.string().optional(),
  fileName: z.string().optional().describe("Suggested filename for download attribute"),
});

const formSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters."),
  seoKeywords: z.string().min(3, "SEO Keywords must be at least 3 characters."),
  brandVoice: z.string().min(5, "Brand Voice description must be at least 5 characters."),
  editableContent: z.string().min(1, "Post content cannot be empty once generated.").refine(value => value !== '<p><br></p>' && value !== '<p></p>', { message: "Post content cannot be substantially empty."}),
  categoryId: z.string().min(1, "Category selection is required.").optional(),
  tags: z.string().optional().describe("Comma-separated list of tags"),
  featuredImageUrl: z.string().url("Featured image URL must be valid.").optional().or(z.literal('')),
  featuredImageHint: z.string().optional(),
  galleryImages: z.array(galleryImageSchema).optional(),
  downloads: z.array(downloadLinkSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const createSlug = (title: string) => {
  if (!title) return `blog-post-${Date.now()}`;
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

const flattenCategories = (categories: CategoryNode[], level = 0): FlattenedCategory[] => {
  let flatList: FlattenedCategory[] = [];
  const indent = "\u00A0\u00A0".repeat(level * 2); 
  for (const category of categories) {
    if (!category.id) continue; 
    flatList.push({ value: category.id, label: `${indent}${category.name}`, level });
    if (category.children && category.children.length > 0) {
      flatList = flatList.concat(flattenCategories(category.children, level + 1));
    }
  }
  return flatList;
};

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
  'list', 'bullet', 'script', 'indent', 'direction', 'align',
  'link', 'image', 'video'
];


export function BlogPostGenerator() {
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<(GenerateBlogPostOutput & { slug?: string }) | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); 
  }, []);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      seoKeywords: "",
      brandVoice: "",
      editableContent: "",
      categoryId: "",
      tags: "",
      featuredImageUrl: "",
      featuredImageHint: "",
      galleryImages: [],
      downloads: [],
    },
  });

  const { fields: galleryImageFields, append: appendGalleryImage, remove: removeGalleryImage } = useFieldArray({
    control: form.control,
    name: "galleryImages",
  });

  const { fields: downloadFields, append: appendDownload, remove: removeDownload } = useFieldArray({
    control: form.control,
    name: "downloads",
  });

  const watchedFeaturedImageUrl = form.watch("featuredImageUrl"); 

  useEffect(() => {
    async function fetchCategoriesData() {
      setIsLoadingCategories(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data: CategoryNode[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategoriesData();
  }, [toast]);

  const flattenedCategoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  const onAiSubmit = async (values: Pick<FormValues, 'topic' | 'seoKeywords' | 'brandVoice'>) => {
    setIsLoadingAi(true);
    setGeneratedPost(null);
    form.setValue('editableContent', '');
    setPublishedSlug(null);
    try {
      const aiInput: GenerateBlogPostInput = {
        topic: values.topic,
        seoKeywords: values.seoKeywords,
        brandVoice: values.brandVoice,
      };
      const output = await generateBlogPost(aiInput);

      if (!output || !output.title || !output.content) {
        const errorMsg = "AI did not return a valid title or content. Please try again or refine your inputs.";
        toast({ title: "AI Error", description: errorMsg, variant: "destructive" });
        form.setValue('editableContent', `<p>Error: ${errorMsg}</p>`);
        setGeneratedPost(null); 
        throw new Error(errorMsg);
      }

      const slug = createSlug(output.title);
      setGeneratedPost({ ...output, slug });
      form.setValue('editableContent', output.content); 
      toast({
        title: "Blog Post Content Generated!",
        description: "Review and edit the content in the editor below, add images/downloads, category, tags, and then publish.",
      });
    } catch (error: any) {
      console.error("Error generating blog post content:", error);
      const errorMessage = error.message || "AI failed to generate content.";
      setGeneratedPost(null);
      form.setValue('editableContent', `<p>Error: ${errorMessage}</p>`);
      if (!toast.toasts.find(t => t.title === "AI Error" && t.description === errorMessage)) {
         if (generatedPost === null) { 
             toast({ title: "Error generating content", description: errorMessage, variant: "destructive" });
         }
      }
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleGenerateContent = async () => {
    const aiInputFields: Array<keyof Pick<FormValues, 'topic' | 'seoKeywords' | 'brandVoice'>> = ['topic', 'seoKeywords', 'brandVoice'];
    const allValid = await form.trigger(aiInputFields);

    if (!allValid) {
      toast({
        title: "Missing Information",
        description: "Please fill in Topic, SEO Keywords, and Brand Voice before generating content.",
        variant: "destructive",
      });
      return;
    }
    const values = form.getValues();
    onAiSubmit({
      topic: values.topic,
      seoKeywords: values.seoKeywords,
      brandVoice: values.brandVoice,
    });
  };

  const handleGenerateAiImage = async () => {
    const topic = form.getValues("topic");
    const title = generatedPost?.title;
    const promptForImage = title || topic;

    if (!promptForImage) {
      toast({
        title: "Missing Prompt",
        description: "Please provide a Topic or generate content (for a title) to create an image.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingImage(true);
    try {
      const imageResult = await generateImageForPost({ prompt: promptForImage });
      form.setValue("featuredImageUrl", imageResult.imageDataUri);
      form.setValue("featuredImageHint", imageResult.suggestedHint);
      toast({ title: "AI Image Generated!", description: "Featured image has been populated." });
    } catch (error: any) {
      console.error("Error generating AI image:", error);
      toast({ title: "AI Image Error", description: error.message || "Could not generate image.", variant: "destructive" });
    } finally {
      setIsGeneratingImage(false);
    }
  };


  async function handlePublishPost(values: FormValues) {
    if (!generatedPost || !generatedPost.slug || !generatedPost.title) {
      toast({ title: "Error", description: "No AI-generated base content to publish. Please generate content first.", variant: "destructive" });
      return;
    }
     if (!values.editableContent || values.editableContent.trim() === '' || values.editableContent === '<p><br></p>' || values.editableContent === '<p></p>') {
      form.setError("editableContent", { type: "manual", message: "Post content cannot be empty." });
      toast({ title: "Validation Error", description: "Post content cannot be empty.", variant: "destructive" });
      return;
    }
    if (!values.categoryId) {
      form.setError("categoryId", { type: "manual", message: "Category is required to publish." });
      toast({ title: "Validation Error", description: "Category is required.", variant: "destructive" });
      return;
    }

    setIsPublishing(true);
    const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedPost.title,
          content: values.editableContent, 
          slug: generatedPost.slug,
          author: "AI Content Studio", 
          authorAvatar: "https://placehold.co/100x100.png?text=AI", 
          tags: tagsArray,
          featuredImageUrl: values.featuredImageUrl,
          featuredImageHint: values.featuredImageHint,
          galleryImages: values.galleryImages,
          downloads: values.downloads,
          originalLanguage: "en", 
          categoryId: values.categoryId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to publish post. Status: ${response.status}`);
      }
      const publishedPostData = await response.json();
      setPublishedSlug(publishedPostData.slug);
      toast({ title: "Post Published!", description: `"${publishedPostData.title}" is now live.` });
    } catch (error: any) {
      console.error("Error publishing post:", error);
      toast({ title: "Publishing Error", description: error.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handlePublishPost)}>
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                <Wand2 className="h-7 w-7 text-primary" /> AI Content Generation
              </CardTitle>
              <CardDescription>
                Provide initial details for the AI to generate blog post content.
              </CardDescription>
            </CardHeader>
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
                    <Textarea placeholder="e.g., remote work, productivity, collaboration tools" className="min-h-[80px] text-base p-3" {...field}/>
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
                    <Textarea placeholder="e.g., Professional and informative, yet approachable." className="min-h-[80px] text-base p-3" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="button" 
                onClick={handleGenerateContent} 
                disabled={isLoadingAi || isPublishing || isGeneratingImage} 
                size="lg" 
                className="w-full md:w-auto bg-primary hover:bg-primary/90"
              >
                {isLoadingAi ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                Generate Blog Content
              </Button>
            </CardFooter>
          </Card>

          {generatedPost && (
            <Card className="shadow-lg animate-in fade-in-50 duration-500 mt-8">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
                  <Edit className="h-7 w-7" /> Review & Enhance Content
                </CardTitle>
                <CardDescription>Review the AI-generated content. Edit it below, add images, downloads, category, and tags before publishing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Original AI Title:</h3>
                  <p className="text-lg p-3 bg-muted rounded-md">{generatedPost.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">Slug: <code className="bg-muted px-1 rounded">{generatedPost.slug}</code> (Generated from this title. Title for publishing will be this one.)</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">SEO Keyword Reasoning:</h3>
                  <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">{generatedPost.reasoning}</p>
                </div>
                
                <FormField
                  control={form.control}
                  name="editableContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Editable Content</FormLabel>
                      <FormControl>
                        {isClient && ReactQuill ? ( 
                          <div className="bg-card"> 
                            <ReactQuill
                              theme="snow"
                              value={typeof field.value === 'string' ? field.value : ''}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              modules={quillModules}
                              formats={quillFormats}
                              placeholder="AI-generated HTML content will appear here for editing..."
                            />
                          </div>
                        ) : (
                           <Textarea
                            placeholder="Loading editor or AI content..."
                            className="min-h-[300px] font-code text-sm p-3"
                            value={typeof field.value === 'string' ? field.value : ''}
                            readOnly
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                <h3 className="text-xl font-semibold flex items-center gap-2"><ImagePlus className="h-6 w-6 text-primary" /> Images & Files</h3>
                
                <div className="space-y-2">
                    <FormLabel>Featured Image</FormLabel>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="flex-grow space-y-4">
                            <FormField
                                control={form.control}
                                name="featuredImageUrl"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm">URL</FormLabel>
                                    <Input placeholder="https://example.com/featured.jpg" {...field} />
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="featuredImageHint"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm">AI Hint (max 2 words)</FormLabel>
                                    <Input placeholder="e.g., abstract technology" {...field} />
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex-shrink-0 sm:w-auto sm:text-right space-y-2">
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={handleGenerateAiImage} 
                                disabled={isGeneratingImage || isLoadingAi || isPublishing}
                                className="w-full sm:w-auto"
                            >
                                {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SparklesIcon className="mr-2 h-4 w-4" />}
                                Generate AI Image
                            </Button>
                             {watchedFeaturedImageUrl && (
                                <div className="mt-2 p-2 border rounded-md bg-muted max-w-[200px] mx-auto sm:mx-0">
                                    <Image src={watchedFeaturedImageUrl} alt="Featured image preview" width={200} height={100} className="object-cover rounded" data-ai-hint="image preview"/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <div className="space-y-4">
                  <FormLabel className="text-base font-medium">Gallery Images (Optional)</FormLabel>
                  {galleryImageFields.map((item, index) => (
                    <Card key={item.id} className="p-4 space-y-3 bg-secondary/50">
                      <FormField control={form.control} name={`galleryImages.${index}.url`} render={({ field }) => (
                        <FormItem><FormLabel>Image URL</FormLabel><Input placeholder="https://example.com/gallery_image.jpg" {...field} /><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name={`galleryImages.${index}.caption`} render={({ field }) => (
                        <FormItem><FormLabel>Caption (Optional)</FormLabel><Input placeholder="Image caption" {...field} /><FormMessage /></FormItem>
                      )}/>
                       <FormField control={form.control} name={`galleryImages.${index}.hint`} render={({ field }) => (
                        <FormItem><FormLabel>AI Hint (Optional, max 2 words)</FormLabel><Input placeholder="e.g., mountain landscape" {...field} /><FormMessage /></FormItem>
                      )}/>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeGalleryImage(index)} className="text-destructive hover:text-destructive/90"><Trash2 className="mr-1 h-4 w-4"/>Remove Image</Button>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendGalleryImage({ url: "", caption: "", hint:"" })}><PlusCircle className="mr-2 h-4 w-4"/>Add Gallery Image</Button>
                </div>

                <div className="space-y-4">
                  <FormLabel className="text-base font-medium">Downloadable Files (Optional)</FormLabel>
                  {downloadFields.map((item, index) => (
                    <Card key={item.id} className="p-4 space-y-3 bg-secondary/50">
                       <FormField control={form.control} name={`downloads.${index}.name`} render={({ field }) => (
                        <FormItem><FormLabel>Display Name</FormLabel><Input placeholder="e.g., Project Source Code" {...field} /><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name={`downloads.${index}.url`} render={({ field }) => (
                        <FormItem><FormLabel>File URL</FormLabel><Input placeholder="https://example.com/download.zip" {...field} /><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name={`downloads.${index}.description`} render={({ field }) => (
                        <FormItem><FormLabel>Description (Optional)</FormLabel><Input placeholder="Short description of the file" {...field} /><FormMessage /></FormItem>
                      )}/>
                       <FormField control={form.control} name={`downloads.${index}.fileName`} render={({ field }) => (
                        <FormItem><FormLabel>Download Filename (Optional)</FormLabel><Input placeholder="my-project.zip" {...field} /><FormMessage /></FormItem>
                      )}/>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeDownload(index)} className="text-destructive hover:text-destructive/90"><Trash2 className="mr-1 h-4 w-4"/>Remove File</Button>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendDownload({ name: "", url: "", description: "", fileName:"" })}><PlusCircle className="mr-2 h-4 w-4"/>Add Downloadable File</Button>
                </div>

                <Separator />
                <h3 className="text-xl font-semibold flex items-center gap-2"><ListTree className="h-6 w-6 text-primary"/> Categorization & Tagging</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Blog Post Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoadingCategories || flattenedCategoryOptions.length === 0}>
                          <FormControl><SelectTrigger className="text-base p-3"><SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {isLoadingCategories ? <SelectItem value="loading" disabled>Loading...</SelectItem> : 
                             flattenedCategoryOptions.length === 0 ? <SelectItem value="no-cat" disabled>No categories. Create one in Admin.</SelectItem> :
                             flattenedCategoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value} style={{ paddingLeft: `${opt.level * 1 + 0.5}rem`}}>{opt.label}</SelectItem>)}
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
                        <FormLabel className="text-base">Tags (comma-separated)</FormLabel>
                        <Input placeholder="e.g., AI, React, Productivity" {...field} className="text-base p-3" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-end gap-3">
                {publishedSlug && (
                  <Button variant="outline" asChild>
                    <Link href={`/blog/${publishedSlug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> View Published Post</Link>
                  </Button>
                )}
                <Button type="submit" disabled={isPublishing || isLoadingAi || !!publishedSlug || isGeneratingImage} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
                  {isPublishing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                  {publishedSlug ? "Post Published" : "Publish Post"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}
