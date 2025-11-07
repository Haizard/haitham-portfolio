import { NextResponse, type NextRequest } from 'next/server';
import { generateUploadSignature } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/rbac';
import { z } from 'zod';

const signatureSchema = z.object({
  folder: z.string().default('booking-platform'),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validation = signatureSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Invalid signature request", 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { folder } = validation.data;

    const signature = generateUploadSignature(folder);

    if (!signature) {
      return NextResponse.json({ 
        message: "Failed to generate upload signature. Please check your Cloudinary configuration." 
      }, { status: 500 });
    }

    return NextResponse.json(signature);

  } catch (error: any) {
    console.error("[API /upload/signature POST] Error:", error);
    return NextResponse.json({ 
      message: `Signature generation failed: ${error.message || "Unknown error"}` 
    }, { status: 500 });
  }
}

