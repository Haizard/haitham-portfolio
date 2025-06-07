
'use server';
/**
 * @fileOverview Mock data provider for sports match context (form, H2H, etc.).
 * This simulates fetching data that a real agent would get from external APIs.
 * TODO: Replace mock implementations with actual API calls.
 */

export interface TeamForm {
  teamName: string;
  matches: Array<{
    opponent: string;
    result: 'W' | 'D' | 'L';
    score?: string;
    competition: string;
    date: string; // ISO Date string
  }>;
  summary?: string; // e.g., "3 Wins, 1 Draw, 1 Loss in last 5"
}

export interface HeadToHeadStats {
  teamA: string;
  teamB: string;
  matches: Array<{
    winner: string; // Team name or "Draw"
    score?: string;
    competition: string;
    date: string; // ISO Date string
  }>;
  summary?: string; // e.g., "Team A: 2 wins, Team B: 1 win, 2 Draws in last 5 H2H"
}

export interface PlayerAvailability {
  teamName: string;
  unavailablePlayers: Array<{
    name: string;
    reason: 'Injury' | 'Suspension' | 'Other';
    expectedReturn?: string;
  }>;
  keyPlayersAvailable?: boolean; // Simple flag
}

const USE_LIVE_SPORTMONKS_FORM_API = false; // Set to true to attempt live API call for team form
const USE_LIVE_APIFOOTBALL_H2H_API = false; // Set to true to attempt live API call for H2H
const USE_LIVE_APIFOOTBALL_INJURY_API = false; // Set to true to attempt live API call for injuries


