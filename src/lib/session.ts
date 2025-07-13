// src/lib/session.ts
import { getIronSession, type IronSessionData } from "iron-session";
import { cookies } from "next/headers";
import type { UserRole } from "./auth-data";

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
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  createdAt: string;
};

// This is the shape of our session data.
export interface SessionData extends IronSessionData {
  user?: SessionUser;
}

// THIS IS THE PRIMARY FUNCTION to get the session.
// It can be used to read, write, and save the session in one go.
export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}
