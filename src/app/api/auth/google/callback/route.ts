
// src/app/api/auth/google/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { google } from 'googleapis';

// TODO: Ensure these match the ones in connect/route.ts and are from your .env.local
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn("Google OAuth credentials are not fully configured for callback. This route will be a placeholder.");
}

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    // In a real app, redirect to an error page or the services page with an error message.
    // For simulation, just acknowledge.
    console.error("Google OAuth callback hit, but credentials not configured.");
    // For simulation, redirect to the services page indicating success,
    // as the frontend is already simulating the connection.
    // In a real app, this redirect would happen *after* successful token exchange.
    const servicesPageUrl = new URL('/services', request.nextUrl.origin);
    servicesPageUrl.searchParams.set('google_auth_simulated_success', 'true');
    return NextResponse.redirect(servicesPageUrl.toString());
  }

  if (!code) {
    return NextResponse.json({ error: "Authorization code missing from Google callback." }, { status: 400 });
  }

  try {
    // TODO: In a real application:
    // 1. Exchange authorization code for tokens
    // const { tokens } = await oauth2Client.getToken(code);
    // oauth2Client.setCredentials(tokens);

    // 2. Securely store the tokens (access_token, refresh_token, expiry_date, scope)
    //    These should be associated with the logged-in user, typically in a database.
    //    Example: await saveUserTokens(userId, tokens);
    //    Refresh token is particularly important for long-term access.

    // 3. Redirect the user back to the services page or a success page
    //    e.g., return NextResponse.redirect(new URL('/services?google_connected=true', request.url));
    
    // For placeholder, we'll simulate successful token exchange and redirect.
    console.log("Received Google OAuth code (simulated token exchange):", code);
    // This redirect simulates that the backend process was successful.
    // The frontend 'services' page doesn't currently listen for this query param,
    // but it's good practice for a real callback.
    const servicesPageUrl = new URL('/services', request.nextUrl.origin);
    servicesPageUrl.searchParams.set('google_auth_success', 'true');
    return NextResponse.redirect(servicesPageUrl.toString());

  } catch (error) {
    console.error("Error exchanging Google OAuth code for tokens:", error);
    // TODO: Redirect to an error page or the services page with an error message
    return NextResponse.json({ error: "Failed to exchange authorization code for tokens." }, { status: 500 });
  }
}
