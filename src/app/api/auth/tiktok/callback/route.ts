
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

  // Base URL for redirects back to our app's social media page
  const baseAppRedirectUrl = request.nextUrl.clone();
  baseAppRedirectUrl.pathname = '/social-media';
  // Clear all existing search params from the original request URL for a clean redirect
  baseAppRedirectUrl.searchParams.forEach((_, key) => baseAppRedirectUrl.searchParams.delete(key));

  const storedState = request.cookies.get('tiktok_oauth_state')?.value;
  
  const responseHeaders = new Headers();
  // Ensure cookie is cleared on all paths from this callback
  const clearCookieHeader = `tiktok_oauth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  responseHeaders.append('Set-Cookie', clearCookieHeader);


  if (!state || state !== storedState) {
    console.error("TikTok OAuth callback state mismatch or missing state.");
    baseAppRedirectUrl.searchParams.set('tiktok_auth_error', 'state_mismatch');
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });
  }

  if (error) {
    console.error("Error from TikTok OAuth callback:", error);
    baseAppRedirectUrl.searchParams.set('tiktok_auth_error', error);
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });
  }

  if (
    (!TIKTOK_CLIENT_ID || TIKTOK_CLIENT_ID === "YOUR_TIKTOK_CLIENT_ID" || 
     !TIKTOK_CLIENT_SECRET || TIKTOK_CLIENT_SECRET === "YOUR_TIKTOK_CLIENT_SECRET" ||
     !TIKTOK_REDIRECT_URI) && code
  ) {
    console.warn("TikTok OAuth callback received code, but server credentials not fully configured. Simulating successful token exchange for UI consistency.");
    baseAppRedirectUrl.searchParams.set('tiktok_auth_simulated_success', 'true');
    baseAppRedirectUrl.searchParams.set('username', 'simulated_tiktok_user'); 
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });
  }

  if (!code) {
    console.error("Authorization code missing from TikTok callback.");
    baseAppRedirectUrl.searchParams.set('tiktok_auth_error', 'code_missing');
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });
  }
  
  try {
    // --- TODO: Actual Token Exchange with TikTok ---
    // const tokenResponse = await fetch('ACTUAL_TIKTOK_TOKEN_ENDPOINT_URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: new URLSearchParams({
    //     client_id: TIKTOK_CLIENT_ID!,
    //     client_secret: TIKTOK_CLIENT_SECRET!,
    //     code: code,
    //     grant_type: 'authorization_code',
    //     redirect_uri: TIKTOK_REDIRECT_URI!,
    //   }),
    // });
    // if (!tokenResponse.ok) { /* ... handle error ... */ }
    // const tokens = await tokenResponse.json();
    // const accessToken = tokens.access_token;
    // --- End TODO ---

    // --- TODO: Securely Store Tokens ---
    // console.log('Simulated TikTok Tokens:', { accessToken: "simulated_access_token" });
    // --- End TODO ---

    // --- TODO: Fetch User Profile from TikTok API ---
    // const userProfileResponse = await fetch('ACTUAL_TIKTOK_USER_PROFILE_ENDPOINT_URL', { headers: { 'Authorization': `Bearer ${accessToken}` } });
    // if (!userProfileResponse.ok) { /* ... handle error ... */ }
    // const userProfile = await userProfileResponse.json();
    // const username = userProfile.username || 'real_tiktok_user'; 
    // --- End TODO ---
    
    const username = 'real_tiktok_user_placeholder'; // Placeholder for actual fetched username

    baseAppRedirectUrl.searchParams.set('tiktok_auth_success', 'true');
    baseAppRedirectUrl.searchParams.set('username', username);
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });

  } catch (err: any) {
    console.error("Error during TikTok OAuth token exchange or profile fetch:", err.message || err);
    baseAppRedirectUrl.searchParams.set('tiktok_auth_error', 'token_exchange_failed');
    return NextResponse.redirect(baseAppRedirectUrl.toString(), { headers: responseHeaders });
  }
}
