
import { NextResponse, type NextRequest } from 'next/server';
import { getCategoryById, getCategoryBySlug, updateCategory, deleteCategory, type CategoryNode, getCategoryPath } from '@/lib/categories-data';

async function getCategory(idOrSlug: string): Promise<CategoryNode | undefined> {
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
    const { searchParams } = new URL(request.url);
    const includePath = searchParams.get('include_path') === 'true';

    const category = await getCategory(params.categoryIdOrSlug);
    if (category) {
      let responseData: any = { ...category };
      if (includePath) {
        responseData.path = getCategoryPath(category.id);
      }
      return NextResponse.json(responseData);
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
    const categoryId = params.categoryIdOrSlug;
    const body = await request.json();
    const { name, description } = body;

    const updates: Partial<Omit<CategoryNode, 'id' | 'slug' | 'children' | 'parentId'>> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    if (updates.name === '') {
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
  { params }: { params: { categoryIdOrSlug: string } }
) {
  try {
    const categoryId = params.categoryIdOrSlug;
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
