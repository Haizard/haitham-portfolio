
// src/app/api/auth/tiktok/connect/route.ts
import { NextResponse, type NextRequest } from 'next/server';

const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;
// TikTok specific scopes. Refer to TikTok Developer documentation for available scopes.
// Example scopes: user.info.basic, video.list. For Login Kit, 'user.info.basic' is common.
const TIKTOK_SCOPES = 'user.info.basic';

export async function GET(request: NextRequest) {
  // Determine if we should simulate or attempt real OAuth
  const useSimulation =
    !TIKTOK_CLIENT_ID || TIKTOK_CLIENT_ID === "YOUR_TIKTOK_CLIENT_ID" ||
    !TIKTOK_CLIENT_SECRET || TIKTOK_CLIENT_SECRET === "YOUR_TIKTOK_CLIENT_SECRET" ||
    !TIKTOK_REDIRECT_URI;

  if (useSimulation) {
    console.warn("TikTok OAuth Connect: Simulating connection due to missing/placeholder credentials.");
    // Construct the simulation redirect URL carefully and explicitly
    // Ensure request.nextUrl.origin is valid in this environment
    let origin = request.nextUrl.origin;
    if (!origin || origin === "null") { // Fallback if origin is not correctly detected
        console.warn("TikTok OAuth Connect: request.nextUrl.origin is null or invalid. Falling back to relative path for simulation redirect. This might not work if base path is configured.");
        const simulationRedirectUrl = new URL('/social-media', 'http://localhost'); // Generic base
        simulationRedirectUrl.pathname = '/social-media'; // Ensure correct path
        simulationRedirectUrl.searchParams.set('tiktok_auth_simulated_success', 'true');
        simulationRedirectUrl.searchParams.set('username', 'simulated_tiktok_user');
         // This might not be ideal if deployed, but necessary if origin detection fails
        return NextResponse.redirect(simulationRedirectUrl.pathname + simulationRedirectUrl.search);
    }

    const simulationRedirectUrl = new URL('/social-media', origin);
    simulationRedirectUrl.searchParams.set('tiktok_auth_simulated_success', 'true');
    simulationRedirectUrl.searchParams.set('username', 'simulated_tiktok_user');
    return NextResponse.redirect(simulationRedirectUrl.toString());
  }

  // Proceed with real OAuth flow
  console.log("TikTok OAuth Connect: Attempting real connection with configured credentials.");
  const state = Math.random().toString(36).substring(7); // Generate a random state string

  // Official TikTok Login Kit v2 authorization endpoint
  const tikTokAuthUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  tikTokAuthUrl.searchParams.set('client_key', TIKTOK_CLIENT_ID); // TikTok uses 'client_key'
  tikTokAuthUrl.searchParams.set('scope', TIKTOK_SCOPES);
  tikTokAuthUrl.searchParams.set('response_type', 'code');
  tikTokAuthUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI);
  tikTokAuthUrl.searchParams.set('state', state);
  // Optional: If using TikTok Login Kit for Business API, you might need 'service_id'
  // tikTokAuthUrl.searchParams.set('service_id', YOUR_TIKTOK_LOGIN_KIT_SERVICE_ID);

  const response = NextResponse.redirect(tikTokAuthUrl.toString());

  // Store the state in a cookie for CSRF protection
  response.cookies.set('tiktok_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10 // 10 minutes
  });

  return response;
}
