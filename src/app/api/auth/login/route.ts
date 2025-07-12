
import { NextResponse, type NextRequest } from 'next/server';
import { getFullUserByEmail, verifyPassword } from '@/lib/auth-data';
import { saveSession, type SessionUser } from '@/lib/session';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid login data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;
    const user = await getFullUserByEmail(email);

    if (!user || !user.password) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }
    
    // Explicitly create a serializable user object for the session.
    // This prevents any database-specific objects (like ObjectId) from being saved.
    const sessionUser: SessionUser = {
      id: user.id!,
      name: user.name,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt,
    };
    
    await saveSession(sessionUser);

    // Return just the serializable session user, not the full profile.
    // The client-side UserProvider will now use this directly.
    return NextResponse.json(sessionUser);

  } catch (error: any) {
    console.error("[API /login POST] Error:", error);
    return NextResponse.json({ message: `Login failed: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
