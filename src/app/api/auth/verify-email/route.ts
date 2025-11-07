import { NextResponse, type NextRequest } from 'next/server';
import { verifyEmailWithToken } from '@/lib/auth-data';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Invalid verification data", 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { token } = validation.data;
    
    const user = await verifyEmailWithToken(token);

    if (!user) {
      return NextResponse.json({ 
        message: "Invalid or expired verification token." 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      message: "Email verified successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      }
    });

  } catch (error: any) {
    console.error("[API /verify-email POST] Error:", error);
    return NextResponse.json({ 
      message: `Email verification failed: ${error.message || "Unknown error"}` 
    }, { status: 500 });
  }
}

