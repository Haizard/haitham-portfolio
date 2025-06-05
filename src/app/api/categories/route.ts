
import { NextResponse, type NextRequest } from 'next/server';
import { getAllCategories, addCategory, type Category } from '@/lib/categories-data';

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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ message: "Missing required field: name" }, { status: 400 });
    }

    const newCategoryData: Omit<Category, 'id' | 'slug'> = {
      name,
      description: description || undefined,
    };

    const addedCategory = addCategory(newCategoryData);
    return NextResponse.json(addedCategory, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ message: error.message || "Failed to create category" }, { status: error.message?.includes('already exists') ? 409 : 500 });
  }
}
