
// src/app/api/auth/google/connect/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // e.g., http://localhost:9002/api/auth/google/callback

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn("Google OAuth credentials are not fully configured. Connection will be simulated if initiated from UI.");
}

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  // If credentials are not configured, and this route is hit,
  // it implies a direct attempt or a misconfiguration.
  // The frontend services page simulates success if creds are missing when its button is clicked.
  // This route will only proceed with real auth if creds are present.
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    const servicesPageUrl = new URL('/services', request.nextUrl.origin);
    // Fallback to simulated success if this route is hit without credentials,
    // maintaining consistency with frontend simulation logic.
    servicesPageUrl.searchParams.set('google_auth_simulated_success', 'true');
    console.error("Google OAuth connect route hit, but server credentials are not configured. Simulating success for redirect.");
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
