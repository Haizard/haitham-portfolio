
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { predictSportMatch, type PredictSportMatchInput, type PredictSportMatchOutput } from "@/ai/flows/predict-sport-match-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Brain, Trophy, ShieldAlert, ListChecks, Info, BarChart3, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  sport: z.string().min(3, "Sport name must be at least 3 characters (e.g., Football)."),
  match: z.string().min(5, "Match description must be at least 5 characters (e.g., Team A vs Team B)."),
  competition: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  additionalContext: z.string().min(20, "Please provide substantial additional context (at least 20 characters) covering injuries, form, morale, etc. The more detail, the better the prediction.").max(5000, "Context is too long, please keep it under 5000 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export default function SportsPredictorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictSportMatchOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sport: "",
      match: "",
      competition: "",
      date: new Date().toISOString().split('T')[0], // Default to today
      location: "",
      additionalContext: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await predictSportMatch(values as PredictSportMatchInput);
      setResult(output);
      toast({
        title: "Match Prediction Generated!",
        description: "AI has analyzed the match based on your input.",
      });
    } catch (error: any) {
      console.error("Error generating prediction:", error);
      toast({
        title: "Prediction Error",
        description: error.message || "Failed to generate prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Target className="mr-3 h-10 w-10 text-primary" />
          AI Sports Prediction Agent
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Leverage advanced AI analysis to predict sports match outcomes. Provide detailed context for best results.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="shadow-xl lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline">
              <Info className="h-6 w-6 text-primary" />
              Match Details
            </CardTitle>
            <CardDescription>
              Enter the information for the match you want to predict.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="sport" render={({ field }) => (
                  <FormItem><FormLabel>Sport</FormLabel><Input placeholder="e.g., Football, Basketball" {...field} /><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="match" render={({ field }) => (
                  <FormItem><FormLabel>Match</FormLabel><Input placeholder="e.g., Liverpool vs Chelsea" {...field} /><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="competition" render={({ field }) => (
                  <FormItem><FormLabel>Competition (Optional)</FormLabel><Input placeholder="e.g., Premier League" {...field} /><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Date (Optional)</FormLabel><Input type="date" {...field} /><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location (Optional)</FormLabel><Input placeholder="e.g., Anfield, Liverpool" {...field} /><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="additionalContext" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Context</FormLabel>
                    <Textarea
                      placeholder="Crucial details: Team form (last 5 games), key player injuries/suspensions, team morale, recent news, head-to-head stats, tactical considerations, weather forecast, etc."
                      className="min-h-[150px] text-sm"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}/>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg" className="w-full bg-primary hover:bg-primary/90">
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing...</>
                  ) : (
                    <><Brain className="mr-2 h-5 w-5" />Predict Outcome</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && !result && (
          <Card className="shadow-lg lg:col-span-2 animate-pulse">
            <CardHeader><CardTitle className="text-xl font-headline text-primary">Generating Prediction...</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6 text-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto my-8" />
              <p className="text-muted-foreground">The AI is processing over 50 analytical layers. This might take a moment...</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="shadow-lg lg:col-span-2 animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">AI Prediction Analysis</CardTitle>
              <CardDescription>Match: {form.getValues('match')} ({form.getValues('sport')})</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <Card className="bg-secondary/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><Trophy className="h-5 w-5 text-accent"/>Predicted Winner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{result.predictedWinner}</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-accent"/>Likely Score / Range</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold">{result.likelyScoreOrRange}</p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-md font-semibold mb-1 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-accent"/>Confidence Score: <span className="text-primary font-bold text-lg">{result.confidenceScore}%</span>
                </h3>
                <Progress value={result.confidenceScore} className="h-3 [&>div]:bg-primary" />
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><ListChecks className="h-5 w-5 text-accent"/>Key Reasons ({result.keyReasons.length})</h3>
                <ScrollArea className="h-[200px] border rounded-md p-3 bg-muted/30">
                  <ul className="space-y-2 text-sm list-disc list-inside">
                    {result.keyReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
              
              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Brain className="h-5 w-5 text-accent"/>Strategic Coaching Mindset</h3>
                <p className="text-sm p-3 bg-muted/30 rounded-md whitespace-pre-line">{result.strategicCoachingMindset}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Psychological Edge</h3>
                <p className="text-sm p-3 bg-muted/30 rounded-md whitespace-pre-line">{result.psychologicalEdge}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Possible Shock Factors</h3>
                 <div className="flex flex-wrap gap-2">
                    {result.possibleShockFactors.map((factor, index) => (
                      <Badge key={index} variant="outline" className="text-sm border-destructive/50 text-destructive-foreground bg-destructive/10">{factor}</Badge>
                    ))}
                  </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Tactical Summary</h3>
                <p className="text-sm p-3 bg-muted/30 rounded-md whitespace-pre-line">{result.tacticalSummary}</p>
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

    