

import { NextResponse, type NextRequest } from 'next/server';
import { getAllTours, addTour, getTourFilterOptions, type TourPackage } from '@/lib/tours-data';
import { z } from 'zod';
// TODO: Add admin authentication middleware

const tourCreateSchema = z.object({
  name: z.string().min(3),
  duration: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),
  tourType: z.string().min(3),
  tags: z.array(z.string()).min(1),
  itinerary: z.array(z.string()).min(1),
  inclusions: z.array(z.string()).min(1),
  exclusions: z.array(z.string()).min(1),
  price: z.coerce.number().positive(),
  featuredImageUrl: z.string().url(),
  galleryImages: z.array(z.object({ url: z.string().url(), caption: z.string().optional() })).optional().default([]),
  highlights: z.array(z.object({ icon: z.string().optional(), text: z.string() })).optional(),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  mapEmbedUrl: z.string().url().optional(),
  isActive: z.boolean(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
        locations: searchParams.get('locations')?.split(','),
        tourTypes: searchParams.get('tourTypes')?.split(','),
        durations: searchParams.get('durations')?.split(','),
        minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
        maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
        excludeSlug: searchParams.get('excludeSlug') || undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    };

    const [tours, filterOptions] = await Promise.all([
      getAllTours(filters),
      getTourFilterOptions()
    ]);
    
    // For the public page, we return both tours and the options for filters
    return NextResponse.json({ tours, filterOptions });

  } catch (error: any) {
    console.error("[API /api/tours GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch tours: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = tourCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid tour data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const newTour = await addTour(validation.data as Omit<TourPackage, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'slug'>);
    return NextResponse.json(newTour, { status: 201 });

  } catch (error: any) {
    console.error("[API /api/tours POST] Error:", error);
    return NextResponse.json({ message: `Failed to create tour: ${error.message}` }, { status: 500 });
  }
}
