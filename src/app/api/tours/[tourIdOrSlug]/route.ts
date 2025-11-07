
import { NextResponse, type NextRequest } from 'next/server';
import { getTourById, getTourBySlug, updateTour, deleteTour, type TourPackage } from '@/lib/tours-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { requireVendor } from '@/lib/auth-middleware';

const tourUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  duration: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  itinerary: z.array(z.string()).min(1).optional(),
  inclusions: z.array(z.string()).min(1).optional(),
  exclusions: z.array(z.string()).min(1).optional(),
  price: z.coerce.number().positive().optional(),
  featuredImageUrl: z.string().url().optional(),
  galleryImages: z.array(z.object({ url: z.string().url(), caption: z.string().optional() })).optional(),
  isActive: z.boolean().optional(),
  // New fields
  guideId: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
});


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tourIdOrSlug: string }> }
) {
  try {
    const { tourIdOrSlug: idOrSlug } = await params;
    let tour: TourPackage | null = null;

    if (ObjectId.isValid(idOrSlug)) {
        tour = await getTourById(idOrSlug);
    }
    if (!tour) {
        tour = await getTourBySlug(idOrSlug);
    }

    if (!tour) {
      return NextResponse.json({ message: "Tour package not found" }, { status: 404 });
    }
    return NextResponse.json(tour);

  } catch (error: any) {
    console.error(`[API /api/tours GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch tour: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tourIdOrSlug: string }> }
) {
  // Check authentication - only admin or vendor can update tours
  const authError = await requireVendor();
  if (authError) return authError;

  try {
    const { tourIdOrSlug } = await params;
    if (!ObjectId.isValid(tourIdOrSlug)) {
        return NextResponse.json({ message: "Invalid Tour ID format." }, { status: 400 });
    }
    const body = await request.json();
    const validation = tourUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid tour update data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedTour = await updateTour(tourIdOrSlug, validation.data);

    if (!updatedTour) {
      return NextResponse.json({ message: "Tour not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedTour);

  } catch (error: any) {
    console.error(`[API /api/tours PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update tour: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tourIdOrSlug: string }> }
) {
  // Check authentication - only admin or vendor can delete tours
  const authError = await requireVendor();
  if (authError) return authError;

  try {
     const { tourIdOrSlug } = await params;
     if (!ObjectId.isValid(tourIdOrSlug)) {
        return NextResponse.json({ message: "Invalid Tour ID format." }, { status: 400 });
    }
    const success = await deleteTour(tourIdOrSlug);
    if (success) {
      return NextResponse.json({ message: "Tour deleted successfully" });
    } else {
      return NextResponse.json({ message: "Tour not found or delete failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`[API /api/tours DELETE] Error:`, error);
    return NextResponse.json({ message: `Failed to delete tour: ${error.message}` }, { status: 500 });
  }
}
