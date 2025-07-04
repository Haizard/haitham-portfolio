
import { NextResponse, type NextRequest } from 'next/server';
import { getFullUserByEmail, verifyPassword } from '@/lib/auth-data';
import { saveSession } from '@/lib/session';
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
    
    // Remove password from the user object before creating session
    const { password: _, ...userToSave } = user;

    await saveSession(userToSave);

    return NextResponse.json(userToSave);

  } catch (error: any) {
    console.error("[API /login POST] Error:", error);
    return NextResponse.json({ message: `Login failed: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
