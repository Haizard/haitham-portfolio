
import { NextResponse, type NextRequest } from 'next/server';
import { 
    getCategoryById, 
    getCategoryBySlug, 
    getSubcategoriesByParentId, 
    addSubcategory, 
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

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryIdOrSlug: string } }
) {
  try {
    const parentCategory = await getParentCategory(params.categoryIdOrSlug);
    if (!parentCategory) {
      return NextResponse.json({ message: "Parent category not found" }, { status: 404 });
    }
    const subcategories = getSubcategoriesByParentId(parentCategory.id);
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error(`Failed to fetch subcategories for ${params.categoryIdOrSlug}:`, error);
    return NextResponse.json({ message: `Failed to fetch subcategories` }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { categoryIdOrSlug: string } }
) {
  try {
    const parentCategory = await getParentCategory(params.categoryIdOrSlug);
    if (!parentCategory) {
      return NextResponse.json({ message: "Parent category not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ message: "Missing required field: name" }, { status: 400 });
    }

    const newSubcategoryData: Omit<Subcategory, 'id' | 'slug' | 'parentCategoryId'> = {
      name,
      description: description || undefined,
    };

    const addedSubcategory = addSubcategory(parentCategory.id, newSubcategoryData);
    return NextResponse.json(addedSubcategory, { status: 201 });
  } catch (error: any) {
    console.error(`Failed to create subcategory for ${params.categoryIdOrSlug}:`, error);
    return NextResponse.json({ message: error.message || "Failed to create subcategory" }, { status: error.message?.includes('already exists') ? 409 : 500 });
  }
}
