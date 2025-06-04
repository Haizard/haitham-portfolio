
// src/app/api/auth/google/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn("Google OAuth credentials are not fully configured for callback. This route may use simulation logic if the connect phase also simulated.");
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
  
  // If server credentials are not set up, but we received a code (implying /connect simulated success),
  // then we also simulate success for the callback to maintain a consistent dev experience for UI.
  if ((!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) && code) {
    console.warn("Google OAuth callback received code, but server credentials not fully configured. Simulating successful connection for UI consistency.");
    servicesPageUrl.searchParams.set('google_auth_simulated_success', 'true');
    return NextResponse.redirect(servicesPageUrl.toString());
  }
  
  // If full credentials are not available and there's no code (e.g. direct hit or misconfiguration),
  // redirect with a generic error or back to services page.
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.error("Google OAuth callback hit, but server credentials not configured and no auth code (or simulation path taken).");
    servicesPageUrl.searchParams.set('google_auth_error', 'server_config_incomplete');
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
    // - scope indicates the permissions granted.
    //
    // Example (conceptual - replace with your actual database logic):
    // const userId = await getUserIdFromSession(request); // You'll need a way to identify the current user
    // await db.storeUserGoogleTokens(userId, {
    //   accessToken: tokens.access_token,
    //   refreshToken: tokens.refresh_token,
    //   expiryDate: tokens.expiry_date, // Milliseconds since epoch
    //   scope: tokens.scope,
    // });
    console.log('Received Google Tokens (DEVELOPMENT ONLY - DO NOT LOG IN PRODUCTION):', {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        scope: tokens.scope,
    });
    if (tokens.refresh_token) {
      console.warn('IMPORTANT: A Google REFRESH TOKEN was received. This token is long-lived and highly sensitive. It MUST be stored securely and encrypted at rest. It should only be logged in a secure development environment for debugging purposes.');
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
