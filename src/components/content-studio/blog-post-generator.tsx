
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { generateBlogPost, type GenerateBlogPostInput, type GenerateBlogPostOutput } from "@/ai/flows/generate-blog-post";
import { generateImageForPost } from "@/ai/flows/generate-image-for-post";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, Eye, Send, ListTree, Tags, ImagePlus, PlusCircle, Trash2, BookOpen, Edit, FileText, Sparkles as SparklesIcon, Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, RotateCcw, RotateCw, Strikethrough, Code, MessageSquare, Minus, Link as LinkIconUI, Baseline } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { CategoryNode } from '@/lib/categories-data';
import { Separator } from "../ui/separator";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import type { BlogPost, GalleryImage, DownloadLink } from '@/lib/blog-data';

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
  editableContent: z.string().min(1, "Post content cannot be empty.").refine(value => value !== '<p></p>', { message: "Post content cannot be substantially empty."}),
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

const TiptapToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) { 
      return;
    }
    if (url === '') { 
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="tiptap-toolbar">
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''} title="Bold"><Bold /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''} title="Italic"><Italic /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''} title="Underline"><Baseline /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''} title="Strikethrough"><Strikethrough /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editor.can().chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'is-active' : ''} title="Inline Code"><Code /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHighlight({ color: '#FFF59D' }).run()} className={editor.isActive('highlight', { color: '#FFF59D' }) ? 'is-active' : ''} title="Highlight"><SparklesIcon /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''} title="Link"><LinkIconUI /></Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''} title="Heading 1"><Heading1 /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''} title="Heading 2"><Heading2 /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''} title="Heading 3"><Heading3 /></Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''} title="Bullet List"><List /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''} title="Ordered List"><ListOrdered /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''} title="Code Block"><FileText /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''} title="Blockquote"><MessageSquare /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus /></Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><RotateCcw /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><RotateCw /></Button>
    </div>
  );
};


