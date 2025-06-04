
// src/app/api/auth/google/connect/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // e.g., http://localhost:9002/api/auth/google/callback

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn("Google OAuth credentials are not fully configured. Connection will be simulated.");
}

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    // Simulate success if not configured, allows frontend to proceed with mock state
    // In a real scenario with missing creds, you might redirect to an error page
    // or show a message on the frontend before attempting connection.
    // For now, to allow the frontend simulation to work if creds are missing:
    const servicesPageUrl = new URL('/services', request.nextUrl.origin);
    servicesPageUrl.searchParams.set('google_auth_simulated_success', 'true');
    return NextResponse.redirect(servicesPageUrl.toString());
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly', // View calendars
    'https://www.googleapis.com/auth/calendar.events.readonly', // View events
    // Add 'https://www.googleapis.com/auth/calendar.events' if you need to write events
    // Add 'https://www.googleapis.com/auth/userinfo.email' and 'https://www.googleapis.com/auth/userinfo.profile'
    // if you want to get user's profile info.
  ];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    scope: scopes,
    include_granted_scopes: true,
    // prompt: 'consent', // Optional: forces the consent screen every time, useful for testing refresh tokens
  });

  return NextResponse.redirect(authorizationUrl);
}
