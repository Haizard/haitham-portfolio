
import { NextResponse, type NextRequest } from 'next/server';
import { 
    getCategoryById, 
    getCategoryBySlug, 
    getSubcategoryById, 
    getSubcategoryBySlug, 
    updateSubcategory, 
    deleteSubcategory,
    type Subcategory,
    type Category
} from '@/lib/categories-data';

async function getParentCategory(idOrSlug: string): Promise<Category | undefined> {
    let category = getCategoryById(idOrSlug);
    if (!category) {
      category = getCategoryBySlug(idOrSlug);
    }
    return category;
}

async function getSubcategory(parentCategoryId: string, idOrSlug: string): Promise<Subcategory | undefined> {
    let subcategory = getSubcategoryById(idOrSlug);
    // Ensure it belongs to the correct parent if fetched by ID
    if (subcategory && subcategory.parentCategoryId !== parentCategoryId) {
        return undefined; 
    }
    if (!subcategory) {
      subcategory = getSubcategoryBySlug(parentCategoryId, idOrSlug);
    }
    return subcategory;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryIdOrSlug: string, subcategoryIdOrSlug: string } }
) {
  try {
    const parentCategory = await getParentCategory(params.categoryIdOrSlug);
    if (!parentCategory) {
      return NextResponse.json({ message: "Parent category not found" }, { status: 404 });
    }
    const subcategory = await getSubcategory(parentCategory.id, params.subcategoryIdOrSlug);
    if (subcategory) {
      return NextResponse.json(subcategory);
    } else {
      return NextResponse.json({ message: "Subcategory not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to fetch subcategory ${params.subcategoryIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to fetch subcategory` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryIdOrSlug: string, subcategoryIdOrSlug: string } }
) {
  try {
    const parentCategory = await getParentCategory(params.categoryIdOrSlug);
    if (!parentCategory) {
      return NextResponse.json({ message: "Parent category not found" }, { status: 404 });
    }

    // First, check if subcategory exists under this parent
    const existingSubcategory = await getSubcategory(parentCategory.id, params.subcategoryIdOrSlug);
    if (!existingSubcategory) {
        return NextResponse.json({ message: "Subcategory not found for update under this parent" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;
    const updates: Partial<Omit<Subcategory, 'id' | 'slug' | 'parentCategoryId'>> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    if (updates.name === '') {
        return NextResponse.json({ message: "Subcategory name cannot be empty" }, { status: 400 });
    }
    
    // Pass the ID of the existing subcategory to ensure we update the correct one
    const updated = updateSubcategory(existingSubcategory.id, updates);

    if (updated) {
      return NextResponse.json(updated);
    } else {
      // This case should ideally be caught by the existingSubcategory check, but as a fallback:
      return NextResponse.json({ message: "Subcategory not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Failed to update subcategory ${params.subcategoryIdOrSlug}:`, error);
    return NextResponse.json({ message: error.message || `Failed to update subcategory` }, { status: error.message?.includes('conflict') ? 409 : 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryIdOrSlug: string, subcategoryIdOrSlug: string } }
) {
  try {
    const parentCategory = await getParentCategory(params.categoryIdOrSlug);
    if (!parentCategory) {
      return NextResponse.json({ message: "Parent category not found" }, { status: 404 });
    }
    
    const subcategoryToDelete = await getSubcategory(parentCategory.id, params.subcategoryIdOrSlug);
    if (!subcategoryToDelete) {
        return NextResponse.json({ message: "Subcategory not found for deletion under this parent" }, { status: 404 });
    }

    const success = deleteSubcategory(subcategoryToDelete.id); // Use ID for precise deletion
    if (success) {
      return NextResponse.json({ message: "Subcategory deleted successfully" });
    } else {
      // This case should ideally be caught by subcategoryToDelete check
      return NextResponse.json({ message: "Subcategory not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to delete subcategory ${params.subcategoryIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to delete subcategory` }, { status: 500 });
  }
}
