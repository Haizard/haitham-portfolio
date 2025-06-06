
'use server';
/**
 * @fileOverview A flow to fetch upcoming matches for a given sport, with optional filters.
 *
 * - getUpcomingMatches - Fetches upcoming matches.
 * - GetUpcomingMatchesInput - Input type for the flow.
 * - GetUpcomingMatchesOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchUpcomingMatches, type UpcomingMatch, type FetchMatchesFilters } from '@/lib/sports-data-mock';

const GetUpcomingMatchesInputSchema = z.object({
  sport: z.string().min(1, "Sport selection is required."),
  country: z.string().optional().describe("Optional: Filter by country."),
  league: z.string().optional().describe("Optional: Filter by league."),
});
export type GetUpcomingMatchesInput = z.infer<typeof GetUpcomingMatchesInputSchema>;

// Output schema is an array of UpcomingMatch objects
const GetUpcomingMatchesOutputSchema = z.array(
  z.object({
    id: z.string(),
    sport: z.string(),
    description: z.string(),
    teamA: z.string(),
    teamB: z.string(),
    date: z.string(), // ISO string
    time: z.string().optional(),
    competition: z.string(),
    league: z.string().optional(),
    country: z.string().optional(),
    location: z.string().optional(),
  })
);
export type GetUpcomingMatchesOutput = z.infer<typeof GetUpcomingMatchesOutputSchema>;


export async function getUpcomingMatches(input: GetUpcomingMatchesInput): Promise<GetUpcomingMatchesOutput> {
  // This flow directly calls the mock data fetching function.
  // No LLM is involved in this particular flow.
  return getUpcomingMatchesFlow(input);
}

// This flow doesn't use an LLM prompt but directly calls the data fetching function
const getUpcomingMatchesFlow = ai.defineFlow(
  {
    name: 'getUpcomingMatchesFlow',
    inputSchema: GetUpcomingMatchesInputSchema,
    outputSchema: GetUpcomingMatchesOutputSchema,
  },
  async (filters: FetchMatchesFilters) => {
    const matches = await fetchUpcomingMatches(filters);
    return matches;
  }
);
