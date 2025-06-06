
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
  getMockPlayerAvailability, type PlayerAvailability
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

// Genkit Tools (using mock data providers)
const getTeamFormTool = ai.defineTool(
  {
    name: 'getTeamForm',
    description: 'Fetches the recent form (last 5 matches) for a specific team.',
    inputSchema: TeamInputSchema,
    outputSchema: z.custom<TeamForm>(), // Using z.custom for complex interface
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


// Main Flow Schemas
const PredictSportMatchInputSchema = z.object({
  sport: z.string().describe('The type of sport (e.g., football, basketball, rugby, tennis).'),
  teamA: z.string().describe('The name of Team A.'),
  teamB: z.string().describe('The name of Team B.'),
  matchDescription: z.string().describe('Full match description (e.g., Liverpool vs Chelsea).'),
  competition: z.string().optional().describe('The name of the competition or league (e.g., English Premier League, NBA Playoffs).'),
  date: z.string().optional().describe('The date of the match (e.g., YYYY-MM-DD).'),
  location: z.string().optional().describe('The venue or location of the match (e.g., Anfield, Liverpool).'),
  // User can still provide specific insights the AI might not find.
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
  tools: [getTeamFormTool, getHeadToHeadStatsTool, getPlayerAvailabilityTool], // Make tools available
  prompt: `You are a world-class Sports Prediction Agent. Your goal is to predict the outcome of a given sports match by:
1.  Using the available tools to gather essential context (team form, H2H stats, player availability).
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
    *   Synthesize the information obtained from these tools along with any 'User-Provided Context'.
2.  **Analytical Layers:** After gathering data with tools, consider the following (among others from your knowledge base of 50+ factors) to inform your prediction:
    Home vs Away dynamics, Tactical formations, Weather (if known from context), Style clash, Bench depth, Match pressure, Team morale (if deducible from context or tool hints), Key player dependencies.
3.  **Output Generation:** Populate ALL fields in the 'PredictSportMatchOutputSchema' JSON structure.
    *   For 'keyReasons', provide at least 6 distinct, detailed reasons. Explicitly mention if a tool's output strongly influenced a reason.
    *   For 'dataUsedFromTools', briefly summarize key data points you obtained from using the tools (e.g., "Team A form: 3W, 1D, 1L", "H2H: Team B leads 3-2 in last 5"). This field is for transparency.

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
    const llmResponse = await prompt(input); // Genkit handles tool calls automatically here
    const output = llmResponse.output; 

    if (!output) {
      console.error("AI failed to generate a prediction or the output was not in the expected format.");
      throw new Error("AI failed to generate a prediction. The output was empty or not in the expected JSON format.");
    }
    
    // Basic validation on output, e.g., ensuring keyReasons has enough items.
    if (!output.keyReasons || output.keyReasons.length < 6) {
        // You could pad with generic reasons or throw, here we just log a warning
        console.warn("Warning: LLM returned fewer than 6 keyReasons. Consider refining the prompt for stricter adherence.");
        // Pad if necessary, or let it pass:
        // while(output.keyReasons.length < 6) { output.keyReasons.push("Additional analysis needed for more reasons."); }
    }

    console.log("[predictSportMatchFlow] Prediction output:", output);
    return output;
  }
);

