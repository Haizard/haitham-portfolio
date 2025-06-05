
import { NextResponse, type NextRequest } from 'next/server';
import { getAllCategories, addCategory, type CategoryNode } from '@/lib/categories-data';

export async function GET(request: NextRequest) {
  try {
    const categories = getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name) {
      return NextResponse.json({ message: "Missing required field: name" }, { status: 400 });
    }

    // Ensure parentId is either a string or null/undefined
    const validParentId = typeof parentId === 'string' && parentId.trim() !== '' ? parentId : null;

    const newCategoryData: Omit<CategoryNode, 'id' | 'slug' | 'children'> & { parentId?: string | null } = {
      name,
      description: description || undefined,
      parentId: validParentId,
    };

    const addedCategory = addCategory(newCategoryData);
    return NextResponse.json(addedCategory, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create category:", error);
    const errorMessage = error.message || "Failed to create category";
    const statusCode = errorMessage.includes('already exists') || errorMessage.includes('not found') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
