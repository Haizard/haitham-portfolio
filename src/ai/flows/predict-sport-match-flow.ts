
'use server';
/**
 * @fileOverview A sports match prediction AI agent that uses tools to gather context.
 *
 * - predictSportMatch - A function that handles the sports match prediction process.
 * - PredictSportMatchInput - The input type for the predictSportMatch function.
 * - PredictSportMatchOutput - The return type for the predictSportMatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  getMockTeamForm, type TeamForm,
  getMockHeadToHeadStats, type HeadToHeadStats,
  getMockPlayerAvailability, type PlayerAvailability,
  getMockMatchOdds, type MatchOdds // Added for odds
} from '@/lib/sports-match-context-provider-mock';

// Tool Schemas
const TeamInputSchema = z.object({
  teamName: z.string().describe("The name of the team."),
  sport: z.string().describe("The sport (e.g., Football, Basketball)."),
});

const H2HInputSchema = z.object({
  teamAName: z.string().describe("The name of the first team."),
  teamBName: z.string().describe("The name of the second team."),
  sport: z.string().describe("The sport (e.g., Football, Basketball)."),
});

const MatchOddsInputSchema = z.object({
  teamAName: z.string().describe("The name of the first team (often home team for API queries)."),
  teamBName: z.string().describe("The name of the second team (often away team for API queries)."),
  sport: z.string().describe("The sport (e.g., Football, Basketball). Helps in selecting the correct odds market/API sport key."),
  competition: z.string().optional().describe("The competition or league, can help refine odds lookup."),
});

// Genkit Tools (using mock data providers)
const getTeamFormTool = ai.defineTool(
  {
    name: 'getTeamForm',
    description: 'Fetches the recent form (last 5 matches) for a specific team.',
    inputSchema: TeamInputSchema,
    outputSchema: z.custom<TeamForm>(), 
  },
  async ({ teamName, sport }) => {
    console.log(`[Tool Call] getTeamForm for ${teamName} (${sport})`);
    return getMockTeamForm(teamName, sport);
  }
);

const getHeadToHeadStatsTool = ai.defineTool(
  {
    name: 'getHeadToHeadStats',
    description: 'Fetches the head-to-head statistics between two teams.',
    inputSchema: H2HInputSchema,
    outputSchema: z.custom<HeadToHeadStats>(),
  },
  async ({ teamAName, teamBName, sport }) => {
     console.log(`[Tool Call] getHeadToHeadStats for ${teamAName} vs ${teamBName} (${sport})`);
    return getMockHeadToHeadStats(teamAName, teamBName, sport);
  }
);

const getPlayerAvailabilityTool = ai.defineTool(
  {
    name: 'getPlayerAvailability',
    description: 'Fetches player availability (injuries, suspensions) for a team.',
    inputSchema: TeamInputSchema,
    outputSchema: z.custom<PlayerAvailability>(),
  },
  async ({ teamName, sport }) => {
    console.log(`[Tool Call] getPlayerAvailability for ${teamName} (${sport})`);
    return getMockPlayerAvailability(teamName, sport);
  }
);

const getMatchOddsTool = ai.defineTool(
  {
    name: 'getMatchOdds',
    description: 'Fetches current betting odds for the match from various bookmakers.',
    inputSchema: MatchOddsInputSchema,
    outputSchema: z.custom<MatchOdds>(),
  },
  async ({ teamAName, teamBName, sport, competition }) => {
    console.log(`[Tool Call] getMatchOdds for ${teamAName} vs ${teamBName} (${sport}, ${competition || 'any'})`);
    return getMockMatchOdds(teamAName, teamBName, sport, competition);
  }
);


// Main Flow Schemas
const PredictSportMatchInputSchema = z.object({
  sport: z.string().describe('The type of sport (e.g., football, basketball, rugby, tennis).'),
  teamA: z.string().describe('The name of Team A.'),
  teamB: z.string().describe('The name of Team B.'),
  matchDescription: z.string().describe('Full match description (e.g., Liverpool vs Chelsea).'),
  competition: z.string().optional().describe('The name of the competition or league (e.g., English Premier League, NBA Playoffs).'),
  date: z.string().optional().describe('The date of the match (e.g., YYYY-MM-DD).'),
  location: z.string().optional().describe('The venue or location of the match (e.g., Anfield, Liverpool).'),
  additionalContext: z.string().optional().describe('Optional: Any crucial real-time information or specific insights the user wants to add that tools might not cover (e.g., very recent dressing room news, specific tactical observations from a niche source).'),
});
export type PredictSportMatchInput = z.infer<typeof PredictSportMatchInputSchema>;

const PredictSportMatchOutputSchema = z.object({
  predictedWinner: z.string().describe('The predicted winner of the match (Team Name or "Draw").'),
  likelyScoreOrRange: z.string().describe('The likely score (e.g., 2-1) or a score range (e.g., 1-0 to 2-0, or 2-2 / 3-3 for a high-scoring draw).'),
  confidenceScore: z.number().min(0).max(100).describe('A percentage indicating the confidence in the prediction (0-100%).'),
  keyReasons: z.array(z.string()).min(6).describe('At least 6 key reasons supporting the prediction, drawing from analytical factors and tool outputs.'),
  strategicCoachingMindset: z.string().describe('An analysis of how each coach might approach the match tactically, including potential strategies and adjustments.'),
  psychologicalEdge: z.string().describe('Which team/player(s) might have the psychological advantage and a brief explanation why (e.g., recent form, rivalry history, pressure).'),
  possibleShockFactors: z.array(z.string()).describe('Potential unexpected elements or upsets that could influence the match outcome (e.g., surprise lineup, early red card, underdog resilience).'),
  tacticalSummary: z.string().describe('A summary of the predicted tactical approaches, including likely formations or dominant playing styles for each team.'),
  dataUsedFromTools: z.array(z.object({toolName: z.string(), summary: z.string()})).optional().describe("Summary of data points obtained from tools that influenced the prediction."),
});
export type PredictSportMatchOutput = z.infer<typeof PredictSportMatchOutputSchema>;

export async function predictSportMatch(input: PredictSportMatchInput): Promise<PredictSportMatchOutput> {
  return predictSportMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictSportMatchPrompt',
  input: {schema: PredictSportMatchInputSchema},
  output: {schema: PredictSportMatchOutputSchema},
  tools: [getTeamFormTool, getHeadToHeadStatsTool, getPlayerAvailabilityTool, getMatchOddsTool], // Added getMatchOddsTool
  prompt: `You are a world-class Sports Prediction Agent. Your goal is to predict the outcome of a given sports match by:
1.  Using the available tools to gather essential context (team form, H2H stats, player availability, current betting odds).
2.  Considering the user-provided 'additionalContext' for supplementary insights.
3.  Applying deep analytical reasoning based on over 50 tactical and strategic factors.
4.  Outputting a comprehensive prediction in the specified JSON format.

Match Details to Analyze:
- Sport: {{{sport}}}
- Match: {{{matchDescription}}} (Team A: {{{teamA}}}, Team B: {{{teamB}}})
{{#if competition}}- Competition: {{{competition}}}{{/if}}
{{#if date}}- Date: {{{date}}}{{/if}}
{{#if location}}- Location: {{{location}}}{{/if}}
{{#if additionalContext}}- User-Provided Context: {{{additionalContext}}}{{/if}}

INSTRUCTIONS:
1.  **Tool Usage (Crucial):**
    *   For Team A ('{{{teamA}}}') and TeamB ('{{{teamB}}}'), use the 'getTeamForm' tool to understand their recent performance.
    *   Use the 'getHeadToHeadStats' tool for '{{{teamA}}}' vs '{{{teamB}}}'.
    *   Use the 'getPlayerAvailability' tool for both '{{{teamA}}}' and '{{{teamB}}}' to check for injuries/suspensions.
    *   If relevant for the sport and available, use the 'getMatchOdds' tool to understand current betting market sentiment. This can provide insights into public perception and potential market anomalies.
    *   Synthesize the information obtained from these tools along with any 'User-Provided Context'.
2.  **Analytical Layers:** After gathering data with tools, consider the following (among others from your knowledge base of 50+ factors) to inform your prediction:
    Home vs Away dynamics, Tactical formations, Weather (if known from context), Style clash, Bench depth, Match pressure, Team morale (if deducible from context or tool hints), Key player dependencies, Market odds (if available and how they compare to your analytical assessment).
3.  **Output Generation:** Populate ALL fields in the 'PredictSportMatchOutputSchema' JSON structure.
    *   For 'keyReasons', provide at least 6 distinct, detailed reasons. Explicitly mention if a tool's output (like odds, form, H2H) strongly influenced a reason. For example, if odds are heavily skewed but your analysis differs, note this discrepancy.
    *   For 'dataUsedFromTools', briefly summarize key data points you obtained from using the tools (e.g., "Team A form: 3W, 1D, 1L", "H2H: Team B leads 3-2 in last 5", "Odds: Team A Win @1.85, Draw @3.50, Team B Win @4.00"). This field is for transparency.

Prioritize objective analysis. If tool data is sparse or says "mocked", acknowledge this limitation if it significantly impacts confidence, but still attempt a prediction based on general knowledge and the provided details.
The output will be used for real-world forecasting. Ensure accuracy and comprehensiveness.
`,
});

const predictSportMatchFlow = ai.defineFlow(
  {
    name: 'predictSportMatchFlow',
    inputSchema: PredictSportMatchInputSchema,
    outputSchema: PredictSportMatchOutputSchema,
  },
  async (input: PredictSportMatchInput) => {
    console.log("[predictSportMatchFlow] Input received:", input);
    const llmResponse = await prompt(input); 
    const output = llmResponse.output; 

    if (!output) {
      console.error("AI failed to generate a prediction or the output was not in the expected format.");
      throw new Error("AI failed to generate a prediction. The output was empty or not in the expected JSON format.");
    }
    
    if (!output.keyReasons || output.keyReasons.length < 6) {
        console.warn("Warning: LLM returned fewer than 6 keyReasons. Consider refining the prompt for stricter adherence.");
    }

    console.log("[predictSportMatchFlow] Prediction output:", output);
    return output;
  }
);
