
import { NextResponse, type NextRequest } from 'next/server';
import { createUser, getFullUserByEmail, type UserRole } from '@/lib/auth-data';
import { saveSession, type SessionUser } from '@/lib/session';
import { z } from 'zod';
import { createFreelancerProfileIfNotExists, getFreelancerProfile } from '@/lib/user-profile-data';
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
    
    // The role combination logic is now handled inside createUser
    const createdUser = await createUser({ name, email, password, roles });

    // Step 2: Create associated profiles. These run after the main user is confirmed to be created.
    if (createdUser.roles.includes('freelancer') || createdUser.roles.includes('vendor')) {
        await createFreelancerProfileIfNotExists(createdUser.id!, { name, email, roles: createdUser.roles, storeName: `${name}'s Store` });
    }
    if (createdUser.roles.includes('client')) {
        await createClientProfileIfNotExists(createdUser.id!, { name });
    }
    
    // Construct the session user object from the clean, database-sourced record.
    const sessionUser: SessionUser = {
      id: createdUser.id!,
      name: createdUser.name,
      email: createdUser.email,
      roles: createdUser.roles,
      createdAt: createdUser.createdAt,
    };
    
    await saveSession(sessionUser);

    return NextResponse.json(sessionUser);

  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("[API /signup POST] Error:", error);
    return NextResponse.json({ message: `Signup failed: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
