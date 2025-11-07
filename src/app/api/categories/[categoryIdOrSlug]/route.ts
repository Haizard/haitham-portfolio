
import { NextResponse, type NextRequest } from 'next/server';
import { getCategoryById, getCategoryBySlug, updateCategory, deleteCategory, type CategoryNode, getCategoryPath } from '@/lib/categories-data';
import { ObjectId } from 'mongodb';

async function getCategory(idOrSlug: string): Promise<CategoryNode | null> {
    // Try fetching by ID first if it's a valid ObjectId format
    if (ObjectId.isValid(idOrSlug)) {
        const categoryById = await getCategoryById(idOrSlug);
        if (categoryById) return categoryById;
    }
    // If not found by ID or not a valid ObjectId, try fetching by slug
    // Note: This doesn't account for slugs not being unique across different parent categories.
    // For more robust slug fetching, parent context might be needed if slugs aren't globally unique.
    // However, our current getCategoryBySlug in categories-data.ts does not take parent context.
    // For now, we assume slugs are globally unique or this route primarily handles ID-based lookups.
    return await getCategoryBySlug(idOrSlug);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryIdOrSlug: string }> }
) {
  try {
    const { categoryIdOrSlug } = await params;
    const { searchParams } = new URL(request.url);
    const includePath = searchParams.get('include_path') === 'true';

    const category = await getCategory(categoryIdOrSlug);

    if (category && category.id) {
      let responseData: any = { ...category };
      if (includePath) {
        responseData.path = await getCategoryPath(category.id);
      }
      return NextResponse.json(responseData);
    } else {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`API - Failed to fetch category ${params.categoryIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to fetch category ${params.categoryIdOrSlug}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryIdOrSlug: string }> }
) {
  try {
    const { categoryIdOrSlug: categoryId } = await params;
    if (!ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid category ID format for update." }, { status: 400 });
    }
    const body = await request.json();
    const { name, description } = body;

    const updates: Partial<Omit<CategoryNode, 'id' | '_id' | 'slug' | 'children' | 'parentId'>> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    if (updates.name === '') { // name can be updated to an empty string if desired, but slug creation would be odd.
        // Consider if empty name should be allowed. Here, we prevent it for slug generation.
        return NextResponse.json({ message: "Category name cannot be empty" }, { status: 400 });
    }

    const updated = await updateCategory(categoryId, updates);

    if (updated) {
      return NextResponse.json(updated);
    } else {
      return NextResponse.json({ message: "Category not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API - Failed to update category ${params.categoryIdOrSlug}:`, error);
    const errorMessage = error.message || `Failed to update category`;
    const statusCode = errorMessage.includes('conflict') || errorMessage.includes('not found') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryIdOrSlug: string }> }
) {
  try {
    const { categoryIdOrSlug: categoryId } = await params;
     if (!ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid category ID format for delete." }, { status: 400 });
    }
    const success = await deleteCategory(categoryId);
    if (success) {
      // TODO: Consider what happens to posts that were in this category.
      // They might need to be re-categorized or moved to an "uncategorized" state.
      // This is not handled by the current deleteCategory in DB.
      return NextResponse.json({ message: "Category (and its children) deleted successfully" });
    } else {
      return NextResponse.json({ message: "Category not found or delete failed" }, { status: 404 });
    }
  } catch (error) {
    console.error(`API - Failed to delete category ${params.categoryIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to delete category ${params.categoryIdOrSlug}` }, { status: 500 });
  }
}
