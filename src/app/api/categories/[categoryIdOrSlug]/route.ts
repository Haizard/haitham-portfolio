
import { NextResponse, type NextRequest } from 'next/server';
import { getCategoryById, getCategoryBySlug, updateCategory, deleteCategory, type Category } from '@/lib/categories-data';

async function getCategory(idOrSlug: string): Promise<Category | undefined> {
    let category = getCategoryById(idOrSlug);
    if (!category) {
      category = getCategoryBySlug(idOrSlug);
    }
    return category;
}


export async function GET(
  request: NextRequest,
  { params }: { params: { categoryIdOrSlug: string } }
) {
  try {
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
  { params }: { params: { categoryIdOrSlug: string } }
) {
  try {
    const body = await request.json();
    const { name, description } = body;

    const updates: Partial<Omit<Category, 'id' | 'slug'>> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    // Name is required if it's being updated to an empty string, but optional otherwise for partial updates
    if (updates.name === '') {
        return NextResponse.json({ message: "Category name cannot be empty" }, { status: 400 });
    }

    const updated = updateCategory(params.categoryIdOrSlug, updates);

    if (updated) {
      return NextResponse.json(updated);
    } else {
      return NextResponse.json({ message: "Category not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Failed to update category ${params.categoryIdOrSlug}:`, error);
    return NextResponse.json({ message: error.message || `Failed to update category` }, { status: error.message?.includes('conflict') ? 409 : 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryIdOrSlug: string } }
) {
  try {
    const success = deleteCategory(params.categoryIdOrSlug);
    if (success) {
      return NextResponse.json({ message: "Category (and its subcategories) deleted successfully" });
    } else {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to delete category ${params.categoryIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to delete category ${params.categoryIdOrSlug}` }, { status: 500 });
  }
}
