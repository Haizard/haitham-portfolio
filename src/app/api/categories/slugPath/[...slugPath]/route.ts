
// src/app/api/categories/slugPath/[...slugPath]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { findCategoryBySlugPathRecursive, getCategoryPath, type CategoryNode } from '@/lib/categories-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { slugPath: string[] } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includePath = searchParams.get('include_path') === 'true';

    const slugPathArray = params.slugPath;
    if (!slugPathArray || slugPathArray.length === 0) {
      return NextResponse.json({ message: "Category slug path is required" }, { status: 400 });
    }
    
    const category = findCategoryBySlugPathRecursive(slugPathArray);

    if (category) {
      let responseData: any = { ...category };
      if (includePath) {
        responseData.path = getCategoryPath(category.id);
      }
      return NextResponse.json(responseData);
    } else {
      return NextResponse.json({ message: "Category not found for the given slug path" }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to fetch category by slug path ${params.slugPath.join('/')}:`, error);
    return NextResponse.json({ message: `Failed to fetch category by slug path` }, { status: 500 });
  }
}
