
'use server';
/**
 * @fileOverview Mock data provider for sports match context (form, H2H, etc.).
 * This simulates fetching data that a real agent would get from external APIs.
 */

export interface TeamForm {
  teamName: string;
  matches: Array<{
    opponent: string;
    result: 'W' | 'D' | 'L';
    score?: string;
    competition: string;
    date: string;
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
    date: string;
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

// Simulate fetching team form
export async function getMockTeamForm(teamName: string, sport: string): Promise<TeamForm> {
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)); // Simulate API delay

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
    // Add more specific mocks as needed
  };
  return mockForms[teamName] || mockForms["Default"];
}

// Simulate fetching H2H stats
export async function getMockHeadToHeadStats(teamA: string, teamB: string, sport: string): Promise<HeadToHeadStats> {
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
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

// Simulate fetching player availability
export async function getMockPlayerAvailability(teamName: string, sport: string): Promise<PlayerAvailability> {
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
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
