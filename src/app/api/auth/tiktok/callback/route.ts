
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

  const redirectBaseRelative = '/social-media';
  let redirectUrl = new URL(redirectBaseRelative, request.url); // Base for relative redirects

  // Prepare headers for clearing cookie
  const responseHeaders = new Headers();
  const clearCookieHeader = `tiktok_oauth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  responseHeaders.append('Set-Cookie', clearCookieHeader);


  // Validate CSRF state
  const storedState = request.cookies.get('tiktok_oauth_state')?.value;
  if (!state || !storedState || state !== storedState) {
    console.error("TikTok OAuth Callback: State mismatch or missing state. Potential CSRF attack.");
    redirectUrl.searchParams.set('tiktok_auth_error', 'state_mismatch');
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }

  if (error) {
    console.error("TikTok OAuth Callback: Error received from TikTok:", error);
    redirectUrl.searchParams.set('tiktok_auth_error', error);
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }

  const useSimulation =
    !TIKTOK_CLIENT_ID || TIKTOK_CLIENT_ID === "YOUR_TIKTOK_CLIENT_ID" ||
    !TIKTOK_CLIENT_SECRET || TIKTOK_CLIENT_SECRET === "YOUR_TIKTOK_CLIENT_SECRET" ||
    !TIKTOK_REDIRECT_URI;

  // If in simulation mode (because connect route likely simulated too due to missing creds)
  // AND we received a code (which connect route's simulation might not send, but real TikTok would)
  if (useSimulation && code) {
    console.warn("TikTok OAuth Callback: Simulating token exchange due to missing/placeholder credentials and received code.");
    redirectUrl.searchParams.set('tiktok_auth_simulated_success', 'true');
    redirectUrl.searchParams.set('username', 'simulated_tiktok_user_from_callback');
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }
  
  if (!code) {
    console.error("TikTok OAuth Callback: Authorization code missing from TikTok's response.");
    redirectUrl.searchParams.set('tiktok_auth_error', 'code_missing');
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }

  // Proceed with real token exchange if not in simulation mode
  if (!useSimulation) {
    console.log("TikTok OAuth Callback: Attempting real token exchange with code:", code);
    try {
      // TODO: Implement actual token exchange with TikTok's API
      // This involves a POST request to TikTok's token endpoint with client_id, client_secret, code, redirect_uri, grant_type.
      // Example (conceptual - refer to TikTok documentation for actual fields and endpoint):
      /*
      const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/"; // Check TikTok docs for the correct V2 endpoint
      const tokenRequestBody = new URLSearchParams({
        client_key: TIKTOK_CLIENT_ID!,
        client_secret: TIKTOK_CLIENT_SECRET!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI!,
      });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenRequestBody.toString(),
      });

      const tokens = await tokenResponse.json();
      if (!tokenResponse.ok || tokens.error) { // TikTok might use 'error' or 'error_description' or specific error codes
        throw new Error(tokens.error_description || tokens.error?.message || 'Token exchange failed with TikTok');
      }
      const accessToken = tokens.access_token;
      // const refreshToken = tokens.refresh_token; // If available and needed
      // const openId = tokens.open_id; // TikTok user's unique ID

      // TODO: Fetch user profile from TikTok API using the access token
      // Example (conceptual - refer to TikTok documentation):
      const userProfileUrl = `https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name,avatar_url`;
      const userProfileResponse = await fetch(userProfileUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const userProfile = await userProfileResponse.json();
      if (!userProfileResponse.ok || userProfile.error?.code) { // Check for error structure from TikTok
        throw new Error(userProfile.error.message || 'User profile fetch failed');
      }
      const username = userProfile.data?.user?.username || 'tiktok_user_via_api'; // Adjust based on actual API response
      */

      // For now, simulating success after these placeholder TODOs
      const username = 'real_tiktok_user_placeholder'; // Replace with actual username from API
      
      // TODO: Securely Store Tokens (accessToken, refreshToken) and open_id in your database, associated with your app's user.

      redirectUrl.searchParams.set('tiktok_auth_success', 'true');
      redirectUrl.searchParams.set('username', username);
      return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });

    } catch (err: any) {
      console.error("TikTok OAuth Callback: Error during real token exchange or profile fetch:", err.message || err);
      redirectUrl.searchParams.set('tiktok_auth_error', 'token_exchange_failed');
      if (err.message) redirectUrl.searchParams.append('error_details', err.message);
      return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
    }
  } else {
    // This case should ideally not be hit if connect route handles simulation properly.
    // But as a fallback if somehow callback is hit in simulation mode without a code.
    console.warn("TikTok OAuth Callback: In simulation mode but no code received, or connect route didn't simulate properly.");
    redirectUrl.searchParams.set('tiktok_auth_error', 'simulation_issue_no_code');
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }
}
