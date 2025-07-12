
import { NextResponse, type NextRequest } from 'next/server';
import { getAllServiceCategories, addServiceCategory } from '@/lib/service-categories-data';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const categories = await getAllServiceCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("API - Failed to fetch service categories:", error);
    return NextResponse.json({ message: "Failed to fetch service categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name) {
      return NextResponse.json({ message: "Missing required field: name" }, { status: 400 });
    }
    if (parentId && !ObjectId.isValid(parentId)) {
        return NextResponse.json({ message: "Invalid parentId format" }, { status: 400 });
    }
    
    const validParentId = parentId && typeof parentId === 'string' && parentId.trim() !== '' ? parentId : null;

    const newCategoryData = {
      name,
      description: description || undefined,
      parentId: validParentId,
    };

    const addedCategory = await addServiceCategory(newCategoryData);
    return NextResponse.json(addedCategory, { status: 201 });
  } catch (error: any) {
    console.error("API - Failed to create service category:", error);
    const errorMessage = error.message || "Failed to create category";
    const statusCode = errorMessage.includes('already exists') || errorMessage.includes('not found') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
