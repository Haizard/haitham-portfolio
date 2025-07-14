// src/app/api/restaurants/[restaurantId]/menu-items/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { addMenuItem } from '@/lib/restaurants-data';
// TODO: Add session check to ensure user owns this restaurant

export async function POST(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;
    const body = await request.json();
    
    // Add restaurantId to the body before passing to the data function
    const menuItemData = { ...body, restaurantId };
    
    const newMenuItem = await addMenuItem(menuItemData);
    return NextResponse.json(newMenuItem, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /menu-items] Error:', error);
    return NextResponse.json({ message: `Failed to create menu item: ${error.message}` }, { status: 500 });
  }
}
