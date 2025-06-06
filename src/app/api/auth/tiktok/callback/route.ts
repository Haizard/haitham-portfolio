
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

  const redirectBaseRelative = '/social-media';
  let redirectUrl = new URL(redirectBaseRelative, request.url);
  redirectUrl.search = ''; // Clear existing params before adding new ones

  const responseHeaders = new Headers();
  const clearCookieHeader = `tiktok_oauth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  responseHeaders.append('Set-Cookie', clearCookieHeader);

  const storedState = request.cookies.get('tiktok_oauth_state')?.value;
  if (!state || !storedState || state !== storedState) {
    console.error("TikTok OAuth Callback: State mismatch or missing state.");
    redirectUrl.searchParams.set('tiktok_auth_error', 'state_mismatch');
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }

  if (error) {
    console.error("TikTok OAuth Callback: Error received from TikTok:", error);
    redirectUrl.searchParams.set('tiktok_auth_error', error);
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }

  // Simulation should be true if ID or Secret are missing or are the exact placeholder strings
  const useSimulationForTokenExchange =
    !TIKTOK_CLIENT_ID || TIKTOK_CLIENT_ID === "YOUR_TIKTOK_CLIENT_ID" ||
    !TIKTOK_CLIENT_SECRET || TIKTOK_CLIENT_SECRET === "YOUR_TIKTOK_CLIENT_SECRET";

  if (useSimulationForTokenExchange && code) {
    console.warn("TikTok OAuth Callback: Simulating token exchange due to missing/placeholder Client ID/Secret and received code.");
    redirectUrl.searchParams.set('tiktok_auth_simulated_success', 'true');
    redirectUrl.searchParams.set('username', 'simulated_tiktok_user_from_callback');
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }
  
  if (!code) {
    console.error("TikTok OAuth Callback: Authorization code missing.");
    redirectUrl.searchParams.set('tiktok_auth_error', 'code_missing');
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }

  // Proceed with real token exchange
  if (!useSimulationForTokenExchange) {
    console.log("TikTok OAuth Callback: Attempting real token exchange with code:", code);
    try {
      // TODO: Implement actual token exchange with TikTok's API (POST request)
      // Example structure:
      /*
      const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/";
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
      if (!tokenResponse.ok || tokens.error) {
        throw new Error(tokens.error_description || tokens.error?.message || 'Token exchange failed');
      }
      const accessToken = tokens.access_token;
      const openId = tokens.open_id;

      // TODO: Fetch user profile from TikTok API using the access token
      const userProfileUrl = `https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name,avatar_url`;
      const userProfileResponse = await fetch(userProfileUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
      const userProfile = await userProfileResponse.json();
      if (!userProfileResponse.ok || userProfile.error?.code) {
        throw new Error(userProfile.error.message || 'User profile fetch failed');
      }
      const username = userProfile.data?.user?.username || 'tiktok_user_via_api';
      
      // TODO: Securely Store Tokens (accessToken, refreshToken) and open_id for the user.
      */
      
      // For now, simulating success after these placeholder TODOs for the "real" path
      const username = 'real_tiktok_user_placeholder'; 
      
      redirectUrl.searchParams.set('tiktok_auth_success', 'true');
      redirectUrl.searchParams.set('username', username);
      return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });

    } catch (err: any) {
      console.error("TikTok OAuth Callback: Error during real token exchange/profile fetch:", err.message || err);
      redirectUrl.searchParams.set('tiktok_auth_error', 'token_exchange_failed');
      if (err.message) redirectUrl.searchParams.append('error_details', err.message);
      return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
    }
  } else {
    console.warn("TikTok OAuth Callback: In simulation mode but no code received, or connect route didn't simulate properly.");
    redirectUrl.searchParams.set('tiktok_auth_error', 'simulation_issue_no_code_at_callback');
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }
}
