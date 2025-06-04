import { BlogPostGenerator } from "@/components/content-studio/blog-post-generator";

export default function ContentStudioPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">AI Content Studio</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Craft compelling content with the power of AI.
        </p>
      </header>
      <BlogPostGenerator />
    </div>
  );
}
