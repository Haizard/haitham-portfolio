// src/lib/session.ts
import { getIronSession, type IronSessionData } from "iron-session";
import { cookies } from "next/headers";
import type { UserRole } from "./auth-data";

// This is the one and only place where the session secret is read.
// We must ensure it's defined, otherwise the app is misconfigured.
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET environment variable is not set or is too short. Please add a secret of at least 32 characters to your .env file."
  );
}

export const sessionOptions = {
  cookieName: "ajira_online_session",
  password: SESSION_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

// Define the exact shape of the user object that is safe to store in the session.
// It must be fully serializable (no complex objects like `ObjectId` or `Date`).
// It contains only the core identity information.
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: UserRole[];
  emailVerified: boolean;
  phoneVerified: boolean;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: string;
};

// This is the shape of our session data.
export interface SessionData extends IronSessionData {
  user?: SessionUser;
}

// THIS IS THE PRIMARY FUNCTION to get the session.
// It can be used to read, write, and save the session in one go.
export async function getSession() {
  // In Next.js 15, cookies() must be awaited before accessing its methods
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}
