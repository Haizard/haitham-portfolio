import { PostGeneratorForm } from "@/components/social-post-generator/post-generator-form";

export default function SocialPostGeneratorPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">AI Social Post Generator</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Create unique posts for multiple platforms from a single idea.
        </p>
      </header>
      <PostGeneratorForm />
    </div>
  );
}
