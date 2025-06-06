
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

  const redirectBase = '/social-media';
  const responseHeaders = new Headers();
  // Ensure cookie is cleared by setting an expiry date in the past
  const clearCookieHeader = `tiktok_oauth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  responseHeaders.append('Set-Cookie', clearCookieHeader);

  const storedState = request.cookies.get('tiktok_oauth_state')?.value;
  if (!state || !storedState || state !== storedState) {
    console.error("TikTok OAuth Callback: State mismatch or missing state. Potential CSRF attack.");
    const errorParams = new URLSearchParams();
    errorParams.set('tiktok_auth_error', 'state_mismatch');
    return NextResponse.redirect(`${redirectBase}?${errorParams.toString()}`, { headers: responseHeaders });
  }

  if (error) {
    console.error("TikTok OAuth Callback: Error received from TikTok:", error);
    const errorParams = new URLSearchParams();
    errorParams.set('tiktok_auth_error', error);
    return NextResponse.redirect(`${redirectBase}?${errorParams.toString()}`, { headers: responseHeaders });
  }

  const useSimulation =
    !TIKTOK_CLIENT_ID || TIKTOK_CLIENT_ID === "YOUR_TIKTOK_CLIENT_ID" ||
    !TIKTOK_CLIENT_SECRET || TIKTOK_CLIENT_SECRET === "YOUR_TIKTOK_CLIENT_SECRET" ||
    !TIKTOK_REDIRECT_URI;

  if (useSimulation && code) {
    console.warn("TikTok OAuth Callback: Simulating token exchange due to missing/placeholder credentials.");
    const successParams = new URLSearchParams();
    successParams.set('tiktok_auth_simulated_success', 'true');
    successParams.set('username', 'simulated_tiktok_user'); // Add a simulated username
    return NextResponse.redirect(`${redirectBase}?${successParams.toString()}`, { headers: responseHeaders });
  }

  if (!code) {
    console.error("TikTok OAuth Callback: Authorization code missing from TikTok's response.");
    const errorParams = new URLSearchParams();
    errorParams.set('tiktok_auth_error', 'code_missing');
    return NextResponse.redirect(`${redirectBase}?${errorParams.toString()}`, { headers: responseHeaders });
  }

  // Proceed with real token exchange
  console.log("TikTok OAuth Callback: Attempting real token exchange with code:", code);
  try {
    // TODO: Implement actual token exchange with TikTok's API
    // const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/";
    // const tokenRequestBody = new URLSearchParams({ /* ... TikTok specific params ... */ });
    // const tokenResponse = await fetch(tokenUrl, { method: 'POST', /* ... */ });
    // const tokens = await tokenResponse.json();
    // if (!tokenResponse.ok || tokens.error) throw new Error(tokens.error_description || 'Token exchange failed');
    // const accessToken = tokens.access_token;

    // TODO: Fetch user profile from TikTok API using the access token
    // const userProfileUrl = "https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name";
    // const userProfileResponse = await fetch(userProfileUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
    // const userProfile = await userProfileResponse.json();
    // if (!userProfileResponse.ok || userProfile.error) throw new Error(userProfile.error.message || 'User profile fetch failed');
    // const username = userProfile.data?.username || 'tiktok_user_from_api';
    
    // For now, simulating success after these placeholder TODOs
    const username = 'real_tiktok_user_via_api_placeholder'; // Replace with actual username from API

    // TODO: Securely Store Tokens (accessToken, refreshToken) in your database.

    const successParams = new URLSearchParams();
    successParams.set('tiktok_auth_success', 'true');
    successParams.set('username', username);
    return NextResponse.redirect(`${redirectBase}?${successParams.toString()}`, { headers: responseHeaders });

  } catch (err: any) {
    console.error("TikTok OAuth Callback: Error during token exchange or profile fetch:", err.message || err);
    const errorParams = new URLSearchParams();
    errorParams.set('tiktok_auth_error', 'token_exchange_failed');
    if (err.message) errorParams.append('error_details', err.message);
    return NextResponse.redirect(`${redirectBase}?${errorParams.toString()}`, { headers: responseHeaders });
  }
}
