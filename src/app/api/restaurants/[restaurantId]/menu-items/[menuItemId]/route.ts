// src/app/api/restaurants/[restaurantId]/menu-items/[menuItemId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { updateMenuItem, deleteMenuItem } from '@/lib/restaurants-data';
// TODO: Add session check to ensure user owns this restaurant

export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string; menuItemId: string } }
) {
  try {
    const { menuItemId } = params;
    const body = await request.json();
    const updatedMenuItem = await updateMenuItem(menuItemId, body);

    if (!updatedMenuItem) {
      return NextResponse.json({ message: "Menu item not found or update failed." }, { status: 404 });
    }
    return NextResponse.json(updatedMenuItem);
  } catch (error: any) {
    console.error(`[API PUT /menu-items/${params.menuItemId}] Error:`, error);
    return NextResponse.json({ message: `Failed to update menu item: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { restaurantId: string; menuItemId: string } }
) {
  try {
    const { menuItemId } = params;
    const success = await deleteMenuItem(menuItemId);
    if (success) {
      return NextResponse.json({ message: "Menu item deleted successfully." });
    } else {
      return NextResponse.json({ message: "Menu item not found or delete failed." }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`[API DELETE /menu-items/${params.menuItemId}] Error:`, error);
    return NextResponse.json({ message: `Failed to delete menu item: ${error.message}` }, { status: 500 });
  }
}
