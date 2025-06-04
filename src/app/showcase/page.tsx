import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const mockShowcaseItems = [
  {
    id: 1,
    title: "E-commerce Platform Redesign",
    description: "A complete visual and UX overhaul for a leading online retailer, focusing on mobile-first experience and conversion rate optimization.",
    imageUrl: "https://placehold.co/600x400.png",
    tags: ["UI/UX", "Web Design", "E-commerce"],
    liveLink: "#",
    sourceLink: "#",
    imageHint: "website design"
  },
  {
    id: 2,
    title: "Mobile App for Fitness Tracking",
    description: "Developed a native mobile application for iOS and Android that helps users track their fitness goals, workouts, and nutrition.",
    imageUrl: "https://placehold.co/600x400.png",
    tags: ["Mobile App", "Fitness", "React Native"],
    liveLink: "#",
    sourceLink: "#",
    imageHint: "mobile app"
  },
  {
    id: 3,
    title: "AI-Powered Content Suggestion Tool",
    description: "Built a web application using Genkit to provide intelligent content suggestions for bloggers and marketers based on trends and audience analysis.",
    imageUrl: "https://placehold.co/600x400.png",
    tags: ["AI", "Web App", "Genkit"],
    liveLink: "#",
    sourceLink: "#",
    imageHint: "AI interface"
  },
];

export default function ShowcasePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline mb-4">
          Creator Showcase
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover a collection of amazing projects and services offered by our talented creators.
        </p>
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockShowcaseItems.map((item) => (
          <Card key={item.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col overflow-hidden">
            <div className="aspect-[3/2] overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={600}
                height={400}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={item.imageHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">{item.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.tags.map(tag => (
                  <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between items-center">
              <Button variant="outline" size="sm" asChild>
                <Link href={item.liveLink} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-2 h-4 w-4" /> View Live
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={item.sourceLink} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" /> Source
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      <footer className="text-center mt-16 py-8 border-t">
        <p className="text-muted-foreground">
          Interested in showcasing your work? <Link href="/" className="text-primary hover:underline">Join CreatorOS today!</Link>
        </p>
      </footer>
    </div>
  );
}
