
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

// This is the shape of our session data
export interface SessionData extends IronSessionData {
  user?: Omit<User, 'password'>; // Don't store password in session
}

// Helper to get the session from a server component/route handler
export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}

// Helper to save the session
export async function saveSession(user: Omit<User, 'password'>) { // Accepts user object without password
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