export function BlogPostGenerator() {
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingGalleryImage, setIsGeneratingGalleryImage] = useState<Record<number, boolean>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<(GenerateBlogPostOutput & { slug?: string }) | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isLoadingPostForEdit, setIsLoadingPostForEdit] = useState(false);

  const searchParams = useSearchParams();
  const editSlug = searchParams.get('editSlug');

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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'AI-generated HTML content will appear here for editing...',
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: true,
        autolink: true,
        validate: href => /^https?:\/\//.test(href),
      }),
      Highlight.configure({ multicolor: false }),
    ],
    content: form.getValues('editableContent'), 
    editable: true,
    onUpdate: ({ editor: tiptapEditor }) => {
      const html = tiptapEditor.getHTML();
      const currentFormValue = form.getValues('editableContent');
      if (html !== currentFormValue) {
        form.setValue('editableContent', html, { shouldValidate: true, shouldDirty: true });
      }
    },
  });

  useEffect(() => {
    if (editor && generatedPost?.content && editor.getHTML() !== generatedPost.content) {
      editor.commands.setContent(generatedPost.content, false); 
    }
  }, [generatedPost?.content, editor]);
  
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);


  const { fields: galleryImageFields, append: appendGalleryImage, remove: removeGalleryImage, update: updateGalleryImage } = useFieldArray({
    control: form.control,
    name: "galleryImages",
  });

  const { fields: downloadFields, append: appendDownload, remove: removeDownload } = useFieldArray({
    control: form.control,
    name: "downloads",
  });

  const watchedFeaturedImageUrl = form.watch("featuredImageUrl"); 
  const watchedGalleryImages = form.watch("galleryImages");


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

  useEffect(() => {
    if (editSlug && editor) {
      const loadPostForEditing = async () => {
        setIsLoadingPostForEdit(true);
        try {
          const response = await fetch(`/api/blog/${editSlug}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch post: ${response.statusText}`);
          }
          const postData: BlogPost = await response.json();

          form.reset({
            topic: postData.title || '', // Use post title for topic when editing
            seoKeywords: postData.resolvedTags?.map(tag => tag.name).join(', ') || '',
            brandVoice: '', // Brand voice is for AI generation, not stored with post
            editableContent: postData.content || '',
            categoryId: postData.categoryId || '',
            tags: postData.resolvedTags?.map(tag => tag.name).join(', ') || '',
            featuredImageUrl: postData.featuredImageUrl || '',
            featuredImageHint: postData.featuredImageHint || '',
            galleryImages: postData.galleryImages || [],
            downloads: postData.downloads || [],
          });
          editor.commands.setContent(postData.content || '');
          setGeneratedPost({
            title: postData.title,
            content: postData.content,
            reasoning: '', // Reasoning is from AI generation, not stored
            slug: postData.slug,
          });
          setPublishedSlug(postData.slug);
          toast({ title: "Post Loaded", description: `"${postData.title}" is ready for editing.` });
        } catch (error: any) {
          console.error("Error loading post for editing:", error);
          toast({ title: "Error Loading Post", description: error.message, variant: "destructive" });
          // Optionally redirect or clear editSlug from URL
        } finally {
          setIsLoadingPostForEdit(false);
        }
      };
      loadPostForEditing();
    }
  }, [editSlug, form, editor, toast]);


  const flattenedCategoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  const onAiSubmit = async (values: Pick<FormValues, 'topic' | 'seoKeywords' | 'brandVoice'>) => {
    setIsLoadingAi(true);
    setGeneratedPost(null);
    form.setValue('editableContent', ''); 
    if (editor) editor.commands.clearContent(); 
    
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
        if (editor) editor.commands.setContent(`<p>Error: ${errorMsg}</p>`);
        else form.setValue('editableContent', `<p>Error: ${errorMsg}</p>`);
        setGeneratedPost(null); 
        throw new Error(errorMsg);
      }

      const slug = createSlug(output.title);
      setGeneratedPost({ ...output, slug }); 
      form.setValue('editableContent', output.content, {shouldValidate: true}); 

      toast({
        title: "Blog Post Content Generated!",
        description: "Review and edit the content in the editor below, add images/downloads, category, tags, and then publish.",
      });
    } catch (error: any) {
      console.error("Error generating blog post content:", error);
      const errorMessage = error.message || "AI failed to generate content.";
      setGeneratedPost(null);
      if (editor) editor.commands.setContent(`<p>Error: ${errorMessage}</p>`);
      else form.setValue('editableContent', `<p>Error: ${errorMessage}</p>`);
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
    
    // Reset states related to a previously loaded/published post
    setPublishedSlug(null); 
    setGeneratedPost(null); // Clear any previously generated/loaded post structure
    form.setValue('editableContent', ''); // Clear editor content
    if (editor) editor.commands.clearContent();
    // Also clear other fields that might have been loaded from an existing post
    form.setValue('featuredImageUrl', '');
    form.setValue('featuredImageHint', '');
    form.setValue('galleryImages', []);
    form.setValue('downloads', []);
    form.setValue('categoryId', '');
    form.setValue('tags', '');


    const values = form.getValues();
    onAiSubmit({
      topic: values.topic,
      seoKeywords: values.seoKeywords,
      brandVoice: values.brandVoice,
    });
  };

  const handleGenerateAiFeaturedImage = async () => {
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
      toast({ title: "AI Featured Image Generated!", description: "Featured image has been populated." });
    } catch (error: any) {
      console.error("Error generating AI image:", error);
      toast({ title: "AI Image Error", description: error.message || "Could not generate image.", variant: "destructive" });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateAiGalleryImage = async (index: number) => {
    const topic = form.getValues("topic");
    const title = generatedPost?.title;
    const basePrompt = title || topic || "gallery image detail";
    const promptForImage = `${basePrompt} - style variation ${index + 1}`;

    setIsGeneratingGalleryImage(prev => ({ ...prev, [index]: true }));
    try {
      const imageResult = await generateImageForPost({ prompt: promptForImage });
      updateGalleryImage(index, {
        url: imageResult.imageDataUri,
        caption: form.getValues(`galleryImages.${index}.caption`) || `AI Generated: ${imageResult.suggestedHint}`,
        hint: imageResult.suggestedHint,
      });
      toast({ title: `AI Gallery Image ${index + 1} Generated!`, description: "Gallery image has been populated." });
    } catch (error: any) {
      console.error(`Error generating AI gallery image ${index}:`, error);
      toast({ title: `AI Gallery Image ${index + 1} Error`, description: error.message || "Could not generate image.", variant: "destructive" });
    } finally {
      setIsGeneratingGalleryImage(prev => ({ ...prev, [index]: false }));
    }
  };


  async function handlePublishPost(values: FormValues) {
    // Use generatedPost.title for the post title if available, otherwise fallback to form's topic
    const postTitleToUse = generatedPost?.title || values.topic;
    
    if (!postTitleToUse) {
         toast({ title: "Error", description: "Post title is missing. Please ensure a topic is set or content has been generated.", variant: "destructive" });
        return;
    }

    // Use publishedSlug if available (editing), otherwise generate new slug from title/topic for a new post
    const slugToUse = publishedSlug || (generatedPost?.slug || createSlug(postTitleToUse));

    if (!slugToUse) {
      toast({ title: "Error", description: "Could not determine slug for publishing.", variant: "destructive" });
      return;
    }

     if (!values.editableContent || values.editableContent.trim() === '' || values.editableContent === '<p></p>') {
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

    const postPayload = {
        title: postTitleToUse,
        content: values.editableContent, 
        slug: slugToUse,
        author: "AI Content Studio", 
        authorAvatar: "https://placehold.co/100x100.png?text=AI", 
        tags: tagsArray,
        featuredImageUrl: values.featuredImageUrl,
        featuredImageHint: values.featuredImageHint,
        galleryImages: values.galleryImages,
        downloads: values.downloads,
        originalLanguage: "en", 
        categoryId: values.categoryId,
    };

    const isUpdateOperation = !!publishedSlug; // If publishedSlug is set, it's an update
    const apiUrl = isUpdateOperation ? `/api/blog/${publishedSlug}` : '/api/blog';
    const method = isUpdateOperation ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isUpdateOperation ? 'update' : 'publish'} post. Status: ${response.status}`);
      }
      const responseData = await response.json();
      
      if (!isUpdateOperation) { 
        setPublishedSlug(responseData.slug);
         if (generatedPost) {
            setGeneratedPost(prev => prev ? {...prev, slug: responseData.slug} : null);
        }
      }
      
      toast({ title: `Post ${isUpdateOperation ? 'Updated' : 'Published'}!`, description: `"${responseData.title}" is now live.` });
    } catch (error: any) {
      console.error(`Error ${isUpdateOperation ? 'updating' : 'publishing'} post:`, error);
      toast({ title: `${isUpdateOperation ? 'Update' : 'Publishing'} Error`, description: error.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  }

  if (isLoadingPostForEdit) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground text-lg">Loading post for editing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handlePublishPost)}>
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                <Wand2 className="h-7 w-7 text-primary" /> AI Content Generation {editSlug ? `(Editing: ${generatedPost?.title || editSlug})` : ''}
              </CardTitle>
              <CardDescription>
                {editSlug ? "Edit the loaded post or " : "Provide initial details for the AI to "}generate blog post content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Blog Post Topic / Title</FormLabel>
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
                    <FormLabel className="text-base">Brand Voice (for AI generation)</FormLabel>
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
                disabled={isLoadingAi || isPublishing || isGeneratingImage || Object.values(isGeneratingGalleryImage).some(s => s) || isLoadingPostForEdit} 
                size="lg" 
                className="w-full md:w-auto bg-primary hover:bg-primary/90"
              >
                {isLoadingAi ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                {editSlug && !isLoadingAi ? 'Regenerate Content (Replaces Edits)' : 'Generate New Blog Content'}
              </Button>
            </CardFooter>
          </Card>

          {(generatedPost || editSlug) && ( 
            <Card className="shadow-lg animate-in fade-in-50 duration-500 mt-8">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
                  <Edit className="h-7 w-7" /> Review & Enhance Content
                </CardTitle>
                <CardDescription>Review the {editSlug ? 'loaded' : 'AI-generated'} content. Edit it below, add images, downloads, category, and tags before publishing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Title:</h3>
                  <p className="text-lg p-3 bg-muted rounded-md">{generatedPost?.title || form.getValues('topic')}</p>
                  <p className="text-xs text-muted-foreground mt-1">Slug for publishing: <code className="bg-muted px-1 rounded">{publishedSlug || generatedPost?.slug || createSlug(form.getValues('topic'))}</code></p>
                </div>
                {generatedPost?.reasoning && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">SEO Keyword Reasoning:</h3>
                    <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">{generatedPost.reasoning}</p>
                  </div>
                )}
                
                <Controller
                  control={form.control}
                  name="editableContent"
                  render={({ field: { name, onBlur, ref: fieldRef }, fieldState: { error } }) => ( 
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Editable Content</FormLabel>
                       <FormControl>
                        <div>
                          {isClient && editor && <TiptapToolbar editor={editor} />}
                          <EditorContent editor={editor} className="ProseMirror-wrapper"/>
                        </div>
                      </FormControl>
                      {error && <FormMessage>{error.message}</FormMessage>}
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
                                onClick={handleGenerateAiFeaturedImage} 
                                disabled={isGeneratingImage || isLoadingAi || isPublishing || Object.values(isGeneratingGalleryImage).some(s => s)}
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
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="flex-grow space-y-3">
                                <FormField control={form.control} name={`galleryImages.${index}.url`} render={({ field }) => (
                                    <FormItem><FormLabel>Image URL</FormLabel><Input placeholder="https://example.com/gallery_image.jpg" {...field} /><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name={`galleryImages.${index}.caption`} render={({ field }) => (
                                    <FormItem><FormLabel>Caption (Optional)</FormLabel><Input placeholder="Image caption" {...field} /><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name={`galleryImages.${index}.hint`} render={({ field }) => (
                                    <FormItem><FormLabel>AI Hint (Optional, max 2 words)</FormLabel><Input placeholder="e.g., mountain landscape" {...field} /><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <div className="flex-shrink-0 space-y-2 sm:w-auto sm:text-right">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleGenerateAiGalleryImage(index)} 
                                    disabled={isGeneratingGalleryImage[index] || isGeneratingImage || isLoadingAi || isPublishing}
                                    className="w-full sm:w-auto"
                                >
                                    {isGeneratingGalleryImage[index] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SparklesIcon className="mr-2 h-4 w-4" />}
                                    Generate AI Image
                                </Button>
                                {watchedGalleryImages?.[index]?.url && (
                                    <div className="mt-2 p-1 border rounded-md bg-muted max-w-[150px] mx-auto sm:mx-0">
                                        <Image src={watchedGalleryImages[index].url} alt={`Gallery image ${index + 1} preview`} width={150} height={100} className="object-cover rounded" data-ai-hint="gallery preview"/>
                                    </div>
                                )}
                            </div>
                        </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeGalleryImage(index)} className="text-destructive hover:text-destructive/90 mt-2"><Trash2 className="mr-1 h-4 w-4"/>Remove Image</Button>
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
                <Button type="submit" disabled={isPublishing || isLoadingAi || isGeneratingImage || Object.values(isGeneratingGalleryImage).some(s => s) || isLoadingPostForEdit} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
                  {isPublishing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                  {publishedSlug ? "Update Post" : "Publish Post"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}

