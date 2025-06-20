
import { NextResponse, type NextRequest } from 'next/server';
import { getServiceById, getServiceBySlug, updateService, deleteService, type Service } from '@/lib/services-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const testimonialUpdateSchema = z.object({
  id: z.string().optional(), 
  customerName: z.string().min(1, "Customer name is required"),
  customerAvatar: z.string().url("Avatar URL must be valid").optional().or(z.literal('')),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
  rating: z.coerce.number().min(1).max(5).optional(),
  date: z.string().datetime({ message: "Invalid date format" }).optional(),
});

const serviceUpdateSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters.").optional(),
  price: z.string().refine(value => !isNaN(parseFloat(value)) && parseFloat(value) >= 0, {
    message: "Price must be a valid non-negative number.",
  }).optional(),
  duration: z.string().min(3, "Duration must be at least 3 characters.").optional(),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500).optional(),
  detailedDescription: z.string().optional().or(z.literal('')),
  howItWorks: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  offers: z.array(z.string()).optional(),
  securityInfo: z.string().optional().or(z.literal('')),
  imageUrl: z.string().url("Image URL must be valid").optional().or(z.literal('')), 
  imageHint: z.string().max(50).optional().or(z.literal('')),
  testimonials: z.array(testimonialUpdateSchema).optional(),
  deliveryTime: z.string().max(50).optional().or(z.literal('')),
  revisionsIncluded: z.string().max(50).optional().or(z.literal('')),
});


export async function GET(
  request: NextRequest,
  { params }: { params: { serviceId: string } } 
) {
  try {
    const idOrSlug = params.serviceId;
    let service: Service | null = null;

    if (ObjectId.isValid(idOrSlug)) {
      service = await getServiceById(idOrSlug);
    }
    
    if (!service) {
      service = await getServiceBySlug(idOrSlug);
    }

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
    if (!ObjectId.isValid(serviceId)) {
      return NextResponse.json({ message: "Invalid service ID format for update." }, { status: 400 });
    }
    const body = await request.json();
    
    const validation = serviceUpdateSchema.safeParse(body);
    if(!validation.success) {
      console.error("API Service Update Validation Error:", validation.error.flatten());
      return NextResponse.json({ message: "Invalid service data for update", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updates = validation.data as Partial<Omit<Service, 'id' | '_id' | 'slug'>>;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    
    const updatedService = await updateService(serviceId, updates);

    if (updatedService) {
      return NextResponse.json(updatedService);
    } else {
      return NextResponse.json({ message: "Service not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Failed to update service ${params.serviceId}:`, error);
    const errorMessage = error.message || `Failed to update service ${params.serviceId}`;
    const statusCode = errorMessage.includes('conflict') || errorMessage.includes('already exists') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const serviceId = params.serviceId;
     if (!ObjectId.isValid(serviceId)) {
        return NextResponse.json({ message: "Invalid service ID format for delete." }, { status: 400 });
    }
    const success = await deleteService(serviceId);

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
