
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

  const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
  const FOOTBALL_DATA_ORG_KEY = process.env.FOOTBALL_DATA_ORG_KEY;
  const USE_LIVE_API_FOOTBALL = false; 
  const USE_LIVE_FOOTBALL_DATA_ORG = false;

  let liveMatches: UpcomingMatch[] = [];
  let attemptedLiveFetch = false;

  // --- Primary API Attempt: API-Football ---
  if (USE_LIVE_API_FOOTBALL && API_FOOTBALL_KEY && filters.sport.toLowerCase() === 'football') {
    attemptedLiveFetch = true;
    try {
      console.log(`[fetchUpcomingMatches LIVE] Attempting to fetch live football fixtures from API-Football for sport: ${filters.sport}`);
      // const today = new Date().toISOString().split('T')[0];
      // const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      // let apiUrl = `https://v3.football.api-sports.io/fixtures?date=${today}&to=${nextWeek}`; // Example: fixtures for today
      // if (filters.league) { // You'd need a mapping from league name to API-Football league ID
      //   const leagueId = mapLeagueNameToApiFootballId(filters.league); 
      //   if(leagueId) apiUrl = `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${new Date().getFullYear()}&status=NS`; // NS = Not Started
      // } else if (filters.country) {
      //   // API-Football often better by league ID. Country might be less direct.
      // }

      // const response = await fetch(apiUrl, {
      //   method: "GET",
      //   headers: {
      //     "x-rapidapi-host": "v3.football.api-sports.io",
      //     "x-rapidapi-key": API_FOOTBALL_KEY
      //   }
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`API-Football request failed: ${response.status} ${response.statusText} - ${errorData?.message || JSON.stringify(errorData.errors)}`);
      // }

      // const data = await response.json();
      // liveMatches = data.response.map((fixture: any) => ({ // Highly conceptual mapping
      //   id: fixture.fixture.id.toString(),
      //   sport: "Football",
      //   description: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
      //   teamA: fixture.teams.home.name,
      //   teamB: fixture.teams.away.name,
      //   date: fixture.fixture.date, 
      //   time: new Date(fixture.fixture.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
      //   competition: fixture.league.name,
      //   league: fixture.league.name,
      //   country: fixture.league.country,
      //   location: fixture.fixture.venue.name || fixture.fixture.venue.city,
      // }));
      console.log(`[fetchUpcomingMatches LIVE] Successfully fetched ${liveMatches.length} live matches from API-Football.`);
      
      // If liveMatches has data, apply filters and return
      if (liveMatches.length > 0) {
        let filteredLive = liveMatches;
        if (filters.country && filters.country.trim() !== "") {
            filteredLive = filteredLive.filter(match => match.country?.toLowerCase().includes(filters.country!.toLowerCase()));
        }
        if (filters.league && filters.league.trim() !== "") {
            filteredLive = filteredLive.filter(match => match.league?.toLowerCase().includes(filters.league!.toLowerCase()));
        }
        return filteredLive.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }

    } catch (error) {
      console.error("[fetchUpcomingMatches LIVE] Error fetching live data from API-Football:", error);
      liveMatches = []; // Ensure it's empty on error
    }
  }

  // --- Fallback API Attempt: Football-Data.org (if API-Football failed or wasn't used and live data is desired for Football) ---
  if (filters.sport.toLowerCase() === 'football' && USE_LIVE_FOOTBALL_DATA_ORG && FOOTBALL_DATA_ORG_KEY && (!USE_LIVE_API_FOOTBALL || (USE_LIVE_API_FOOTBALL && liveMatches.length === 0))) {
    attemptedLiveFetch = true;
    try {
        console.log(`[fetchUpcomingMatches LIVE FALLBACK] Attempting to fetch live football fixtures from Football-Data.org for sport: ${filters.sport}`);
        // Football-Data.org usually requires competition codes.
        // Example: Fetching matches for Premier League (code PL)
        // let competitionCode = "PL"; // Default or map from filters.league
        // if (filters.league) {
        //    const mappedCode = mapLeagueNameToFootballDataOrgCode(filters.league);
        //    if (mappedCode) competitionCode = mappedCode;
        // }
        // const apiUrl = `https://api.football-data.org/v4/competitions/${competitionCode}/matches?status=SCHEDULED`;
        
        // const response = await fetch(apiUrl, {
        //     method: "GET",
        //     headers: {
        //         "X-Auth-Token": FOOTBALL_DATA_ORG_KEY
        //     }
        // });

        // if (!response.ok) {
        //     const errorData = await response.json();
        //     throw new Error(`Football-Data.org request failed: ${response.status} ${response.statusText} - ${errorData?.message || JSON.stringify(errorData.error)}`);
        // }
        // const data = await response.json();
        // liveMatches = data.matches.map((match: any) => ({ // Highly conceptual mapping
        //     id: match.id.toString(),
        //     sport: "Football",
        //     description: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        //     teamA: match.homeTeam.name,
        //     teamB: match.awayTeam.name,
        //     date: match.utcDate,
        //     time: new Date(match.utcDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
        //     competition: match.competition.name,
        //     league: match.competition.name, // Or more specific if available
        //     country: match.competition.area.name, // Usually country is part of area
        //     location: match.venue || "N/A",
        // }));
        console.log(`[fetchUpcomingMatches LIVE FALLBACK] Successfully fetched ${liveMatches.length} live matches from Football-Data.org.`);
        
        // If liveMatches has data, apply filters and return
        if (liveMatches.length > 0) {
            let filteredLive = liveMatches;
            if (filters.country && filters.country.trim() !== "") {
                filteredLive = filteredLive.filter(m => m.country?.toLowerCase().includes(filters.country!.toLowerCase()));
            }
            if (filters.league && filters.league.trim() !== "") {
                filteredLive = filteredLive.filter(m => m.league?.toLowerCase().includes(filters.league!.toLowerCase()));
            }
            return filteredLive.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
    } catch (error) {
        console.error("[fetchUpcomingMatches LIVE FALLBACK] Error fetching live data from Football-Data.org:", error);
        liveMatches = []; // Ensure it's empty on error
    }
  }
  
  if (attemptedLiveFetch && liveMatches.length === 0) {
    console.warn("[fetchUpcomingMatches] Live API fetch attempted but yielded no results. Falling back to mock data.");
  }


  // --- Return Mock Data if live APIs are not used or fail ---
  console.log("[fetchUpcomingMatches MOCK] Using mock data for upcoming matches.");
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
export async function getFilterOptionsForSport(sport: string): Promise<{ countries: string[], leagues: string[] }> {
  await new Promise(resolve => setTimeout(resolve, 100)); // simulate delay
  const relevantMatches = mockMatches.filter(match => match.sport.toLowerCase() === sport.toLowerCase());
  const countries = Array.from(new Set(relevantMatches.map(m => m.country).filter(Boolean))) as string[];
  const leagues = Array.from(new Set(relevantMatches.map(m => m.league).filter(Boolean))) as string[];
  countries.sort();
  leagues.sort();
  return { countries, leagues };
}

// Placeholder mapping functions - you would need to implement these based on API responses
// function mapLeagueNameToApiFootballId(leagueName: string): string | null { /* ... map ... */ return null; }
// function mapLeagueNameToFootballDataOrgCode(leagueName: string): string | null { /* ... map ... */ return null; }
