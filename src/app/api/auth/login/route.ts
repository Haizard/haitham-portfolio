
import { NextResponse, type NextRequest } from 'next/server';
import { getFullUserByEmail, verifyPassword, updateLastLogin } from '@/lib/auth-data';
import { getSession, type SessionUser } from '@/lib/session';
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

    // Check for user and if the password hash exists and is a non-empty string.
    if (!user || !user.password) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    // Check if user account is suspended
    if (user.isSuspended) {
      return NextResponse.json({
        message: `Account suspended. ${user.suspensionReason || 'Please contact support.'}`
      }, { status: 403 });
    }

    // Check if user account is active
    if (!user.isActive) {
      return NextResponse.json({
        message: "Account is inactive. Please contact support."
      }, { status: 403 });
    }

    // Update last login time
    await updateLastLogin(user.id);

    // Explicitly create a serializable user object for the session.
    // This prevents any database-specific objects (like ObjectId) from being saved.
    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      roles: user.roles,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      membershipTier: user.membershipTier,
      createdAt: user.createdAt,
    };

    // Get the session, update it, and save it.
    const session = await getSession();
    session.user = sessionUser;
    await session.save();

    // Return session user and email verification status
    return NextResponse.json({
      user: sessionUser,
      requiresEmailVerification: !user.emailVerified,
    });

  } catch (error: any) {
    console.error("[API /login POST] Error:", error);
    // Return a generic JSON error response instead of letting the route crash
    return NextResponse.json({ message: `Login failed: An unexpected server error occurred.` }, { status: 500 });
  }
}
