
// src/app/api/auth/tiktok/connect/route.ts
import { NextResponse, type NextRequest } from 'next/server';

const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;
// TikTok specific scopes. Refer to TikTok Developer documentation for available scopes.
// Example scopes: user.info.basic, video.list
const TIKTOK_SCOPES = 'user.info.basic'; 

export async function GET(request: NextRequest) {
  // Base URL for redirects back to our app's social media page
  const baseAppRedirectUrl = request.nextUrl.clone();
  baseAppRedirectUrl.pathname = '/social-media';
  // Clear all existing search params from the original request URL, as we'll set specific ones for the redirect
  baseAppRedirectUrl.searchParams.forEach((_, key) => baseAppRedirectUrl.searchParams.delete(key));


  if (!TIKTOK_CLIENT_ID || TIKTOK_CLIENT_ID === "YOUR_TIKTOK_CLIENT_ID" || !TIKTOK_REDIRECT_URI) {
    console.warn("TikTok OAuth credentials (TIKTOK_CLIENT_ID, TIKTOK_REDIRECT_URI) are not fully configured. Simulating successful connection for UI development.");
    
    baseAppRedirectUrl.searchParams.set('tiktok_auth_simulated_success', 'true');
    baseAppRedirectUrl.searchParams.set('username', 'simulated_tiktok_user'); 
    return NextResponse.redirect(baseAppRedirectUrl.toString());
  }

  const state = Math.random().toString(36).substring(2); // Example CSRF token
  
  // IMPORTANT: The following URL is a GUESS for TikTok's authorization endpoint.
  // You MUST replace this with the official TikTok authorization URL from their developer documentation.
  const tikTokAuthUrl = new URL("https://www.tiktok.com/v2/auth/authorize"); // Placeholder base
  tikTokAuthUrl.searchParams.set('client_key', TIKTOK_CLIENT_ID);
  tikTokAuthUrl.searchParams.set('scope', TIKTOK_SCOPES);
  tikTokAuthUrl.searchParams.set('response_type', 'code');
  tikTokAuthUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI);
  tikTokAuthUrl.searchParams.set('state', state);
  
  const response = NextResponse.redirect(tikTokAuthUrl.toString());
  response.cookies.set('tiktok_oauth_state', state, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 10 }); // 10 min expiry
  
  return response;
}

