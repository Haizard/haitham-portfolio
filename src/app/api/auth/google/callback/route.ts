
// src/app/api/auth/google/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn("Google OAuth credentials are not fully configured for callback. This route will use simulation logic.");
}

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const servicesPageUrl = new URL('/services', request.nextUrl.origin);

  if (error) {
    console.error("Error from Google OAuth callback:", error);
    servicesPageUrl.searchParams.set('google_auth_error', error);
    return NextResponse.redirect(servicesPageUrl.toString());
  }
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    // This case handles if credentials were not set up, but somehow callback was hit.
    // Or if connect route simulated success.
    console.error("Google OAuth callback hit, but server credentials not configured.");
    servicesPageUrl.searchParams.set('google_auth_simulated_success', 'true'); // Maintain frontend simulation
    return NextResponse.redirect(servicesPageUrl.toString());
  }

  if (!code) {
    console.error("Authorization code missing from Google callback.");
    servicesPageUrl.searchParams.set('google_auth_error', 'code_missing');
    return NextResponse.redirect(servicesPageUrl.toString());
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // --- TODO: Securely Store Tokens ---
    // In a real application, you MUST securely store these tokens (especially tokens.refresh_token)
    // in a database, associated with the logged-in user.
    // - access_token is short-lived.
    // - refresh_token can be used to get new access_tokens and is long-lived (store it very securely).
    // - expiry_date indicates when the access_token expires.
    // Example: await db.storeUserGoogleTokens(userId, {
    //   accessToken: tokens.access_token,
    //   refreshToken: tokens.refresh_token,
    //   expiryDate: tokens.expiry_date,
    //   scope: tokens.scope,
    // });
    console.log('Received Google Tokens (DO NOT LOG IN PRODUCTION):', tokens);
    if (tokens.refresh_token) {
      console.log('Received Refresh Token (STORE SECURELY!):', tokens.refresh_token);
    }
    // --- End TODO ---

    servicesPageUrl.searchParams.set('google_auth_success', 'true');
    return NextResponse.redirect(servicesPageUrl.toString());

  } catch (err: any) {
    console.error("Error exchanging Google OAuth code for tokens:", err.message || err);
    servicesPageUrl.searchParams.set('google_auth_error', 'token_exchange_failed');
    return NextResponse.redirect(servicesPageUrl.toString());
  }
}
