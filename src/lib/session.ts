
// src/lib/session.ts
import { getIronSession, type IronSessionData } from "iron-session";
import { cookies } from "next/headers";
import type { User } from "./auth-data";

export const sessionOptions = {
  cookieName: "creatoros_session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

// Define the exact shape of the user object that is safe to store in the session.
// It must be fully serializable (no complex objects like `ObjectId` or `Date`).
// It contains only the core identity information.
export type SessionUser = Omit<User, 'password' | '_id'>;

// This is the shape of our session data.
export interface SessionData extends IronSessionData {
  user?: SessionUser;
}

// Helper to get the session from a server component/route handler
export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}

// Helper to save the session, now strongly typed to SessionUser
export async function saveSession(user: SessionUser) {
  const session = await getSession();
  session.user = user;
  await session.save();
  return session;
}

// Helper to destroy the session (logout)
export async function destroySession() {
    const session = await getSession();
    session.destroy();
    return session;
}
