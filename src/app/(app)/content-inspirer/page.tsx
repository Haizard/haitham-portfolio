
import { InspirerForm } from "@/components/content-inspirer/inspirer-form";
import { Lightbulb } from "lucide-react";

export default function ContentInspirerPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Lightbulb className="mr-3 h-10 w-10 text-primary" />
          AI Content Inspirer
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Get inspiration and outlines for new content based on existing articles.
        </p>
      </header>
      <InspirerForm />
    </div>
  );
}
