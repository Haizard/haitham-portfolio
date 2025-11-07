import { NextResponse, type NextRequest } from 'next/server';
import { resendVerificationEmail } from '@/lib/auth-data';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';

const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resendVerificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Invalid email data", 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { email } = validation.data;
    
    const result = await resendVerificationEmail(email);

    if (!result) {
      return NextResponse.json({
        message: "User not found or email already verified."
      }, { status: 400 });
    }

    // Send verification email
    await sendVerificationEmail(email, result.token, result.user.name);

    return NextResponse.json({
      message: "Verification email sent! Please check your inbox.",
    });

  } catch (error: any) {
    console.error("[API /resend-verification POST] Error:", error);
    return NextResponse.json({ 
      message: `Failed to resend verification email: ${error.message || "Unknown error"}` 
    }, { status: 500 });
  }
}

