
// Mock data for upcoming matches

export interface UpcomingMatch {
  id: string;
  sport: string; // e.g., "Football", "Basketball"
  description: string; // e.g., "Team A vs Team B"
  teamA: string;
  teamB: string;
  date: string; // ISO string for consistent date handling
  time?: string; // e.g., "15:00 UTC"
  competition: string;
  league?: string; // More specific league name
  country?: string; // Country of the league/match
  location?: string;
}

export interface FetchMatchesFilters {
  sport: string;
  country?: string;
  league?: string;
}

const mockMatches: UpcomingMatch[] = [
  // Football
  { id: "fb1", sport: "Football", teamA: "Manchester City", teamB: "Liverpool FC", description: "Manchester City vs Liverpool FC", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), time: "19:00 UTC", competition: "Premier League", league: "Premier League", country: "England", location: "Etihad Stadium" },
  { id: "fb2", sport: "Football", teamA: "Real Madrid", teamB: "FC Barcelona", description: "Real Madrid vs FC Barcelona", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), time: "20:00 UTC", competition: "La Liga", league: "La Liga", country: "Spain", location: "Santiago Bernabéu" },
  { id: "fb3", sport: "Football", teamA: "Bayern Munich", teamB: "Borussia Dortmund", description: "Bayern Munich vs Borussia Dortmund", date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), time: "18:30 UTC", competition: "Bundesliga", league: "Bundesliga", country: "Germany", location: "Allianz Arena" },
  { id: "fb4", sport: "Football", teamA: "Paris Saint-Germain", teamB: "Olympique de Marseille", description: "PSG vs Marseille", date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), time: "20:00 UTC", competition: "Ligue 1", league: "Ligue 1", country: "France", location: "Parc des Princes" },
  { id: "fb5", sport: "Football", teamA: "Juventus", teamB: "Inter Milan", description: "Juventus vs Inter Milan", date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), competition: "Serie A", league: "Serie A", country: "Italy", location: "Allianz Stadium, Turin" },
  { id: "fb6", sport: "Football", teamA: "Arsenal", teamB: "Tottenham Hotspur", description: "Arsenal vs Tottenham Hotspur", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), competition: "Premier League", league: "Premier League", country: "England", location: "Emirates Stadium" },


  // Basketball
  { id: "bb1", sport: "Basketball", teamA: "Los Angeles Lakers", teamB: "Golden State Warriors", description: "Lakers vs Warriors", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), time: "19:30 PST", competition: "NBA", league: "NBA", country: "USA", location: "Crypto.com Arena" },
  { id: "bb2", sport: "Basketball", teamA: "Boston Celtics", teamB: "Milwaukee Bucks", description: "Celtics vs Bucks", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), time: "19:00 EST", competition: "NBA", league: "NBA", country: "USA", location: "TD Garden" },
  { id: "bb3", sport: "Basketball", teamA: "Anadolu Efes", teamB: "Real Madrid Baloncesto", description: "Anadolu Efes vs Real Madrid", date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), competition: "EuroLeague", league: "EuroLeague", country: "International", location: "Sinan Erdem Dome, Istanbul" },


  // Tennis (Individual sport, structure might differ)
  { id: "tn1", sport: "Tennis", teamA: "Carlos Alcaraz", teamB: "Novak Djokovic", description: "Carlos Alcaraz vs Novak Djokovic", date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), competition: "Grand Slam Final", league: "ATP Tour", country: "International", location: "Center Court" },
  { id: "tn2", sport: "Tennis", teamA: "Iga Swiatek", teamB: "Aryna Sabalenka", description: "Iga Swiatek vs Aryna Sabalenka", date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), competition: "WTA 1000 Final", league: "WTA Tour", country: "International", location: "Stadium 1" },

  // Rugby
  { id: "rg1", sport: "Rugby", teamA: "New Zealand All Blacks", teamB: "South Africa Springboks", description: "All Blacks vs Springboks", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), competition: "Rugby Championship", league: "International", country: "International", location: "Eden Park, Auckland" },
  { id: "rg2", sport: "Rugby", teamA: "England Rugby", teamB: "France Rugby", description: "England vs France", date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), competition: "Six Nations", league: "Six Nations", country: "Europe", location: "Twickenham Stadium, London" },
];

export async function fetchUpcomingMatches(filters: FetchMatchesFilters): Promise<UpcomingMatch[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

  let filtered = mockMatches.filter(match => match.sport.toLowerCase() === filters.sport.toLowerCase());

  if (filters.country && filters.country.trim() !== "") {
    filtered = filtered.filter(match => match.country?.toLowerCase().includes(filters.country!.toLowerCase()));
  }
  if (filters.league && filters.league.trim() !== "") {
    filtered = filtered.filter(match => match.league?.toLowerCase().includes(filters.league!.toLowerCase()));
  }
  
  // Sort by date, soonest first
  filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return filtered;
}

// Helper function to get unique values for filters (e.g., countries, leagues for a sport)
// This would typically be done server-side with a real database.
export async function getFilterOptionsForSport(sport: string): Promise<{ countries: string[], leagues: string[] }> {
  await new Promise(resolve => setTimeout(resolve, 100)); // simulate delay
  const relevantMatches = mockMatches.filter(match => match.sport.toLowerCase() === sport.toLowerCase());
  const countries = Array.from(new Set(relevantMatches.map(m => m.country).filter(Boolean))) as string[];
  const leagues = Array.from(new Set(relevantMatches.map(m => m.league).filter(Boolean))) as string[];
  countries.sort();
  leagues.sort();
  return { countries, leagues };
}
