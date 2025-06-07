
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

export interface MatchOdds {
  teamAWin: number;
  draw: number;
  teamBWin: number;
  source: string;
  lastUpdated: string; // ISO Date string
}


const USE_LIVE_SPORTMONKS_FORM_API = false; 
const USE_LIVE_APIFOOTBALL_H2H_API = false; 
const USE_LIVE_APIFOOTBALL_INJURY_API = false; 
const USE_LIVE_THEODDSAPI_ODDS_API = false;

// Simulate fetching team form
export async function getMockTeamForm(teamName: string, sport: string): Promise<TeamForm> {
  // API Key (from .env): process.env.SPORTMONKS_TOKEN
  if (USE_LIVE_SPORTMONKS_FORM_API && process.env.SPORTMONKS_TOKEN) {
    try {
      console.log(`[getMockTeamForm LIVE] Attempting to fetch live form data for ${teamName} (${sport}) from SportMonks.`);
      // const sportMonksTeamId = await getSportMonksTeamId(teamName, sport); // Helper to map team name to SportMonks ID
      // const response = await fetch(`https://api.sportmonks.com/v3/.../teams/${sportMonksTeamId}?include=formFixtures.opponent&api_token=${process.env.SPORTMONKS_TOKEN}`);
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`SportMonks API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
      // }
      // const data = await response.json();
      // const mappedData: TeamForm = mapSportMonksFormToTeamForm(data); // Implement mapping function
      // console.log(`[getMockTeamForm LIVE] Successfully fetched form data for ${teamName} from SportMonks.`);
      // return mappedData;
      console.warn("[getMockTeamForm LIVE] Live SportMonks integration for team form is not fully implemented. Falling back to mock data.");
    } catch (error) {
      console.error("[getMockTeamForm LIVE] Error fetching live form data from SportMonks:", error);
      console.warn("[getMockTeamForm LIVE] Falling back to mock data for team form.");
    }
  }

  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)); 
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
    "Liverpool FC": { /* ... existing mock ... */ teamName: "Liverpool FC", matches: [{ opponent: "Man City", result: "W", score: "3-1", competition: "Premier League", date: "2024-05-20"}, { opponent: "Chelsea", result: "D", score: "2-2", competition: "Premier League", date: "2024-05-13"}, { opponent: "Arsenal", result: "W", score: "2-0", competition: "FA Cup", date: "2024-05-06"}, { opponent: "Man United", result: "L", score: "1-2", competition: "Premier League", date: "2024-04-29"}, { opponent: "Everton", result: "W", score: "4-0", competition: "Premier League", date: "2024-04-22"},], summary: "Liverpool: 3 Wins, 1 Draw, 1 Loss in last 5. Strong attacking form." },
    "Manchester City": { /* ... existing mock ... */ teamName: "Manchester City", matches: [{ opponent: "Liverpool FC", result: "L", score: "1-3", competition: "Premier League", date: "2024-05-20"}, { opponent: "Real Madrid", result: "W", score: "2-1", competition: "Champions League", date: "2024-05-15"}, { opponent: "Tottenham", result: "W", score: "3-0", competition: "Premier League", date: "2024-05-10"}, { opponent: "Aston Villa", result: "D", score: "1-1", competition: "Premier League", date: "2024-05-05"}, { opponent: "West Ham", result: "W", score: "2-0", competition: "Premier League", date: "2024-05-01"},], summary: "Man City: 3 Wins, 1 Draw, 1 Loss in last 5. Solid defensively recently." }
  };
  return mockForms[teamName] || mockForms["Default"];
}

// Simulate fetching H2H stats
export async function getMockHeadToHeadStats(teamA: string, teamB: string, sport: string): Promise<HeadToHeadStats> {
  // API Key (from .env): process.env.API_FOOTBALL_KEY
  if (USE_LIVE_APIFOOTBALL_H2H_API && process.env.API_FOOTBALL_KEY && sport.toLowerCase() === 'football') {
    try {
      console.log(`[getMockHeadToHeadStats LIVE] Attempting to fetch live H2H data for ${teamA} vs ${teamB} from API-Football.`);
      // const teamAId = await getApiFootballTeamId(teamA); // Helper function needed
      // const teamBId = await getApiFootballTeamId(teamB); // Helper function needed
      // const response = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${teamAId}-${teamBId}&last=5`, {
      //   headers: { "x-rapidapi-key": process.env.API_FOOTBALL_KEY, "x-rapidapi-host": "v3.football.api-sports.io" }
      // });
      // if (!response.ok) { /* ... error handling ... */ }
      // const data = await response.json();
      // const mappedData: HeadToHeadStats = mapApiFootballH2HToStats(data, teamA, teamB); // Implement mapping
      // return mappedData;
      console.warn("[getMockHeadToHeadStats LIVE] Live API-Football integration for H2H is not fully implemented. Falling back to mock data.");
    } catch (error) {
      console.error("[getMockHeadToHeadStats LIVE] Error fetching live H2H data from API-Football:", error);
      console.warn("[getMockHeadToHeadStats LIVE] Falling back to mock data for H2H.");
    }
  }

  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  console.log(`[getMockHeadToHeadStats MOCK] Providing mock H2H data for ${teamA} vs ${teamB} (${sport}).`);
  const competitions = sport === 'Football' ? ['Premier League', 'Champions League', 'FA Cup'] : ['NBA Regular Season', 'NBA Playoffs'];
  const mockH2H: Record<string, HeadToHeadStats> = {
    "Liverpool FC-Manchester City": { /* ... existing mock ... */ teamA: "Liverpool FC", teamB: "Manchester City", matches: [{ winner: "Liverpool FC", score: "3-1", competition: "Premier League", date: "2024-05-20"},{ winner: "Draw", score: "2-2", competition: "Champions League", date: "2023-11-10"},{ winner: "Manchester City", score: "4-1", competition: "Premier League", date: "2023-03-01"},{ winner: "Liverpool FC", score: "1-0", competition: "FA Cup", date: "2022-10-15"},{ winner: "Draw", score: "0-0", competition: "Premier League", date: "2022-04-05"},], summary: "Recent H2H: Liverpool 2 wins, Man City 1 win, 2 Draws. Often high-scoring.", },
    "Default": { /* ... existing mock ... */ teamA, teamB, matches: Array.from({ length: 5 }, (_, i) => { const winnerOptions = [teamA, teamB, "Draw"]; return { winner: winnerOptions[Math.floor(Math.random() * winnerOptions.length)], score: `${Math.floor(Math.random() * 4)}-${Math.floor(Math.random() * 4)}`, competition: competitions[Math.floor(Math.random() * competitions.length)], date: new Date(Date.now() - (i + 3) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], }; }), summary: "Mocked H2H: Fairly even in past encounters.", }
  };
  return mockH2H[`${teamA}-${teamB}`] || mockH2H[`${teamB}-${teamA}`] || mockH2H["Default"];
}

// Simulate fetching player availability (injuries/suspensions)
export async function getMockPlayerAvailability(teamName: string, sport: string): Promise<PlayerAvailability> {
  // API Key (from .env): process.env.API_FOOTBALL_KEY
  if (USE_LIVE_APIFOOTBALL_INJURY_API && process.env.API_FOOTBALL_KEY && sport.toLowerCase() === 'football') {
    try {
      console.log(`[getMockPlayerAvailability LIVE] Attempting to fetch live injury data for ${teamName} from API-Football.`);
      // const teamId = await getApiFootballTeamId(teamName); // Helper function needed
      // const currentDate = new Date().toISOString().split('T')[0];
      // const response = await fetch(`https://v3.football.api-sports.io/injuries?team=${teamId}&date=${currentDate}`, { // Or by fixture ID
      //   headers: { "x-rapidapi-key": process.env.API_FOOTBALL_KEY, "x-rapidapi-host": "v3.football.api-sports.io" }
      // });
      // if (!response.ok) { /* ... error handling ... */ }
      // const data = await response.json();
      // const mappedData: PlayerAvailability = mapApiFootballInjuriesToAvailability(data, teamName); // Implement mapping
      // return mappedData;
      console.warn("[getMockPlayerAvailability LIVE] Live API-Football integration for injuries is not fully implemented. Falling back to mock data.");
    } catch (error) {
      console.error("[getMockPlayerAvailability LIVE] Error fetching live injury data from API-Football:", error);
      console.warn("[getMockPlayerAvailability LIVE] Falling back to mock data for injuries.");
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
  console.log(`[getMockPlayerAvailability MOCK] Providing mock player availability data for ${teamName} (${sport}).`);
  const mockAvailability: Record<string, PlayerAvailability> = {
    "Default": { /* ... existing mock ... */ teamName, unavailablePlayers: Math.random() > 0.5 ? [{ name: "Mock Player A", reason: "Injury", expectedReturn: "2 weeks" }] : [], keyPlayersAvailable: Math.random() > 0.7, },
    "Liverpool FC": { /* ... existing mock ... */ teamName: "Liverpool FC", unavailablePlayers: [{ name: "Thiago Alcantara", reason: "Injury", expectedReturn: "End of season"},{ name: "Joel Matip", reason: "Injury", expectedReturn: "1 month"},], keyPlayersAvailable: true, },
    "Manchester City": { /* ... existing mock ... */ teamName: "Manchester City", unavailablePlayers: [{ name: "Kevin De Bruyne", reason: "Suspension", expectedReturn: "Next match"},], keyPlayersAvailable: false, }
  };
  return mockAvailability[teamName] || mockAvailability["Default"];
}

// Simulate fetching match odds
export async function getMockMatchOdds(teamA: string, teamB: string, sport: string, competition?: string): Promise<MatchOdds> {
  // API Key (from .env): process.env.THEODDS_API_KEY
  if (USE_LIVE_THEODDSAPI_ODDS_API && process.env.THEODDS_API_KEY) {
    try {
      console.log(`[getMockMatchOdds LIVE] Attempting to fetch live odds for ${teamA} vs ${teamB} from TheOddsAPI.`);
      // Note: TheOddsAPI uses 'sport keys' not full sport names. You'll need to map 'sport' to their key.
      // E.g., 'soccer_epl' for English Premier League.
      // You'll also need to map team names or use their event IDs if available.
      // const sportKey = mapSportToTheOddsApiKey(sport, competition); // Helper function needed
      // const regions = "us"; // or eu, uk, au
      // const markets = "h2h"; // Head-to-head (moneyline)
      // const response = await fetch(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${process.env.THEODDS_API_KEY}&regions=${regions}&markets=${markets}`);
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`TheOddsAPI request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
      // }
      // const data = await response.json(); // This will be an array of events
      // Find the specific event for teamA vs teamB
      // const event = data.find((e: any) => e.home_team.toLowerCase().includes(teamA.toLowerCase()) && e.away_team.toLowerCase().includes(teamB.toLowerCase()));
      // if (event && event.bookmakers && event.bookmakers.length > 0) {
      //   // Find a bookmaker (e.g., DraftKings, FanDuel, or average them)
      //   const bookie = event.bookmakers[0]; // Or choose a specific one
      //   const oddsData = bookie.markets[0].outcomes;
      //   const homeOdds = oddsData.find((o: any) => o.name === event.home_team)?.price;
      //   const awayOdds = oddsData.find((o: any) => o.name === event.away_team)?.price;
      //   const drawOdds = oddsData.find((o: any) => o.name === 'Draw')?.price;
      //   const mappedData: MatchOdds = {
      //       teamAWin: homeOdds || 0,
      //       draw: drawOdds || 0,
      //       teamBWin: awayOdds || 0,
      //       source: bookie.title || "TheOddsAPI",
      //       lastUpdated: bookie.last_update || new Date().toISOString(),
      //   };
      //   return mappedData;
      // }
      console.warn("[getMockMatchOdds LIVE] Live TheOddsAPI integration is not fully implemented. Falling back to mock data.");
    } catch (error) {
      console.error("[getMockMatchOdds LIVE] Error fetching live odds from TheOddsAPI:", error);
      console.warn("[getMockMatchOdds LIVE] Falling back to mock data for odds.");
    }
  }

  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));
  console.log(`[getMockMatchOdds MOCK] Providing mock odds for ${teamA} vs ${teamB} (${sport}).`);
  
  // Simple mock odds logic
  let teamAOdds = 1.5 + Math.random() * 2; // e.g., 1.5 to 3.5
  let teamBOdds = 1.5 + Math.random() * 2;
  let drawOdds = 2.5 + Math.random() * 1.5; // Draws are usually higher

  // Basic normalization (not a real bookmaker's calculation)
  const totalInv = 1/teamAOdds + 1/teamBOdds + (sport === "Football" || sport === "Soccer" ? 1/drawOdds : 0);
  teamAOdds = teamAOdds * totalInv * 1.05; // Add a bit for bookie margin
  teamBOdds = teamBOdds * totalInv * 1.05;
  drawOdds = sport === "Football" || sport === "Soccer" ? drawOdds * totalInv * 1.05 : 0;


  return {
    teamAWin: parseFloat(teamAOdds.toFixed(2)),
    draw: sport === "Football" || sport === "Soccer" ? parseFloat(drawOdds.toFixed(2)) : 0, // No draw odds for some sports
    teamBWin: parseFloat(teamBOdds.toFixed(2)),
    source: "MockOddsProvider",
    lastUpdated: new Date().toISOString(),
  };
}
