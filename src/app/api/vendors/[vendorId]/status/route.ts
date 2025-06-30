
import { NextResponse, type NextRequest } from 'next/server';
import { updateVendorStatus, type VendorStatus } from '@/lib/user-profile-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    // TODO: Add authentication to ensure only admins can update status
    const { vendorId } = params;
    if (!ObjectId.isValid(vendorId)) {
        return NextResponse.json({ message: "Invalid Vendor ID format." }, { status: 400 });
    }

    const body = await request.json();
    const validation = statusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid status provided.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { status } = validation.data;

    const updatedVendor = await updateVendorStatus(vendorId, status);
    if (!updatedVendor) {
      return NextResponse.json({ message: "Vendor not found or update failed." }, { status: 404 });
    }
    
    return NextResponse.json({ message: `Vendor status updated to ${status}.`, vendor: updatedVendor });

  } catch (error: any) {
    console.error(`[API /vendors/${params.vendorId}/status PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update vendor status: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
