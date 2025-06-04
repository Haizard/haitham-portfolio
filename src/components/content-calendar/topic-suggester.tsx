"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { suggestContentTopics, type SuggestContentTopicsInput, type SuggestContentTopicsOutput } from "@/ai/flows/suggest-content-topics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  niche: z.string().min(3, "Niche must be at least 3 characters."),
  audienceAnalysis: z.string().min(10, "Audience analysis must be at least 10 characters."),
  trendingTopics: z.string().min(5, "Trending topics must be at least 5 characters."),
});

export function TopicSuggester() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestContentTopicsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      niche: "",
      audienceAnalysis: "",
      trendingTopics: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await suggestContentTopics(values as SuggestContentTopicsInput);
      setResult(output);
      toast({
        title: "Topics Suggested!",
        description: "AI has generated content topic ideas for you.",
      });
    } catch (error) {
      console.error("Error suggesting topics:", error);
      toast({
        title: "Error",
        description: "Failed to suggest topics. Please try again.",
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
            <Lightbulb className="h-7 w-7 text-primary" />
            AI Topic Suggester
          </CardTitle>
          <CardDescription>
            Get AI-powered content topic suggestions based on your niche, audience, and current trends.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="niche"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Your Niche</FormLabel>
                    <Input placeholder="e.g., Sustainable Fashion, Tech Gadgets, Home Cooking" {...field} className="text-base p-3" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="audienceAnalysis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Audience Analysis</FormLabel>
                    <Textarea
                      placeholder="Describe your target audience: their interests, demographics, pain points, etc."
                      className="min-h-[100px] text-base p-3"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trendingTopics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Current Trending Topics (in your niche)</FormLabel>
                    <Textarea
                      placeholder="List some current trends or popular discussions relevant to your niche."
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
                    Suggesting...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Suggest Topics
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {result && result.topicSuggestions && result.topicSuggestions.length > 0 && (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Suggested Content Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <ul className="space-y-3">
                {result.topicSuggestions.map((topic, index) => (
                  <li key={index} className="p-3 bg-secondary/50 rounded-md text-sm">
                    {topic}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
