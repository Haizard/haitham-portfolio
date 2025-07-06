
import { NextResponse, type NextRequest } from 'next/server';
import { createUser, getFullUserByEmail, type UserRole } from '@/lib/auth-data';
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

    // Step 1: Create the core user and profile records
    const createdUser = await createUser({ name, email, password, roles: finalRoles });
    
    if (createdUser.roles.includes('freelancer') || createdUser.roles.includes('vendor')) {
        await createFreelancerProfileIfNotExists(createdUser.id!, { name, email, storeName: `${name}'s Store` });
    }
    if (createdUser.roles.includes('client')) {
        await createClientProfileIfNotExists(createdUser.id!, { name });
    }
    
    // Step 2: Re-fetch the user directly from the database.
    // This is the most robust way to ensure we have a clean, serializable object,
    // mirroring the exact logic of the working login route.
    const userFromDb = await getFullUserByEmail(email);
    if (!userFromDb) {
        // This should never happen if createUser succeeded, but it's a safeguard.
        throw new Error("Critical error: Failed to retrieve newly created user from database.");
    }

    // Step 3: Create the session object from the clean, database-fetched record.
    const sessionUser: SessionUser = {
      id: userFromDb.id!,
      name: userFromDb.name,
      email: userFromDb.email,
      roles: userFromDb.roles,
      createdAt: userFromDb.createdAt,
    };
    
    // Step 4: Save the session and return the clean user object to the client.
    await saveSession(sessionUser);
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
