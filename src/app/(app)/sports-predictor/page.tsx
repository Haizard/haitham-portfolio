
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { predictSportMatch, type PredictSportMatchInput, type PredictSportMatchOutput } from "@/ai/flows/predict-sport-match-flow";
import { getUpcomingMatches, type GetUpcomingMatchesInput, type GetUpcomingMatchesOutput } from "@/ai/flows/get-upcoming-matches-flow";
import type { UpcomingMatch } from "@/lib/sports-data-mock";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Brain, Trophy, ShieldAlert, ListChecks, Info, BarChart3, Target, CalendarDays, MapPin, Search, Filter as FilterIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const predictionFormSchema = z.object({
  sport: z.string().min(1, "Internal: Sport must be pre-filled."),
  match: z.string().min(1, "Internal: Match description must be pre-filled."),
  competition: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  additionalContext: z.string().min(20, "Please provide substantial context (min 20 characters) like injuries, form, morale, etc.").max(5000, "Context is too long (max 5000 chars)."),
});
type PredictionFormValues = z.infer<typeof predictionFormSchema>;

const availableSports = ["Football", "Basketball", "Tennis", "Rugby"]; // Could be fetched dynamically

export default function SportsPredictorPage() {
  const [currentStep, setCurrentStep] = useState<"selectSport" | "selectMatch" | "predict">("selectSport");
  
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [leagueFilter, setLeagueFilter] = useState<string>("");

  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [selectedMatchForPrediction, setSelectedMatchForPrediction] = useState<UpcomingMatch | null>(null);
  
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictSportMatchOutput | null>(null);
  const { toast } = useToast();

  const predictionForm = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      sport: "",
      match: "",
      additionalContext: "",
    },
  });

  const fetchMatchesForSport = useCallback(async (sport: string, country?: string, league?: string) => {
    if (!sport) return;
    setIsLoadingMatches(true);
    setUpcomingMatches([]);
    try {
      const filters: GetUpcomingMatchesInput = { sport };
      if (country && country.trim() !== "") filters.country = country;
      if (league && league.trim() !== "") filters.league = league;
      
      const matchesOutput = await getUpcomingMatches(filters);
      setUpcomingMatches(matchesOutput);
      if (matchesOutput.length === 0) {
        toast({ title: "No Matches Found", description: "Try adjusting your filters or sport selection.", variant: "default" });
      }
    } catch (error: any) {
      toast({ title: "Error Fetching Matches", description: error.message || "Could not load upcoming matches.", variant: "destructive" });
    } finally {
      setIsLoadingMatches(false);
    }
  }, [toast]);

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
    setCountryFilter(""); // Reset filters when sport changes
    setLeagueFilter("");
    setSelectedMatchForPrediction(null); // Reset selected match
    setPredictionResult(null); // Clear previous prediction
    predictionForm.reset(); // Clear prediction form
    setCurrentStep("selectMatch");
    fetchMatchesForSport(sport);
  };

  const handleFilterChange = () => {
    if (selectedSport) {
        fetchMatchesForSport(selectedSport, countryFilter, leagueFilter);
    }
  };

  const handleMatchSelectForPrediction = (match: UpcomingMatch) => {
    setSelectedMatchForPrediction(match);
    predictionForm.reset({
      sport: match.sport,
      match: match.description,
      competition: match.competition,
      date: new Date(match.date).toISOString().split('T')[0],
      location: match.location || "",
      additionalContext: "", // User needs to fill this
    });
    setPredictionResult(null); // Clear previous prediction result
    setCurrentStep("predict");
    // Scroll to the prediction form for better UX
    document.getElementById('prediction-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  async function onPredictionSubmit(values: PredictionFormValues) {
    setIsLoadingPrediction(true);
    setPredictionResult(null);
    if (!selectedMatchForPrediction) {
      toast({ title: "Error", description: "No match selected for prediction.", variant: "destructive" });
      setIsLoadingPrediction(false);
      return;
    }
    try {
      const predictionInput: PredictSportMatchInput = {
        sport: selectedMatchForPrediction.sport,
        match: selectedMatchForPrediction.description,
        competition: selectedMatchForPrediction.competition,
        date: new Date(selectedMatchForPrediction.date).toISOString().split('T')[0],
        location: selectedMatchForPrediction.location,
        additionalContext: values.additionalContext,
      };
      const output = await predictSportMatch(predictionInput);
      setPredictionResult(output);
      toast({ title: "Prediction Generated!", description: "AI has analyzed the match." });
    } catch (error: any) {
      toast({ title: "Prediction Error", description: error.message || "Failed to generate prediction.", variant: "destructive" });
    } finally {
      setIsLoadingPrediction(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Target className="mr-3 h-10 w-10 text-primary" /> AI Sports Prediction Agent
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Select a sport, filter upcoming matches, and get AI-powered predictions.
        </p>
      </header>

      {/* Step 1: Sport Selection */}
      <Card className="shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline"><Search className="h-6 w-6 text-primary" />Step 1: Select Sport</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleSportSelect} value={selectedSport}>
            <SelectTrigger className="w-full md:w-[300px] text-base p-3">
              <SelectValue placeholder="Choose a sport..." />
            </SelectTrigger>
            <SelectContent>
              {availableSports.map(sport => (
                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Step 2: Filter & Match Listing */}
      {currentStep !== "selectSport" && selectedSport && (
        <Card className="shadow-xl mb-8 animate-in fade-in-50 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline"><FilterIcon className="h-6 w-6 text-primary" />Step 2: Find & Select Match for <span className="text-accent">{selectedSport}</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
              <div>
                <Label htmlFor="countryFilter">Filter by Country</Label>
                <Input id="countryFilter" placeholder="e.g., England, USA" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="leagueFilter">Filter by League</Label>
                <Input id="leagueFilter" placeholder="e.g., Premier League, NBA" value={leagueFilter} onChange={(e) => setLeagueFilter(e.target.value)} className="mt-1"/>
              </div>
              <Button onClick={handleFilterChange} disabled={isLoadingMatches} className="w-full md:w-auto bg-primary hover:bg-primary/90">
                {isLoadingMatches ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
                Apply Filters
              </Button>
            </div>

            {isLoadingMatches ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
            ) : upcomingMatches.length > 0 ? (
              <ScrollArea className="h-[400px] border rounded-md p-1">
                <div className="space-y-3 p-3">
                {upcomingMatches.map(match => (
                  <Card key={match.id} className="p-4 shadow-md hover:shadow-lg transition-shadow bg-secondary/30">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h4 className="font-semibold text-md">{match.description}</h4>
                            <p className="text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>{match.competition} {match.league ? `(${match.league})` : ''} {match.country ? `- ${match.country}` : ''}</span>
                                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3"/>{new Date(match.date).toLocaleDateString()} {match.time ? `at ${match.time}` : ''}</span>
                            </p>
                        </div>
                        <Button size="sm" onClick={() => handleMatchSelectForPrediction(match)} className="mt-3 sm:mt-0 bg-accent text-accent-foreground hover:bg-accent/90">Select for Prediction</Button>
                    </div>
                  </Card>
                ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground py-6">No upcoming matches found for the selected sport and filters. Try broadening your search.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Prediction Form and Result */}
      {currentStep === "predict" && selectedMatchForPrediction && (
        <div id="prediction-form-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
          <Card className="shadow-xl lg:col-span-1 animate-in fade-in-50 duration-300">
            <Form {...predictionForm}>
              <form onSubmit={predictionForm.handleSubmit(onPredictionSubmit)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-headline"><Info className="h-6 w-6 text-primary" />Match Details for Prediction</CardTitle>
                  <CardDescription>Review details and provide context for: <strong className="text-accent">{selectedMatchForPrediction.description}</strong>.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={predictionForm.control} name="sport" render={({ field }) => (
                    <FormItem><FormLabel>Sport</FormLabel><Input {...field} readOnly className="bg-muted/50" /><FormMessage /></FormItem>
                  )}/>
                  <FormField control={predictionForm.control} name="match" render={({ field }) => (
                    <FormItem><FormLabel>Match</FormLabel><Input {...field} readOnly className="bg-muted/50" /><FormMessage /></FormItem>
                  )}/>
                   <FormField control={predictionForm.control} name="competition" render={({ field }) => (
                    <FormItem><FormLabel>Competition</FormLabel><Input {...field} readOnly className="bg-muted/50" /><FormMessage /></FormItem>
                  )}/>
                   <FormField control={predictionForm.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Date</FormLabel><Input {...field} type="date" readOnly className="bg-muted/50" /><FormMessage /></FormItem>
                  )}/>
                   <FormField control={predictionForm.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><Input {...field} readOnly className="bg-muted/50" /><FormMessage /></FormItem>
                  )}/>
                  <FormField control={predictionForm.control} name="additionalContext" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Context (Crucial!)</FormLabel>
                      <Textarea placeholder="Team form, injuries, morale, H2H stats, weather, etc." className="min-h-[150px] text-sm" {...field}/>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoadingPrediction} size="lg" className="w-full bg-primary hover:bg-primary/90">
                    {isLoadingPrediction ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing...</> : <><Brain className="mr-2 h-5 w-5" />Predict Outcome</>}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {isLoadingPrediction && !predictionResult && (
            <Card className="shadow-lg lg:col-span-2 animate-pulse">
              <CardHeader><CardTitle className="text-xl font-headline text-primary">Generating Prediction...</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-6 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto my-8" />
                <p className="text-muted-foreground">AI processing... this might take a moment.</p>
              </CardContent>
            </Card>
          )}

          {predictionResult && (
            <Card className="shadow-lg lg:col-span-2 animate-in fade-in-50 duration-500">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary">AI Prediction Analysis</CardTitle>
                <CardDescription>Match: {selectedMatchForPrediction?.description} ({selectedMatchForPrediction?.sport})</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <Card className="bg-secondary/50"><CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Trophy className="h-5 w-5 text-accent"/>Predicted Winner</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">{predictionResult.predictedWinner}</p></CardContent></Card>
                  <Card className="bg-secondary/50"><CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-accent"/>Likely Score / Range</CardTitle></CardHeader><CardContent><p className="text-xl font-semibold">{predictionResult.likelyScoreOrRange}</p></CardContent></Card>
                </div>
                <div><h3 className="text-md font-semibold mb-1 flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-accent"/>Confidence: <span className="text-primary font-bold text-lg">{predictionResult.confidenceScore}%</span></h3><Progress value={predictionResult.confidenceScore} className="h-3 [&>div]:bg-primary" /></div>
                <Separator />
                <div><h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><ListChecks className="h-5 w-5 text-accent"/>Key Reasons ({predictionResult.keyReasons.length})</h3><ScrollArea className="h-[200px] border rounded-md p-3 bg-muted/30"><ul className="space-y-2 text-sm list-disc list-inside">{predictionResult.keyReasons.map((r, i) => <li key={i}>{r}</li>)}</ul></ScrollArea></div>
                <Separator />
                <div><h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Brain className="h-5 w-5 text-accent"/>Strategic Coaching Mindset</h3><p className="text-sm p-3 bg-muted/30 rounded-md whitespace-pre-line">{predictionResult.strategicCoachingMindset}</p></div>
                <div><h3 className="text-lg font-semibold mb-2">Psychological Edge</h3><p className="text-sm p-3 bg-muted/30 rounded-md whitespace-pre-line">{predictionResult.psychologicalEdge}</p></div>
                <div><h3 className="text-lg font-semibold mb-2">Possible Shock Factors</h3><div className="flex flex-wrap gap-2">{predictionResult.possibleShockFactors.map((f, i) => <Badge key={i} variant="outline" className="text-sm border-destructive/50 text-destructive-foreground bg-destructive/10">{f}</Badge>)}</div></div>
                <div><h3 className="text-lg font-semibold mb-2">Tactical Summary</h3><p className="text-sm p-3 bg-muted/30 rounded-md whitespace-pre-line">{predictionResult.tacticalSummary}</p></div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
