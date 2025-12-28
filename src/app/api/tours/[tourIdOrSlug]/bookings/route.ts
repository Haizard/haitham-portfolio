
import { NextResponse, type NextRequest } from 'next/server';
import { getTourById, getTourBySlug, getTourBookingsByTourId } from '@/lib/tours-data';
import { requireAuth } from '@/lib/rbac';

// GET /api/tours/[tourIdOrSlug]/bookings - Get all bookings for a specific tour
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tourIdOrSlug: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const session = authResult.user;
    const { tourIdOrSlug } = await params;

    // Get tour by ID or slug
    let tour = await getTourById(tourIdOrSlug);
    if (!tour) {
      tour = await getTourBySlug(tourIdOrSlug);
    }

    if (!tour) {
      return NextResponse.json({ message: 'Tour not found' }, { status: 404 });
    }

    // Authorization: Only tour owner (guide) or admin can view tour bookings
    const isTourOwner = tour.guideId === session.id;
    const isAdmin = session.roles.includes('admin');

    if (!isTourOwner && !isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized. Only the tour operator or admin can view tour bookings.' },
        { status: 403 }
      );
    }

    // Get all bookings for this tour
    const bookings = await getTourBookingsByTourId(tour.id!);

    return NextResponse.json(bookings);

  } catch (error: any) {
    console.error('[API /api/tours/[tourIdOrSlug]/bookings GET] Error:', error);
    return NextResponse.json(
      { message: `Failed to fetch tour bookings: ${error.message}` },
      { status: 500 }
    );
  }
}

