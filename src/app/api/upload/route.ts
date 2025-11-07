import { NextResponse, type NextRequest } from 'next/server';
import { uploadImage, uploadAvatar } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/rbac';
import { z } from 'zod';

const uploadSchema = z.object({
  file: z.string().min(1, "File data is required."),
  type: z.enum(['avatar', 'image']).default('image'),
  folder: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const body = await request.json();
    const validation = uploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Invalid upload data", 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { file, type, folder } = validation.data;

    let result;

    if (type === 'avatar') {
      result = await uploadAvatar(file, user.id);
    } else {
      result = await uploadImage(file, folder);
    }

    if (!result) {
      return NextResponse.json({ 
        message: "Failed to upload file. Please check your Cloudinary configuration." 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: "File uploaded successfully!",
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
    });

  } catch (error: any) {
    console.error("[API /upload POST] Error:", error);
    return NextResponse.json({ 
      message: `File upload failed: ${error.message || "Unknown error"}` 
    }, { status: 500 });
  }
}

