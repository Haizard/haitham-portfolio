
import { NextResponse, type NextRequest } from 'next/server';
import { createUser, type UserRole } from '@/lib/auth-data';
import { saveSession, type SessionUser } from '@/lib/session';
import { z } from 'zod';
import { createFreelancerProfileIfNotExists } from '@/lib/user-profile-data';
import { createClientProfileIfNotExists } from '@/lib/client-profile-data';

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  roles: z.array(z.enum(['client', 'freelancer', 'vendor'])).min(1, "At least one role must be selected."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid signup data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, roles } = validation.data;
    
    // Add 'creator' role if 'freelancer' or 'vendor' is selected
    const finalRoles: UserRole[] = Array.from(new Set([...roles, ...(roles.some(r => ['freelancer', 'vendor'].includes(r)) ? ['creator'] : [])]));


    const user = await createUser({ name, email, password, roles: finalRoles });
    
    // After creating the user, create their associated role profiles
    if (user.roles.includes('freelancer') || user.roles.includes('vendor')) {
        await createFreelancerProfileIfNotExists(user.id!, { name, email, storeName: `${name}'s Store` });
    }
    if (user.roles.includes('client')) {
        await createClientProfileIfNotExists(user.id!, { name });
    }
    
    // Create a clean, serializable user object for the session.
    const sessionUser: SessionUser = {
      id: user.id!,
      name: user.name,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt,
    };
    
    // Save the clean session user object
    await saveSession(sessionUser);

    // Return the sanitized sessionUser object, just like the login route.
    // This is the key fix to prevent non-serializable data from crashing the response.
    return NextResponse.json(sessionUser);

  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("[API /signup POST] Error:", error);
    // Return a proper JSON error response instead of letting the server crash
    return NextResponse.json({ message: `Signup failed: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