// Simulate fetching team form
export async function getMockTeamForm(teamName: string, sport: string): Promise<TeamForm> {
  // --- Integration Point for SportMonks API for Team Form & Momentum ---
  // As per plan: Primary API for Player Form & Team Momentum is SportMonks.
  // SportMonks Token: process.env.SPORTMONKS_TOKEN
  if (USE_LIVE_SPORTMONKS_FORM_API && process.env.SPORTMONKS_TOKEN) {
    try {
      console.log(`[getMockTeamForm LIVE] Attempting to fetch live form data for ${teamName} (${sport}) from SportMonks.`);
      // TODO: You'd need the team's ID from SportMonks.
      // const sportMonksTeamId = await getSportMonksTeamId(teamName, sport); // Helper function needed
      // const response = await fetch(`https://api.sportmonks.com/v3/football/teams/${sportMonksTeamId}?include=formFixtures.opponent&api_token=${process.env.SPORTMONKS_TOKEN}`);
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`SportMonks API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
      // }
      // const data = await response.json();
      // const mappedData: TeamForm = mapSportMonksFormToTeamForm(data); // You'd need a mapping function
      // console.log(`[getMockTeamForm LIVE] Successfully fetched form data for ${teamName} from SportMonks.`);
      // return mappedData;
      console.warn("[getMockTeamForm LIVE] Live SportMonks integration for team form is not fully implemented. Falling back to mock data.");
    } catch (error) {
      console.error("[getMockTeamForm LIVE] Error fetching live form data from SportMonks:", error);
      console.warn("[getMockTeamForm LIVE] Falling back to mock data for team form.");
    }
  }
  // --- End SportMonks Integration Point ---

  // Fallback to Mock Data
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)); // Simulate API delay
  console.log(`[getMockTeamForm MOCK] Providing mock form data for ${teamName} (${sport}).`);

  const results: Array<'W' | 'D' | 'L'> = ['W', 'D', 'L'];
  const competitions = sport === 'Football' ? ['League', 'Cup', 'Champions League'] : ['Regular Season', 'Playoffs'];
  
  const mockForms: Record<string, TeamForm> = {
    "Default": {
      teamName,
      matches: Array.from({ length: 5 }, (_, i) => ({
        opponent: `Opponent ${String.fromCharCode(65 + i)}`,
        result: results[Math.floor(Math.random() * results.length)],
        score: `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 3)}`,
        competition: competitions[Math.floor(Math.random() * competitions.length)],
        date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })),
      summary: "Mocked: 3W, 1D, 1L in last 5",
    },
    "Liverpool FC": {
      teamName: "Liverpool FC",
      matches: [
        { opponent: "Man City", result: "W", score: "3-1", competition: "Premier League", date: "2024-05-20"},
        { opponent: "Chelsea", result: "D", score: "2-2", competition: "Premier League", date: "2024-05-13"},
        { opponent: "Arsenal", result: "W", score: "2-0", competition: "FA Cup", date: "2024-05-06"},
        { opponent: "Man United", result: "L", score: "1-2", competition: "Premier League", date: "2024-04-29"},
        { opponent: "Everton", result: "W", score: "4-0", competition: "Premier League", date: "2024-04-22"},
      ],
      summary: "Liverpool: 3 Wins, 1 Draw, 1 Loss in last 5. Strong attacking form."
    },
     "Manchester City": {
      teamName: "Manchester City",
      matches: [
        { opponent: "Liverpool FC", result: "L", score: "1-3", competition: "Premier League", date: "2024-05-20"},
        { opponent: "Real Madrid", result: "W", score: "2-1", competition: "Champions League", date: "2024-05-15"},
        { opponent: "Tottenham", result: "W", score: "3-0", competition: "Premier League", date: "2024-05-10"},
        { opponent: "Aston Villa", result: "D", score: "1-1", competition: "Premier League", date: "2024-05-05"},
        { opponent: "West Ham", result: "W", score: "2-0", competition: "Premier League", date: "2024-05-01"},
      ],
      summary: "Man City: 3 Wins, 1 Draw, 1 Loss in last 5. Solid defensively recently."
    }
  };
  return mockForms[teamName] || mockForms["Default"];
}

// Simulate fetching H2H stats
export async function getMockHeadToHeadStats(teamA: string, teamB: string, sport: string): Promise<HeadToHeadStats> {
  // --- Integration Point for API-Football for H2H Stats ---
  // API-Football Key: process.env.API_FOOTBALL_KEY
  if (USE_LIVE_APIFOOTBALL_H2H_API && process.env.API_FOOTBALL_KEY && sport.toLowerCase() === 'football') {
    try {
      console.log(`[getMockHeadToHeadStats LIVE] Attempting to fetch live H2H data for ${teamA} vs ${teamB} from API-Football.`);
      // TODO: You'd need team IDs from API-Football.
      // const teamAId = await getApiFootballTeamId(teamA); // Helper function needed
      // const teamBId = await getApiFootballTeamId(teamB); // Helper function needed
      // const response = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${teamAId}-${teamBId}&last=5`, {
      //   headers: { "x-rapidapi-key": process.env.API_FOOTBALL_KEY, "x-rapidapi-host": "v3.football.api-sports.io" }
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`API-Football H2H request failed: ${response.status} - ${errorData.message || JSON.stringify(errorData.errors)}`);
      // }
      // const data = await response.json();
      // const mappedData: HeadToHeadStats = mapApiFootballH2HToStats(data, teamA, teamB); // You'd need mapping
      // console.log(`[getMockHeadToHeadStats LIVE] Successfully fetched H2H data for ${teamA} vs ${teamB}.`);
      // return mappedData;
      console.warn("[getMockHeadToHeadStats LIVE] Live API-Football integration for H2H is not fully implemented. Falling back to mock data.");
    } catch (error) {
      console.error("[getMockHeadToHeadStats LIVE] Error fetching live H2H data from API-Football:", error);
      console.warn("[getMockHeadToHeadStats LIVE] Falling back to mock data for H2H.");
    }
  }
  // --- End API-Football H2H Integration Point ---

  // Fallback to Mock Data
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  console.log(`[getMockHeadToHeadStats MOCK] Providing mock H2H data for ${teamA} vs ${teamB} (${sport}).`);

  const competitions = sport === 'Football' ? ['Premier League', 'Champions League', 'FA Cup'] : ['NBA Regular Season', 'NBA Playoffs'];
  const mockH2H: Record<string, HeadToHeadStats> = {
    "Liverpool FC-Manchester City": {
        teamA: "Liverpool FC",
        teamB: "Manchester City",
        matches: [
            { winner: "Liverpool FC", score: "3-1", competition: "Premier League", date: "2024-05-20"},
            { winner: "Draw", score: "2-2", competition: "Champions League", date: "2023-11-10"},
            { winner: "Manchester City", score: "4-1", competition: "Premier League", date: "2023-03-01"},
            { winner: "Liverpool FC", score: "1-0", competition: "FA Cup", date: "2022-10-15"},
            { winner: "Draw", score: "0-0", competition: "Premier League", date: "2022-04-05"},
        ],
        summary: "Recent H2H: Liverpool 2 wins, Man City 1 win, 2 Draws. Often high-scoring.",
    },
    "Default": {
      teamA,
      teamB,
      matches: Array.from({ length: 5 }, (_, i) => {
        const winnerOptions = [teamA, teamB, "Draw"];
        return {
            winner: winnerOptions[Math.floor(Math.random() * winnerOptions.length)],
            score: `${Math.floor(Math.random() * 4)}-${Math.floor(Math.random() * 4)}`,
            competition: competitions[Math.floor(Math.random() * competitions.length)],
            date: new Date(Date.now() - (i + 3) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
      }),
      summary: "Mocked H2H: Fairly even in past encounters.",
    }
  };
  return mockH2H[`${teamA}-${teamB}`] || mockH2H[`${teamB}-${teamA}`] || mockH2H["Default"];
}

// Simulate fetching player availability (injuries/suspensions)
export async function getMockPlayerAvailability(teamName: string, sport: string): Promise<PlayerAvailability> {
  // --- Integration Point for API-Football for Injuries ---
  // API-Football Key: process.env.API_FOOTBALL_KEY
  // As per plan: Primary API for Injuries is API-Football.
  if (USE_LIVE_APIFOOTBALL_INJURY_API && process.env.API_FOOTBALL_KEY && sport.toLowerCase() === 'football') {
    try {
      console.log(`[getMockPlayerAvailability LIVE] Attempting to fetch live injury data for ${teamName} from API-Football.`);
      // TODO: You'd need the team's ID from API-Football.
      // const teamId = await getApiFootballTeamId(teamName); // Helper function needed
      // const currentDate = new Date().toISOString().split('T')[0];
      // const response = await fetch(`https://v3.football.api-sports.io/injuries?team=${teamId}&date=${currentDate}`, { // Or specific fixture ID
      //   headers: { "x-rapidapi-key": process.env.API_FOOTBALL_KEY, "x-rapidapi-host": "v3.football.api-sports.io" }
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`API-Football Injuries request failed: ${response.status} - ${errorData.message || JSON.stringify(errorData.errors)}`);
      // }
      // const data = await response.json();
      // const mappedData: PlayerAvailability = mapApiFootballInjuriesToAvailability(data, teamName); // Mapper needed
      // console.log(`[getMockPlayerAvailability LIVE] Successfully fetched injury data for ${teamName}.`);
      // return mappedData;
      console.warn("[getMockPlayerAvailability LIVE] Live API-Football integration for injuries is not fully implemented. Falling back to mock data.");
    } catch (error) {
      console.error("[getMockPlayerAvailability LIVE] Error fetching live injury data from API-Football:", error);
      console.warn("[getMockPlayerAvailability LIVE] Falling back to mock data for injuries.");
    }
  }
  // --- End API-Football Injury Integration Point ---

  // Fallback to Mock Data
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
  console.log(`[getMockPlayerAvailability MOCK] Providing mock player availability data for ${teamName} (${sport}).`);

  const mockAvailability: Record<string, PlayerAvailability> = {
    "Default": {
      teamName,
      unavailablePlayers: Math.random() > 0.5 ? [{ name: "Mock Player A", reason: "Injury", expectedReturn: "2 weeks" }] : [],
      keyPlayersAvailable: Math.random() > 0.7,
    },
    "Liverpool FC": {
      teamName: "Liverpool FC",
      unavailablePlayers: [
        { name: "Thiago Alcantara", reason: "Injury", expectedReturn: "End of season"},
        { name: "Joel Matip", reason: "Injury", expectedReturn: "1 month"},
      ],
      keyPlayersAvailable: true,
    },
    "Manchester City": {
      teamName: "Manchester City",
      unavailablePlayers: [
         { name: "Kevin De Bruyne", reason: "Suspension", expectedReturn: "Next match"},
      ],
      keyPlayersAvailable: false, // Assuming KDB is key
    }
  };
  return mockAvailability[teamName] || mockAvailability["Default"];
}
