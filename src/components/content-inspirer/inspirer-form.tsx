
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateInspiredContent, type GenerateInspiredContentInput, type GenerateInspiredContentOutput } from "@/ai/flows/generate-inspired-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Lightbulb, PlusCircle, Trash2, Zap, ListOrdered } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  articleUrls: z.array(z.object({ value: z.string().url("Please enter a valid URL.") })).min(1, "Add at least one article URL."),
  targetTopic: z.string().optional(),
  analysisMode: z.enum(['brainstormIdeas', 'synthesizeOutline'], {
    required_error: "You need to select an analysis mode.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function InspirerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateInspiredContentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      articleUrls: [{ value: "" }],
      targetTopic: "",
      analysisMode: "brainstormIdeas",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "articleUrls",
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const GptInput: GenerateInspiredContentInput = {
        articleUrls: values.articleUrls.map(urlObj => urlObj.value),
        targetTopic: values.targetTopic,
        analysisMode: values.analysisMode,
      }
      const output = await generateInspiredContent(GptInput);
      setResult(output);
      toast({
        title: "Inspiration Generated!",
        description: `AI has ${values.analysisMode === 'brainstormIdeas' ? 'brainstormed ideas' : 'synthesized an outline'}.`,
      });
    } catch (error: any) {
      console.error("Error generating inspired content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="text-xl font-headline">Inspiration Input</CardTitle>
              <CardDescription>
                Provide URLs of existing articles and let AI help you brainstorm or outline new content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <FormLabel className="text-base mb-2 block">Inspirational Article URLs</FormLabel>
                {fields.map((field, index) => (
                  <FormField
                    control={form.control}
                    key={field.id}
                    name={`articleUrls.${index}.value`}
                    render={({ field: rhfField }) => (
                      <FormItem className="flex items-center gap-2 mb-2">
                        <FormControl>
                          <Input placeholder="https://example.com/article" {...rhfField} className="text-base p-3 flex-grow" />
                        </FormControl>
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive/90">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "" })}
                  className="mt-1"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add URL
                </Button>
              </div>

              <FormField
                control={form.control}
                name="targetTopic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Your Target Topic/Angle (Optional)</FormLabel>
                    <Input placeholder="e.g., Impact of AI on small businesses" {...field} className="text-base p-3" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="analysisMode"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Analysis Mode</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:shadow-sm has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="brainstormIdeas" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500"/> Brainstorm New Ideas
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:shadow-sm has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="synthesizeOutline" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center gap-2">
                           <ListOrdered className="h-5 w-5 text-blue-500"/> Synthesize Article Outline
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
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
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Get Inspired
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {result && (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">
              {result.analysisMode === 'brainstormIdeas' ? "Brainstormed Ideas" : "Synthesized Outline"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.analysisMode === 'brainstormIdeas' && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center"><Zap className="mr-2 h-5 w-5 text-yellow-500"/>Suggested Topics/Titles:</h3>
                  <ScrollArea className="h-[200px] border rounded-md p-4 bg-secondary/30">
                    <ul className="space-y-2 list-disc list-inside">
                      {result.suggestedTopics.map((topic, index) => (
                        <li key={index} className="text-sm">{topic}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Introduction Hook Example:</h3>
                  <p className="text-sm p-3 bg-muted rounded-md italic">"{result.introductionHook}"</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Key Themes Identified:</h3>
                   <div className="flex flex-wrap gap-2">
                    {result.keyThemes.map((theme, index) => (
                      <span key={index} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">{theme}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
            {result.analysisMode === 'synthesizeOutline' && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Draft Title:</h3>
                  <p className="text-md p-3 bg-muted rounded-md font-medium">{result.draftTitle}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center"><ListOrdered className="mr-2 h-5 w-5 text-blue-500"/>Draft Outline:</h3>
                  <ScrollArea className="h-[300px] border rounded-md p-4 bg-secondary/30 prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-body">{result.draftOutline}</pre>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Key Talking Points:</h3>
                  <ScrollArea className="h-[150px] border rounded-md p-4 bg-muted/50">
                    <ul className="space-y-2 list-disc list-inside">
                      {result.keyTalkingPoints.map((point, index) => (
                        <li key={index} className="text-sm">{point}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
                 <div>
                  <h3 className="text-lg font-semibold mb-1">Originality Statement:</h3>
                  <p className="text-sm p-3 bg-muted rounded-md italic">{result.originalityStatement}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

