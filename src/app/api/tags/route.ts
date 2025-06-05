
import { NextResponse, type NextRequest } from 'next/server';
import { getAllTags, addTag, type Tag } from '@/lib/tags-data';

export async function GET(request: NextRequest) {
  try {
    const tags = getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return NextResponse.json({ message: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ message: "Missing required field: name" }, { status: 400 });
    }

    const newTagData: Omit<Tag, 'id' | 'slug'> & { name: string } = {
      name,
      description: description || undefined,
    };

    const addedTag = addTag(newTagData);
    return NextResponse.json(addedTag, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create tag:", error);
    const errorMessage = error.message || "Failed to create tag";
    const statusCode = errorMessage.includes('already exists') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
