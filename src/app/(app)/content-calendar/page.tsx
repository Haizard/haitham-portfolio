import { TopicSuggester } from "@/components/content-calendar/topic-suggester";

export default function ContentCalendarPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">AI Content Calendar</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Plan your content with intelligent topic suggestions and scheduling.
        </p>
      </header>
      <TopicSuggester />
    </div>
  );
}
