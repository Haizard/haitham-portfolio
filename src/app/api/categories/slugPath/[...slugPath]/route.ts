
import { NextResponse, type NextRequest } from 'next/server';
import { findCategoryBySlugPathRecursive, getCategoryPath, type CategoryNode } from '@/lib/categories-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slugPath: string[] }> }
) {
  try {
    const { slugPath: slugPathArray } = await params;
    const { searchParams } = new URL(request.url);
    const includePath = searchParams.get('include_path') === 'true';
    if (!slugPathArray || slugPathArray.length === 0) {
      return NextResponse.json({ message: "Category slug path is required" }, { status: 400 });
    }
    
    const category = await findCategoryBySlugPathRecursive(slugPathArray);

    if (category && category.id) {
      let responseData: any = { ...category };
      if (includePath) {
        // If findCategoryBySlugPathRecursive doesn't already include the full path, fetch it.
        // Assuming getCategoryPath works correctly with the new DB structure.
        responseData.path = await getCategoryPath(category.id);
      }
      return NextResponse.json(responseData);
    } else {
      return NextResponse.json({ message: "Category not found for the given slug path" }, { status: 404 });
    }
  } catch (error) {
    console.error(`API - Failed to fetch category by slug path ${params.slugPath.join('/')}:`, error);
    return NextResponse.json({ message: `Failed to fetch category by slug path` }, { status: 500 });
  }
}
