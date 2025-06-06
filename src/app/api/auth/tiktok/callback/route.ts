
// src/app/api/auth/tiktok/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server';

const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  const socialMediaPageUrl = new URL('/social-media', request.nextUrl.origin);

  const storedState = request.cookies.get('tiktok_oauth_state')?.value;
  if (!state || state !== storedState) {
    console.error("TikTok OAuth callback state mismatch or missing state.");
    socialMediaPageUrl.searchParams.set('tiktok_auth_error', 'state_mismatch');
    // Clear the invalid state cookie
    const response = NextResponse.redirect(socialMediaPageUrl.toString());
    response.cookies.delete('tiktok_oauth_state');
    return response;
  }
  // Clear the state cookie after verification
  const clearStateResponse = NextResponse.redirect(socialMediaPageUrl.toString()); // Temporary, will be overwritten
  clearStateResponse.cookies.delete('tiktok_oauth_state');


  if (error) {
    console.error("Error from TikTok OAuth callback:", error);
    socialMediaPageUrl.searchParams.set('tiktok_auth_error', error);
    return NextResponse.redirect(socialMediaPageUrl.toString(), { headers: clearStateResponse.headers });
  }

  // If server secrets are not set up, but we received a code (implying /connect simulated success OR real TikTok sent code but we can't process),
  // then we also simulate success for the callback to maintain a consistent dev experience for UI.
  if (
    (!TIKTOK_CLIENT_ID || TIKTOK_CLIENT_ID === "YOUR_TIKTOK_CLIENT_ID" || 
     !TIKTOK_CLIENT_SECRET || TIKTOK_CLIENT_SECRET === "YOUR_TIKTOK_CLIENT_SECRET" ||
     !TIKTOK_REDIRECT_URI) && code
  ) {
    console.warn("TikTok OAuth callback received code, but server credentials not fully configured. Simulating successful token exchange for UI consistency.");
    socialMediaPageUrl.searchParams.set('tiktok_auth_simulated_success', 'true');
    socialMediaPageUrl.searchParams.set('username', 'simulated_tiktok_user'); // Provide a simulated username
    return NextResponse.redirect(socialMediaPageUrl.toString(), { headers: clearStateResponse.headers });
  }

  if (!code) {
    console.error("Authorization code missing from TikTok callback.");
    socialMediaPageUrl.searchParams.set('tiktok_auth_error', 'code_missing');
    return NextResponse.redirect(socialMediaPageUrl.toString(), { headers: clearStateResponse.headers });
  }
  
  // --- TODO: Actual Token Exchange with TikTok ---
  try {
    // const tokenResponse = await fetch('TIKTOK_TOKEN_ENDPOINT_URL', { // Replace with actual TikTok token endpoint
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     // Potentially 'Authorization': 'Basic ' + btoa(TIKTOK_CLIENT_ID + ':' + TIKTOK_CLIENT_SECRET) if required by TikTok
    //   },
    //   body: new URLSearchParams({
    //     client_id: TIKTOK_CLIENT_ID!,
    //     client_secret: TIKTOK_CLIENT_SECRET!,
    //     code: code,
    //     grant_type: 'authorization_code',
    //     redirect_uri: TIKTOK_REDIRECT_URI!,
    //   }),
    // });

    // if (!tokenResponse.ok) {
    //   const errorData = await tokenResponse.json();
    //   throw new Error(errorData.error_description || errorData.error || 'Failed to exchange token with TikTok');
    // }
    // const tokens = await tokenResponse.json();
    // const accessToken = tokens.access_token;
    // const refreshToken = tokens.refresh_token; // If provided

    // --- TODO: Securely Store Tokens (accessToken, refreshToken) ---
    // Associate these tokens with the logged-in user in your database.
    // e.g., await db.storeUserTikTokTokens(userId, { accessToken, refreshToken, expiry: tokens.expires_in });
    // console.log('Simulated TikTok Tokens:', { accessToken: "simulated_access_token", refreshToken: "simulated_refresh_token" });

    // --- TODO: Fetch User Profile from TikTok API using Access Token ---
    // const userProfileResponse = await fetch('TIKTOK_USER_PROFILE_ENDPOINT_URL', { // Replace with actual TikTok user info endpoint
    //   headers: { 'Authorization': `Bearer ${accessToken}` }
    // });
    // if (!userProfileResponse.ok) {
    //   throw new Error('Failed to fetch TikTok user profile');
    // }
    // const userProfile = await userProfileResponse.json();
    // const username = userProfile.username || userProfile.display_name || 'tiktok_user'; // Adjust based on TikTok API response
    
    // For simulation:
    const username = 'real_tiktok_user_placeholder'; // Replace with actual fetched username

    socialMediaPageUrl.searchParams.set('tiktok_auth_success', 'true');
    socialMediaPageUrl.searchParams.set('username', username);
    return NextResponse.redirect(socialMediaPageUrl.toString(), { headers: clearStateResponse.headers });

  } catch (err: any) {
    console.error("Error during TikTok OAuth token exchange or profile fetch:", err.message || err);
    socialMediaPageUrl.searchParams.set('tiktok_auth_error', 'token_exchange_failed');
    return NextResponse.redirect(socialMediaPageUrl.toString(), { headers: clearStateResponse.headers });
  }
}
