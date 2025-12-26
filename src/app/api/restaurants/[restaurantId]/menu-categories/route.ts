// src/app/api/restaurants/[restaurantId]/menu-categories/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { addMenuCategory } from '@/lib/restaurants-data';
// TODO: Add session check to ensure user owns this restaurant

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params;
    const body = await request.json();

    // Add restaurantId to the body before passing to the data function
    const categoryData = { ...body, restaurantId };

    const newCategory = await addMenuCategory(categoryData);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /menu-categories] Error:', error);
    return NextResponse.json({ message: `Failed to create category: ${error.message}` }, { status: 500 });
  }
}
