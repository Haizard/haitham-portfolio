
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateSocialPost, type GenerateSocialPostInput, type GenerateSocialPostOutput } from "@/ai/flows/generate-social-post";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const socialPlatforms = ["Facebook", "Twitter", "Instagram", "LinkedIn", "TikTok"] as const;
type SocialPlatform = (typeof socialPlatforms)[number];

const formSchema = z.object({
  contentIdea: z.string().min(10, "Content idea must be at least 10 characters."),
  platforms: z.array(z.enum(socialPlatforms)).min(1, "Select at least one platform."),
});

export function PostGeneratorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateSocialPostOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentIdea: "",
      platforms: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await generateSocialPost(values as GenerateSocialPostInput);
      setResult(output);
      toast({
        title: "Social Posts Generated!",
        description: "AI has drafted posts for your selected platforms.",
      });
    } catch (error) {
      console.error("Error generating social posts:", error);
      toast({
        title: "Error",
        description: "Failed to generate social posts. Please try again.",
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
            <Share2 className="h-7 w-7 text-primary" />
            AI Social Post Generator
          </CardTitle>
          <CardDescription>
            Turn one idea into multiple unique posts, tailored for different social media platforms.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="contentIdea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Core Content Idea</FormLabel>
                    <Textarea
                      placeholder="e.g., My new productivity hack for working from home..."
                      className="min-h-[120px] text-base p-3"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platforms"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Target Platforms</FormLabel>
                      <FormDescription>
                        Select the social media platforms you want to generate posts for.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {socialPlatforms.map((platform) => (
                      <FormField
                        key={platform}
                        control={form.control}
                        name="platforms"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={platform}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(platform)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), platform])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== platform
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm cursor-pointer">
                                {platform}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    </div>
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
                    <Share2 className="mr-2 h-5 w-5" />
                    Generate Posts
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {result && result.posts && result.posts.length > 0 && (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Generated Social Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={result.posts[0].platform} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                {result.posts.map((p) => (
                  <TabsTrigger key={p.platform} value={p.platform}>{p.platform}</TabsTrigger>
                ))}
              </TabsList>
              {result.posts.map((p) => (
                <TabsContent key={p.platform} value={p.platform}>
                  <Card className="mt-2">
                    <CardHeader>
                      <CardTitle className="text-lg">{p.platform} Post</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px] border rounded-md p-3 bg-secondary/30">
                        <p className="text-sm whitespace-pre-wrap font-body">{p.post}</p>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
