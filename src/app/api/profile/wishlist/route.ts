
import { NextResponse, type NextRequest } from 'next/server';
import { getFreelancerProfile, toggleWishlistItem } from '@/lib/user-profile-data';
import { z } from 'zod';

// This would come from an authenticated session in a real app
const MOCK_USER_ID = "mockFreelancer456";

const wishlistToggleSchema = z.object({
  productId: z.string().min(1, "Product ID is required."),
});

// Get the user's current wishlist
export async function GET(request: NextRequest) {
  try {
    const profile = await getFreelancerProfile(MOCK_USER_ID);
    if (!profile) {
      return NextResponse.json({ message: "User profile not found." }, { status: 404 });
    }
    return NextResponse.json({ wishlist: profile.wishlist || [] });
  } catch (error: any) {
    console.error("[API /profile/wishlist GET] Error:", error);
    return NextResponse.json({ message: "Failed to fetch wishlist." }, { status: 500 });
  }
}

// Add or remove an item from the wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = wishlistToggleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid request data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { productId } = validation.data;
    
    const result = await toggleWishlistItem(MOCK_USER_ID, productId);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("[API /profile/wishlist POST] Error:", error);
    return NextResponse.json({ message: error.message || "Failed to update wishlist." }, { status: 500 });
  }
}
