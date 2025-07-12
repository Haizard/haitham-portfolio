
import { NextResponse, type NextRequest } from 'next/server';
import { getAllProductTags, addProductTag, findOrCreateProductTagsByNames } from '@/lib/product-tags-data';
import type { ProductTag } from '@/lib/product-tags-data';

export async function GET(request: NextRequest) {
  try {
    const tags = await getAllProductTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("API - Failed to fetch product tags:", error);
    return NextResponse.json({ message: "Failed to fetch product tags" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ message: "Missing required field: name" }, { status: 400 });
    }

    const newTagData: Omit<ProductTag, 'id' | '_id' | 'slug'> & { name: string } = {
      name,
      description: description || undefined,
    };

    const addedTag = await addProductTag(newTagData);
    return NextResponse.json(addedTag, { status: 201 });
  } catch (error: any) {
    console.error("API - Failed to create product tag:", error);
    const errorMessage = error.message || "Failed to create product tag";
    const statusCode = errorMessage.includes('already exists') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
