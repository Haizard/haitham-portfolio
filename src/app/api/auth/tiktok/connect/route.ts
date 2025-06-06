
// src/app/api/auth/tiktok/connect/route.ts
import { NextResponse, type NextRequest } from 'next/server';

const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;
// TikTok specific scopes. Refer to TikTok Developer documentation for available scopes.
// Example scopes: user.info.basic, video.list
const TIKTOK_SCOPES = 'user.info.basic'; 

export async function GET(request: NextRequest) {
  const socialMediaPageUrl = new URL('/social-media', request.nextUrl.origin);

  if (!TIKTOK_CLIENT_ID || TIKTOK_CLIENT_ID === "YOUR_TIKTOK_CLIENT_ID" || !TIKTOK_REDIRECT_URI) {
    console.warn("TikTok OAuth credentials (TIKTOK_CLIENT_ID, TIKTOK_REDIRECT_URI) are not fully configured. Simulating successful connection for UI development.");
    // Simulate success redirect for UI testing if creds are missing/placeholders
    socialMediaPageUrl.searchParams.set('tiktok_auth_simulated_success', 'true');
    socialMediaPageUrl.searchParams.set('username', 'simulated_tiktok_user'); // Provide a simulated username
    return NextResponse.redirect(socialMediaPageUrl.toString());
  }

  // --- TODO: Replace with TikTok's actual authorization endpoint and parameters ---
  // This is a placeholder structure. Consult TikTok's developer documentation.
  // Typically, you'd need:
  // - client_key (your client ID)
  // - scope (permissions you're requesting)
  // - response_type=code
  // - redirect_uri
  // - state (a unique, unguessable string to prevent CSRF, which you should generate and verify in callback)
  const state = Math.random().toString(36).substring(2); // Example CSRF token, store this in session/cookie to verify later
  
  // Store state in a cookie to verify in callback
  const response = NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize?client_key=${TIKTOK_CLIENT_ID}&scope=${TIKTOK_SCOPES}&response_type=code&redirect_uri=${encodeURIComponent(TIKTOK_REDIRECT_URI!)}&state=${state}`
    // The above URL is a GUESS. You MUST use the official TikTok URL.
  );
  response.cookies.set('tiktok_oauth_state', state, { path: '/', httpOnly: true, maxAge: 60 * 10 }); // 10 min expiry
  
  return response;
}
