import { NextResponse, type NextRequest } from 'next/server';
import { getUserById, updateUserProfile } from '@/lib/auth-data';
import { requireAuth } from '@/lib/rbac';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  phone: z.string().optional(),
  avatar: z.string().url("Avatar must be a valid URL.").optional(),
  preferences: z.object({
    language: z.string().optional(),
    currency: z.string().optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

// GET /api/user/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: sessionUser } = authResult;
    
    // Fetch full user profile from database
    const user = await getUserById(sessionUser.id);

    if (!user) {
      return NextResponse.json({ 
        message: "User not found." 
      }, { status: 404 });
    }

    // Return user profile without password
    const { password, emailVerificationToken, ...userProfile } = user;

    return NextResponse.json(userProfile);

  } catch (error: any) {
    console.error("[API /user/profile GET] Error:", error);
    return NextResponse.json({ 
      message: `Failed to fetch profile: ${error.message || "Unknown error"}` 
    }, { status: 500 });
  }
}

// PATCH /api/user/profile - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: sessionUser } = authResult;

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Invalid profile data", 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const updates = validation.data;

    // Update user profile
    const updatedUser = await updateUserProfile(sessionUser.id, updates);

    if (!updatedUser) {
      return NextResponse.json({ 
        message: "Failed to update profile." 
      }, { status: 500 });
    }

    // Return updated profile without sensitive data
    const { password, emailVerificationToken, ...userProfile } = updatedUser;

    return NextResponse.json({
      message: "Profile updated successfully!",
      user: userProfile,
    });

  } catch (error: any) {
    console.error("[API /user/profile PATCH] Error:", error);
    return NextResponse.json({ 
      message: `Failed to update profile: ${error.message || "Unknown error"}` 
    }, { status: 500 });
  }
}

