
import { NextResponse, type NextRequest } from 'next/server';
import { getCategoryById, getCategoryBySlug, updateCategory, deleteCategory, type CategoryNode } from '@/lib/categories-data';

// Prefers ID, then falls back to slug if ID doesn't yield a result.
// In a real-world scenario, you might have separate endpoints or a query param to distinguish.
async function getCategory(idOrSlug: string): Promise<CategoryNode | undefined> {
    let category = getCategoryById(idOrSlug);
    if (!category) {
      // For slug-based lookup, it's less precise for nested items without parent context.
      // This will find the first matching slug in the tree.
      category = getCategoryBySlug(idOrSlug); 
    }
    return category;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryIdOrSlug: string } }
) {
  try {
    // For GET, we can try ID then slug
    const category = await getCategory(params.categoryIdOrSlug);
    if (category) {
      return NextResponse.json(category);
    } else {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to fetch category ${params.categoryIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to fetch category ${params.categoryIdOrSlug}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryIdOrSlug: string } } // Assuming ID is used for PUT/DELETE
) {
  try {
    const categoryId = params.categoryIdOrSlug; // Treat this as ID for modifications
    const body = await request.json();
    const { name, description } = body;

    // parentId is generally not updated via this specific endpoint to avoid complex tree restructuring.
    // Moving a node would typically be a separate, more specialized operation.
    const updates: Partial<Omit<CategoryNode, 'id' | 'slug' | 'children' | 'parentId'>> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    if (updates.name === '') { // Ensure name is not empty if provided
        return NextResponse.json({ message: "Category name cannot be empty" }, { status: 400 });
    }

    const updated = updateCategory(categoryId, updates);

    if (updated) {
      return NextResponse.json(updated);
    } else {
      return NextResponse.json({ message: "Category not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Failed to update category ${params.categoryIdOrSlug}:`, error);
    const errorMessage = error.message || `Failed to update category`;
    const statusCode = errorMessage.includes('conflict') || errorMessage.includes('not found') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryIdOrSlug: string } } // Assuming ID is used for PUT/DELETE
) {
  try {
    const categoryId = params.categoryIdOrSlug; // Treat this as ID for modifications
    const success = deleteCategory(categoryId);
    if (success) {
      return NextResponse.json({ message: "Category (and its children) deleted successfully" });
    } else {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to delete category ${params.categoryIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to delete category ${params.categoryIdOrSlug}` }, { status: 500 });
  }
}
