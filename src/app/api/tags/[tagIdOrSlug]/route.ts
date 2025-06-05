
import { NextResponse, type NextRequest } from 'next/server';
import { getTagById, getTagBySlug, updateTag, deleteTag, type Tag } from '@/lib/tags-data';

async function getTag(idOrSlug: string): Promise<Tag | undefined> {
    let tag = getTagById(idOrSlug);
    if (!tag) {
      tag = getTagBySlug(idOrSlug); 
    }
    return tag;
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
    console.error(`Failed to fetch tag ${params.tagIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to fetch tag ${params.tagIdOrSlug}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { tagIdOrSlug: string } }
) {
  try {
    const tagId = params.tagIdOrSlug; // Assume ID for PUT
    const body = await request.json();
    const { name, description } = body;

    const updates: Partial<Omit<Tag, 'id' | 'slug'>> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    if (updates.name === '') {
        return NextResponse.json({ message: "Tag name cannot be empty" }, { status: 400 });
    }

    // For PUT, we use the ID to find the tag to ensure we update the correct one.
    // The slug uniqueness check happens within updateTag if name changes.
    const tagToUpdate = getTagById(tagId);
    if (!tagToUpdate) {
         return NextResponse.json({ message: "Tag not found with this ID" }, { status: 404 });
    }

    const updated = updateTag(tagToUpdate.id, updates);

    if (updated) {
      return NextResponse.json(updated);
    } else {
      // This case should ideally be caught by the existence check or by updateTag throwing an error
      return NextResponse.json({ message: "Tag not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Failed to update tag ${params.tagIdOrSlug}:`, error);
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
    const tagId = params.tagIdOrSlug; // Assume ID for DELETE
    
    // Ensure tag exists before trying to delete (optional, deleteTag handles non-existence)
    const tagToDelete = getTagById(tagId);
    if (!tagToDelete) {
         return NextResponse.json({ message: "Tag not found with this ID" }, { status: 404 });
    }

    const success = deleteTag(tagToDelete.id);
    if (success) {
      // Note: In a real DB, you'd also handle removing this tagId from all associated blog posts.
      return NextResponse.json({ message: "Tag deleted successfully" });
    } else {
      return NextResponse.json({ message: "Tag not found or delete failed" }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to delete tag ${params.tagIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to delete tag ${params.tagIdOrSlug}` }, { status: 500 });
  }
}
