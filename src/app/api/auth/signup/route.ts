
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
    
    const finalRoles: UserRole[] = Array.from(new Set([...roles, ...(roles.some(r => ['freelancer', 'vendor'].includes(r)) ? ['creator'] : [])]));

    // Step 1: Create the core user. This will throw an error if the email exists, which is handled by the catch block.
    const createdUser = await createUser({ name, email, password, roles: finalRoles });

    // Step 2: Create associated profiles. These run after the main user is confirmed to be created.
    if (finalRoles.includes('freelancer') || finalRoles.includes('vendor')) {
        await createFreelancerProfileIfNotExists(createdUser.id!, { name, email, storeName: `${name}'s Store` });
    }
    if (finalRoles.includes('client')) {
        await createClientProfileIfNotExists(createdUser.id!, { name });
    }
    
    // Step 3 (Crucial Fix): Re-fetch the user record directly from the database AFTER all creation operations.
    // This ensures we have a clean, serializable object from the DB driver, free of any in-memory artifacts.
    const userFromDb = await getFullUserByEmail(email);
    if (!userFromDb) {
        // This should never happen if createUser succeeded, but it's a critical safeguard.
        throw new Error("Critical error: Failed to retrieve newly created user from database.");
    }

    // Step 4: Construct the session user object from the clean, database-sourced record.
    const sessionUser: SessionUser = {
      id: userFromDb.id!,
      name: userFromDb.name,
      email: userFromDb.email,
      roles: userFromDb.roles,
      createdAt: userFromDb.createdAt,
    };
    
    // Step 5: Save the session and return the clean user object to the client.
    await saveSession(sessionUser);

    return NextResponse.json(sessionUser);

  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("[API /signup POST] Error:", error);
    // This is the line that probably returns HTML on a server crash
    return NextResponse.json({ message: `Signup failed: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
