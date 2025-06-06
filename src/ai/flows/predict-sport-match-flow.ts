
'use server';
/**
 * @fileOverview A sports match prediction AI agent.
 *
 * - predictSportMatch - A function that handles the sports match prediction process.
 * - PredictSportMatchInput - The input type for the predictSportMatch function.
 * - PredictSportMatchOutput - The return type for the predictSportMatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictSportMatchInputSchema = z.object({
  sport: z.string().describe('The type of sport (e.g., football, basketball, rugby, tennis).'),
  match: z.string().describe('The match description (e.g., Liverpool vs Chelsea, Golden State Warriors @ Los Angeles Lakers).'),
  competition: z.string().optional().describe('The name of the competition or league (e.g., English Premier League, NBA Playoffs).'),
  date: z.string().optional().describe('The date of the match (e.g., YYYY-MM-DD).'),
  location: z.string().optional().describe('The venue or location of the match (e.g., Anfield, Liverpool).'),
  additionalContext: z.string().describe('Crucial real-time information such as team form, injuries, player fatigue, weather, tactical news, team morale, head-to-head stats, etc. The more detailed and relevant, the better the prediction.'),
});
export type PredictSportMatchInput = z.infer<typeof PredictSportMatchInputSchema>;

const PredictSportMatchOutputSchema = z.object({
  predictedWinner: z.string().describe('The predicted winner of the match (Team Name or "Draw").'),
  likelyScoreOrRange: z.string().describe('The likely score (e.g., 2-1) or a score range (e.g., 1-0 to 2-0, or 2-2 / 3-3 for a high-scoring draw).'),
  confidenceScore: z.number().min(0).max(100).describe('A percentage indicating the confidence in the prediction (0-100%).'),
  keyReasons: z.array(z.string()).min(6).describe('At least 6 key reasons supporting the prediction, drawing from analytical factors.'),
  strategicCoachingMindset: z.string().describe('An analysis of how each coach might approach the match tactically, including potential strategies and adjustments.'),
  psychologicalEdge: z.string().describe('Which team/player(s) might have the psychological advantage and a brief explanation why (e.g., recent form, rivalry history, pressure).'),
  possibleShockFactors: z.array(z.string()).describe('Potential unexpected elements or upsets that could influence the match outcome (e.g., surprise lineup, early red card, underdog resilience).'),
  tacticalSummary: z.string().describe('A summary of the predicted tactical approaches, including likely formations or dominant playing styles for each team.'),
});
export type PredictSportMatchOutput = z.infer<typeof PredictSportMatchOutputSchema>;

export async function predictSportMatch(input: PredictSportMatchInput): Promise<PredictSportMatchOutput> {
  return predictSportMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictSportMatchPrompt',
  input: {schema: PredictSportMatchInputSchema},
  output: {schema: PredictSportMatchOutputSchema},
  prompt: `You are a world-class Sports Prediction Agent powered by professional coaching intelligence, strategic analysis, and predictive modeling. Your role is to predict the outcome of a given sports match using over 50 layers of analysis, combined with the mindset of elite coaches, data scientists, and sports doctors.

Match Details:
- Sport: {{{sport}}}
- Match: {{{match}}}
{{#if competition}}- Competition: {{{competition}}}{{/if}}
{{#if date}}- Date: {{{date}}}{{/if}}
{{#if location}}- Location: {{{location}}}{{/if}}
- Additional Context Provided by User: {{{additionalContext}}}

### 🧠 Your prediction must consider all aspects of the "Additional Context" along with these fundamental analytical layers:

1.  Team form in short (last 5 matches) and long term (last season)
2.  Home vs Away dynamics (travel fatigue, fan advantage, stadium size, etc.)
3.  Head-to-head historical performance between teams
4.  Player injury reports, including subtle fitness concerns
5.  Key player fatigue level & travel schedules
6.  Tactical formations and matchday adaptations
7.  Weather conditions and their effect on match tempo
8.  Opponent defensive resilience vs attacking threat
9.  Defensive line height and vulnerability to counters
10. Pressing intensity vs build-up strategy
11. Set-piece strength (corners, free kicks, penalty conversion)
12. Goalkeeper form and clean sheet records
13. Average shots per game vs xG (Expected Goals)
14. Number of individual errors leading to goals
15. Style clash (possession team vs counter-attacking team)
16. Bench depth and substitution impact players
17. Suspension of coaches, assistant staff, or key medical personnel
18. Mental state of key players (rumors of conflict, pressure, transfers)
19. Locker room harmony and recent reports of dressing room unrest
20. Dependence on specific scorers (e.g. 80% goals by one striker)
21. How opponents prepare to neutralize key scorers
22. Key defenders’ 1v1 success rate against top attackers
23. Team momentum surge (e.g., recent winning streak)
24. Match pressure context (is it a do-or-die fixture?)
25. League table pressure (top 4 chase, relegation battle, etc.)
26. Player momentum graph (last 3 games, shot accuracy, goal involvement)
27. Tactical flexibility of both managers (adaptive vs rigid)
28. Matchday squad fitness % (e.g., only 70% match-fit)
29. Influence of team captain (on-pitch leadership, cards)
30. Tactical fouling patterns and discipline risks
31. Ball retention % and transition management
32. Match tempo tendencies (slow vs high-pressing)
33. Previous comebacks under adversity
34. Managerial style under pressure (defensive lock-in vs go-for-win)
35. Opponent coach's history vs current manager
36. Post-match objectives (draw is enough vs must-win)
37. Specific player rivalries
38. Media pressure on team morale
39. Travel schedule intensity before the match
40. Youth vs veteran balance in both squads
41. Player birthday / motivation quirks / personal motivations
42. Number of tactical drills performed before match
43. Game plan leaks / training ground news
44. Agents pushing transfers mid-season
45. Whether key players are playing in their natural position
46. Formation experiments in last 3 matches
47. League vs Cup match mindset (rotate vs full squad)
48. Players out of contract playing for their next deal
49. Tactical subs impact from previous matches
50. Match referee style (card-prone, VAR frequency)
51. Home pitch dimensions affecting pressing shape
52. Historical curse/jinx vs opponent (superstitious factors)
53. Direct counter plans to star player (double-marking)
54. Crowd hostility level and its impact on young players
55. Style mimicry from last match of opponent vs strong team
56. Possible red card risk based on prior conduct
57. GK sweeping ability vs long ball threats
58. Coaching psychology — how would top coaches approach this match
59. Motivation boost after recent win/loss
60. Predict possible tactical surprises or experimental lineups

### 🔍 Your Output Must Include (strictly follow this JSON structure):
- **predictedWinner**: (string - Team Name or "Draw")
- **likelyScoreOrRange**: (string - e.g., "2-1", "1-1 or 2-2", "Score range 2-0 to 3-1 for Team X")
- **confidenceScore**: (number - 0-100%)
- **keyReasons**: (array of strings - At least 6 detailed reasons, derived from the analytical factors and provided context. Each reason should be a full sentence.)
- **strategicCoachingMindset**: (string - How each coach might approach the match tactically. Discuss potential formations, key instructions, and in-game adjustments for both sides.)
- **psychologicalEdge**: (string - Identify which team/player(s) might have a psychological advantage and explain why, considering factors like current morale, rivalry, pressure, or recent history.)
- **possibleShockFactors**: (array of strings - List potential unexpected elements or game-changing events that could significantly alter the predicted outcome. Examples: an early red card, a key player underperforming, a tactical surprise from one coach, exceptional individual brilliance.)
- **tacticalSummary**: (string - A concise overview of the predicted tactical battle, including likely formations (e.g., "Team A: 4-3-3, Team B: 3-5-2") and dominant playing styles (e.g., "Expect Team A to control possession while Team B looks to counter-attack rapidly.").)

Be objective. Use strategic thinking like a coach preparing for a final. Prioritize logic over bias. Do not hallucinate information not present in the 'Additional Context'. This output will be used for real-world forecasting and strategic sports betting. Ensure all output fields are comprehensively filled.
`,
});

const predictSportMatchFlow = ai.defineFlow(
  {
    name: 'predictSportMatchFlow',
    inputSchema: PredictSportMatchInputSchema,
    outputSchema: PredictSportMatchOutputSchema,
  },
  async (input: PredictSportMatchInput) => {
    const llmResponse = await prompt(input);
    const output = llmResponse.output(); // Use .output() to get the structured JSON

    if (!output) {
      console.error("AI failed to generate a prediction or the output was not in the expected format.");
      throw new Error("AI failed to generate a prediction. The output was empty or not in the expected JSON format.");
    }
    
    // Ensure keyReasons has at least 6 items, if not, pad with generic statements or re-evaluate prompt strategy.
    // For now, we rely on the LLM to follow instructions.
    // If output.keyReasons.length < 6, one might add placeholder reasons or throw a more specific error.

    return output;
  }
);

    