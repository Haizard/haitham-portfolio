
import { NextResponse, type NextRequest } from 'next/server';
import { getTourBookingById, updateTourBooking, deleteTourBooking } from '@/lib/tours-data';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Validation schema for tour booking updates
const tourBookingUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  cancellationReason: z.string().optional(),
  paymentInfo: z.object({
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    paidAt: z.string().optional(),
  }).optional(),
  specialRequests: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
});

// GET /api/tours/bookings/[id] - Get a specific tour booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    
    const booking = await getTourBookingById(id);
    
    if (!booking) {
      return NextResponse.json({ message: 'Tour booking not found' }, { status: 404 });
    }
    
    // Check authorization: user can only view their own bookings unless they're admin
    if (booking.userId !== session.userId && !session.roles.includes('admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json(booking);

  } catch (error: any) {
    console.error('[API /api/tours/bookings/[id] GET] Error:', error);
    return NextResponse.json(
      { message: `Failed to fetch tour booking: ${error.message}` },
      { status: 500 }
    );
  }
}

// PATCH /api/tours/bookings/[id] - Update a tour booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const validatedData = tourBookingUpdateSchema.parse(body);
    
    const booking = await getTourBookingById(id);
    
    if (!booking) {
      return NextResponse.json({ message: 'Tour booking not found' }, { status: 404 });
    }
    
    // Authorization check
    const isOwner = booking.userId === session.userId;
    const isAdmin = session.roles.includes('admin');
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Handle cancellation
    if (validatedData.status === 'cancelled' && booking.status !== 'cancelled') {
      // Process refund if payment was made
      if (booking.paymentInfo.paymentStatus === 'paid' && booking.paymentInfo.stripePaymentIntentId) {
        try {
          await stripe.refunds.create({
            payment_intent: booking.paymentInfo.stripePaymentIntentId,
          });
          
          validatedData.paymentInfo = {
            ...validatedData.paymentInfo,
            paymentStatus: 'refunded',
          };
        } catch (stripeError: any) {
          console.error('Stripe refund error:', stripeError);
          return NextResponse.json(
            { message: 'Failed to process refund. Please contact support.' },
            { status: 500 }
          );
        }
      }
    }
    
    // Update booking
    const updatedBooking = await updateTourBooking(id, validatedData);
    
    if (!updatedBooking) {
      return NextResponse.json({ message: 'Failed to update tour booking' }, { status: 500 });
    }
    
    return NextResponse.json(updatedBooking);

  } catch (error: any) {
    console.error('[API /api/tours/bookings/[id] PATCH] Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: `Failed to update tour booking: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/tours/bookings/[id] - Delete a tour booking (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    
    // Only admins can delete bookings
    if (!session.roles.includes('admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    const booking = await getTourBookingById(id);
    
    if (!booking) {
      return NextResponse.json({ message: 'Tour booking not found' }, { status: 404 });
    }
    
    const deleted = await deleteTourBooking(id);
    
    if (!deleted) {
      return NextResponse.json({ message: 'Failed to delete tour booking' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Tour booking deleted successfully' });

  } catch (error: any) {
    console.error('[API /api/tours/bookings/[id] DELETE] Error:', error);
    return NextResponse.json(
      { message: `Failed to delete tour booking: ${error.message}` },
      { status: 500 }
    );
  }
}

