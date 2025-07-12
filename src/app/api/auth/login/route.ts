
import { NextResponse, type NextRequest } from 'next/server';
import { getFullUserByEmail, verifyPassword } from '@/lib/auth-data';
import { saveSession, type SessionUser } from '@/lib/session';
import { z } from 'zod';
import { getFreelancerProfile } from '@/lib/user-profile-data';

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

    // Fetch the full profile to return to the client, which now expects it.
    const fullProfile = await getFreelancerProfile(user.id!);
    if (!fullProfile) {
        // This should not happen if a user exists, but it's a safe check.
        return NextResponse.json({ message: "Could not find user profile after login." }, { status: 500 });
    }
    
    // Return the full, serializable profile to the client
    return NextResponse.json(fullProfile);

  } catch (error: any) {
    console.error("[API /login POST] Error:", error);
    return NextResponse.json({ message: `Login failed: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
