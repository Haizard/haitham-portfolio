
import { NextResponse, type NextRequest } from 'next/server';
import { getAllServices, addService, type Service } from '@/lib/services-data';
import { z } from 'zod';

const testimonialSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerAvatar: z.string().url("Avatar URL must be valid").optional().or(z.literal('')),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
  rating: z.coerce.number().min(1).max(5).optional(),
  date: z.string().datetime({ message: "Invalid date format" }).optional().default(() => new Date().toISOString()),
});

const serviceCreateSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters."),
  price: z.string().refine(value => !isNaN(parseFloat(value)) && parseFloat(value) >= 0, {
    message: "Price must be a valid non-negative number.",
  }),
  duration: z.string().min(3, "Duration must be at least 3 characters (e.g., '30 min', '1 hour')."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Short description max 500 chars."),
  detailedDescription: z.string().optional(),
  howItWorks: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  offers: z.array(z.string()).optional(),
  securityInfo: z.string().optional(),
  imageUrl: z.string().url("Image URL must be a valid URL.").optional().or(z.literal('')),
  imageHint: z.string().max(50).optional().or(z.literal('')),
  testimonials: z.array(testimonialSchema).optional(),
  deliveryTime: z.string().max(50).optional().or(z.literal('')),
  revisionsIncluded: z.string().max(50).optional().or(z.literal('')),
});


export async function GET(request: NextRequest) {
  try {
    const allServicesData = await getAllServices();
    return NextResponse.json(allServicesData);
  } catch (error) {
    console.error("[API /api/services GET] Critical error in GET handler:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: `Failed to fetch services: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = serviceCreateSchema.safeParse(body);

    if (!validation.success) {
      console.error("API Service Create Validation Error:", validation.error.flatten());
      return NextResponse.json({ message: "Invalid service data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const serviceData = validation.data as Omit<Service, 'id' | '_id' | 'slug'>;
    
    const addedService = await addService(serviceData);
    return NextResponse.json(addedService, { status: 201 });

  } catch (error: any) {
    console.error("[API /api/services POST] Failed to create service:", error);
    let errorMessage = "Failed to create service due to an unknown error";
    if (error instanceof Error) {
        errorMessage = `Failed to create service: ${error.message}`;
    } else if (typeof error === 'string') {
        errorMessage = `Failed to create service: ${error}`;
    }
    const statusCode = error.message?.includes('already exists') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
