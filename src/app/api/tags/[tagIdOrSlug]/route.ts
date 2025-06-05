
import { NextResponse, type NextRequest } from 'next/server';
import { getTagById, getTagBySlug, updateTag, deleteTag, type Tag } from '@/lib/tags-data';
import { ObjectId } from 'mongodb';

async function getTag(idOrSlug: string): Promise<Tag | null> {
    if (ObjectId.isValid(idOrSlug)) {
        const tagById = await getTagById(idOrSlug);
        if (tagById) return tagById;
    }
    return await getTagBySlug(idOrSlug);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tagIdOrSlug: string } }
) {
  try {
    const tag = await getTag(params.tagIdOrSlug);
    if (tag) {
      return NextResponse.json(tag);
    } else {
      return NextResponse.json({ message: "Tag not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`API - Failed to fetch tag ${params.tagIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to fetch tag ${params.tagIdOrSlug}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { tagIdOrSlug: string } }
) {
  try {
    const tagId = params.tagIdOrSlug; 
    if (!ObjectId.isValid(tagId)) {
        return NextResponse.json({ message: "Invalid tag ID format for update." }, { status: 400 });
    }
    const body = await request.json();
    const { name, description } = body;

    const updates: Partial<Omit<Tag, 'id' | '_id' | 'slug'>> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    if (updates.name === '') {
        return NextResponse.json({ message: "Tag name cannot be empty" }, { status: 400 });
    }

    const updated = await updateTag(tagId, updates);

    if (updated) {
      return NextResponse.json(updated);
    } else {
      return NextResponse.json({ message: "Tag not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API - Failed to update tag ${params.tagIdOrSlug}:`, error);
    const errorMessage = error.message || `Failed to update tag`;
    const statusCode = errorMessage.includes('conflict') || errorMessage.includes('not found') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tagIdOrSlug: string } }
) {
  try {
    const tagId = params.tagIdOrSlug; 
    if (!ObjectId.isValid(tagId)) {
        return NextResponse.json({ message: "Invalid tag ID format for delete." }, { status: 400 });
    }
    
    const tagToDelete = await getTagById(tagId);
    if (!tagToDelete) {
         return NextResponse.json({ message: "Tag not found with this ID" }, { status: 404 });
    }

    const success = await deleteTag(tagId);
    if (success) {
      return NextResponse.json({ message: "Tag deleted successfully" });
    } else {
      // This case might be redundant if getTagById already confirmed existence
      return NextResponse.json({ message: "Tag not found or delete failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API - Failed to delete tag ${params.tagIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to delete tag: ${error.message}` }, { status: 500 });
  }
}
