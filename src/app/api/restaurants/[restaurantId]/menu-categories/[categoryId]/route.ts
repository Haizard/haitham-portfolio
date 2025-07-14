// src/app/api/restaurants/[restaurantId]/menu-categories/[categoryId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { updateMenuCategory, deleteMenuCategory } from '@/lib/restaurants-data';
// TODO: Add session check to ensure user owns this restaurant

export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string; categoryId: string } }
) {
  try {
    const { categoryId } = params;
    const body = await request.json();
    const updatedCategory = await updateMenuCategory(categoryId, body);

    if (!updatedCategory) {
      return NextResponse.json({ message: "Category not found or update failed." }, { status: 404 });
    }
    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error(`[API PUT /menu-categories/${params.categoryId}] Error:`, error);
    return NextResponse.json({ message: `Failed to update category: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { restaurantId: string; categoryId: string } }
) {
  try {
    const { categoryId } = params;
    const success = await deleteMenuCategory(categoryId);
    if (success) {
      return NextResponse.json({ message: "Category deleted successfully." });
    } else {
      return NextResponse.json({ message: "Category not found or delete failed." }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`[API DELETE /menu-categories/${params.categoryId}] Error:`, error);
    return NextResponse.json({ message: `Failed to delete category: ${error.message}` }, { status: 500 });
  }
}
