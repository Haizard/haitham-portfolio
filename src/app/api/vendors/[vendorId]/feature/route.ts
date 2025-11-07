
import { NextResponse, type NextRequest } from 'next/server';
import { updateVendorFeaturedStatus } from '@/lib/user-profile-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const featureUpdateSchema = z.object({
  isFeatured: z.boolean(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    // TODO: Add robust admin authentication
    const { vendorId } = await params;
    if (!ObjectId.isValid(vendorId)) {
        return NextResponse.json({ message: "Invalid Vendor ID format." }, { status: 400 });
    }

    const body = await request.json();
    const validation = featureUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid data provided.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { isFeatured } = validation.data;

    const updatedVendor = await updateVendorFeaturedStatus(vendorId, isFeatured);
    if (!updatedVendor) {
      return NextResponse.json({ message: "Vendor not found or update failed." }, { status: 404 });
    }
    
    return NextResponse.json({ message: `Vendor featured status updated.`, vendor: updatedVendor });

  } catch (error: any) {
    console.error(`[API /vendors/${params.vendorId}/feature PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update vendor featured status: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
