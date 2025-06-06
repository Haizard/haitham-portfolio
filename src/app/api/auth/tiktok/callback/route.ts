
// src/app/api/auth/tiktok/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server';

const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state'); // State from TikTok's redirect

  // Base URL for redirects back to our app's social media page
  // Ensure request.nextUrl.origin is valid
  let origin = request.nextUrl.origin;
  if (!origin || origin === "null") {
      console.warn("TikTok OAuth Callback: request.nextUrl.origin is null or invalid. Falling back to relative path for redirects.");
      origin = ""; // Will result in relative redirects
  }
  const baseAppRedirectUrl = new URL(`${origin}/social-media`);


  // Clear the CSRF state cookie
  const responseHeaders = new Headers();
  const clearCookieHeader = `tiktok_oauth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  responseHeaders.append('Set-Cookie', clearCookieHeader);

  // CSRF Protection: Compare state from TikTok with the one stored in cookie
  const storedState = request.cookies.get('tiktok_oauth_state')?.value;
  if (!state || !storedState || state !== storedState) {
    console.error("TikTok OAuth Callback: State mismatch or missing state. Potential CSRF attack.");
    baseAppRedirectUrl.searchParams.set('tiktok_auth_error', 'state_mismatch');
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });
  }

  if (error) {
    console.error("TikTok OAuth Callback: Error received from TikTok:", error);
    baseAppRedirectUrl.searchParams.set('tiktok_auth_error', error);
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });
  }

  // Determine if we should simulate token exchange
  const useSimulation =
    !TIKTOK_CLIENT_ID || TIKTOK_CLIENT_ID === "YOUR_TIKTOK_CLIENT_ID" ||
    !TIKTOK_CLIENT_SECRET || TIKTOK_CLIENT_SECRET === "YOUR_TIKTOK_CLIENT_SECRET" ||
    !TIKTOK_REDIRECT_URI;

  if (useSimulation && code) { // Simulate if code is present but creds are placeholders/missing
    console.warn("TikTok OAuth Callback: Simulating token exchange due to missing/placeholder credentials.");
    baseAppRedirectUrl.searchParams.set('tiktok_auth_simulated_success', 'true');
    baseAppRedirectUrl.searchParams.set('username', 'simulated_tiktok_user');
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });
  }

  if (!code) {
    console.error("TikTok OAuth Callback: Authorization code missing from TikTok's response.");
    baseAppRedirectUrl.searchParams.set('tiktok_auth_error', 'code_missing');
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });
  }

  // Proceed with real token exchange
  console.log("TikTok OAuth Callback: Attempting real token exchange with code:", code);
  try {
    // TODO: Implement actual token exchange with TikTok's API
    // Example structure:
    // const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/"; // Check official documentation for the correct endpoint
    // const tokenRequestBody = new URLSearchParams({
    //   client_key: TIKTOK_CLIENT_ID!,
    //   client_secret: TIKTOK_CLIENT_SECRET!,
    //   code: code,
    //   grant_type: 'authorization_code',
    //   redirect_uri: TIKTOK_REDIRECT_URI!,
    // });
    // const tokenResponse = await fetch(tokenUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: tokenRequestBody.toString(),
    // });
    // if (!tokenResponse.ok) {
    //   const errorBody = await tokenResponse.text();
    //   throw new Error(`TikTok token exchange failed with status ${tokenResponse.status}: ${errorBody}`);
    // }
    // const tokens = await tokenResponse.json();
    // const accessToken = tokens.access_token;
    // const refreshToken = tokens.refresh_token; // Store this securely if available and needed
    // console.log("TikTok OAuth Callback: Tokens received (simulated/placeholder)", tokens);

    // TODO: Fetch user profile from TikTok API using the access token
    // const userProfileUrl = "https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name,avatar_url"; // Example fields
    // const userProfileResponse = await fetch(userProfileUrl, {
    //   headers: { 'Authorization': `Bearer ${accessToken}` }
    // });
    // if (!userProfileResponse.ok) {
    //   const errorBody = await userProfileResponse.text();
    //   throw new Error(`TikTok user profile fetch failed with status ${userProfileResponse.status}: ${errorBody}`);
    // }
    // const userProfile = await userProfileResponse.json();
    // const username = userProfile.data?.username || userProfile.username || 'real_tiktok_user_from_api';
    // console.log("TikTok OAuth Callback: User profile fetched (simulated/placeholder)", userProfile);

    // TODO: Securely Store Tokens (accessToken, refreshToken, user identifiers) in your database, associated with the user.

    // For now, simulating success after these placeholder TODOs for real API calls
    const username = 'real_tiktok_user_placeholder_after_api_call';

    baseAppRedirectUrl.searchParams.set('tiktok_auth_success', 'true');
    baseAppRedirectUrl.searchParams.set('username', username);
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });

  } catch (err: any) {
    console.error("TikTok OAuth Callback: Error during token exchange or profile fetch:", err.message || err);
    baseAppRedirectUrl.searchParams.set('tiktok_auth_error', 'token_exchange_failed');
    if (err.message) {
      baseAppRedirectUrl.searchParams.append('error_details', err.message);
    }
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });
  }
}
