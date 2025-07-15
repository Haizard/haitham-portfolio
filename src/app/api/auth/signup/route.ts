
import { NextResponse, type NextRequest } from 'next/server';
import { createUser, type UserRole } from '@/lib/auth-data';
import { getSession, type SessionUser } from '@/lib/session';
import { z } from 'zod';
import { createFreelancerProfileIfNotExists } from '@/lib/user-profile-data';
import { createClientProfileIfNotExists } from '@/lib/client-profile-data';

const roleEnum = z.enum(['client', 'freelancer', 'vendor', 'delivery_agent'], {
    required_error: "You must select a role."
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: roleEnum,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid signup data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, role } = validation.data;
    
    // The roles array will now contain just the single selected role.
    const roles: UserRole[] = [role];

    // Step 1: Create the core user account.
    const createdUser = await createUser({ name, email, password, roles });

    // Step 2: Create associated profiles based on the single role.
    if (createdUser.roles.includes('freelancer') || createdUser.roles.includes('vendor') || createdUser.roles.includes('delivery_agent')) {
        await createFreelancerProfileIfNotExists(createdUser.id, { name, email, roles: createdUser.roles, storeName: `${name}'s Store` });
    }
    if (createdUser.roles.includes('client')) {
        await createClientProfileIfNotExists(createdUser.id, { name, email });
    }
    
    // Step 3: Construct a clean, serializable session user object.
    const sessionUser: SessionUser = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      roles: createdUser.roles,
      createdAt: createdUser.createdAt,
    };
    
    // Step 4: Get session, update it, and save.
    const session = await getSession();
    session.user = sessionUser;
    await session.save();

    // Return the session user object to the client.
    return NextResponse.json(sessionUser);

  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("[API /signup POST] Error:", error);
    return NextResponse.json({ message: `Signup failed: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
