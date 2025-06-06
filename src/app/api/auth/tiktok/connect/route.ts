
// src/app/api/auth/tiktok/connect/route.ts
import { NextResponse, type NextRequest } from 'next/server';

const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI; // e.g., http://localhost:9002/api/auth/tiktok/callback
const TIKTOK_SCOPES = 'user.info.basic'; // Example scope, adjust as needed

export async function GET(request: NextRequest) {
  const useSimulation =
    !TIKTOK_CLIENT_ID || TIKTOK_CLIENT_ID === "YOUR_TIKTOK_CLIENT_ID" ||
    !TIKTOK_CLIENT_SECRET || TIKTOK_CLIENT_SECRET === "YOUR_TIKTOK_CLIENT_SECRET" ||
    !TIKTOK_REDIRECT_URI;

  if (useSimulation) {
    console.warn("TikTok OAuth Connect: Simulating connection due to missing/placeholder credentials. Redirecting directly to /social-media with simulation parameters.");
    
    const simulationParams = new URLSearchParams();
    simulationParams.set('tiktok_auth_simulated_success', 'true');
    simulationParams.set('username', 'simulated_tiktok_user');
    
    // Use a relative path for the redirect.
    const redirectPath = `/social-media?${simulationParams.toString()}`;
    return NextResponse.redirect(new URL(redirectPath, request.url).toString()); // Construct full URL for redirect
  }

  // Proceed with real OAuth flow
  console.log("TikTok OAuth Connect: Attempting real connection with configured credentials.");
  
  // CSRF Protection: Generate a random state string
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const tikTokAuthUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  tikTokAuthUrl.searchParams.set('client_key', TIKTOK_CLIENT_ID!); // TikTok uses client_key
  tikTokAuthUrl.searchParams.set('scope', TIKTOK_SCOPES);
  tikTokAuthUrl.searchParams.set('response_type', 'code');
  tikTokAuthUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI!);
  tikTokAuthUrl.searchParams.set('state', state);
  // TikTok specific: client_id is referred to as client_key by TikTok.
  // Optional: You might need additional parameters like 'prompt' depending on TikTok's requirements.

  const response = NextResponse.redirect(tikTokAuthUrl.toString());

  // Store the state in an HttpOnly cookie to verify it on callback
  response.cookies.set('tiktok_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use Secure in production
    sameSite: 'lax', // Lax is usually fine for OAuth redirects
    maxAge: 60 * 10, // 10 minutes validity for the state cookie
  });

  return response;
}
