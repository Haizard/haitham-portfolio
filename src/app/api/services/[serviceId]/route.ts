
import { NextResponse, type NextRequest } from 'next/server';
import { getServiceById, updateService, deleteService, type Service } from '@/lib/services-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const serviceId = params.serviceId;
    const service = getServiceById(serviceId);

    if (service) {
      return NextResponse.json(service);
    } else {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to fetch service ${params.serviceId}:`, error);
    return NextResponse.json({ message: `Failed to fetch service ${params.serviceId}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const serviceId = params.serviceId;
    const body = await request.json();
    
    // Construct the updates object carefully to ensure type safety
    // and only include fields that are actually part of the Service model.
    const updates: Partial<Omit<Service, 'id'>> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.price !== undefined) updates.price = String(body.price); // Ensure price is string
    if (body.duration !== undefined) updates.duration = body.duration;
    if (body.description !== undefined) updates.description = body.description;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    
    // Validate required fields for update, if any (though PUT usually allows partial updates)
    // For example, if name was mandatory for an update:
    // if (updates.name !== undefined && typeof updates.name !== 'string') {
    //   return NextResponse.json({ message: "Invalid name format" }, { status: 400 });
    // }

    const updatedService = updateService(serviceId, updates);

    if (updatedService) {
      return NextResponse.json(updatedService);
    } else {
      return NextResponse.json({ message: "Service not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Failed to update service ${params.serviceId}:`, error);
    return NextResponse.json({ message: error.message || `Failed to update service ${params.serviceId}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const serviceId = params.serviceId;
    const success = deleteService(serviceId);

    if (success) {
      return NextResponse.json({ message: "Service deleted successfully" });
    } else {
      return NextResponse.json({ message: "Service not found or delete failed" }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to delete service ${params.serviceId}:`, error);
    return NextResponse.json({ message: `Failed to delete service ${params.serviceId}` }, { status: 500 });
  }
}
