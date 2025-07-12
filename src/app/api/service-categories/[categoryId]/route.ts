
import { NextResponse, type NextRequest } from 'next/server';
import { getServiceCategoryById, updateServiceCategory, deleteServiceCategory } from '@/lib/service-categories-data';
import type { ServiceCategoryNode } from '@/lib/service-categories-data';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const category = await getServiceCategoryById(params.categoryId);
    if (category) {
      return NextResponse.json(category);
    } else {
      return NextResponse.json({ message: "Service category not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`API - Failed to fetch service category ${params.categoryId}:`, error);
    return NextResponse.json({ message: `Failed to fetch service category ${params.categoryId}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = params.categoryId;
    if (!ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid category ID format for update." }, { status: 400 });
    }
    const body = await request.json();
    const { name, description } = body;

    const updates: Partial<Omit<ServiceCategoryNode, 'id' | '_id' | 'slug' | 'children' | 'parentId' | 'serviceCount'>> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    if (updates.name === '') { 
        return NextResponse.json({ message: "Category name cannot be empty" }, { status: 400 });
    }

    const updated = await updateServiceCategory(categoryId, updates);

    if (updated) {
      return NextResponse.json(updated);
    } else {
      return NextResponse.json({ message: "Category not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API - Failed to update service category ${params.categoryId}:`, error);
    const errorMessage = error.message || `Failed to update category`;
    const statusCode = errorMessage.includes('conflict') || errorMessage.includes('not found') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = params.categoryId;
     if (!ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid category ID format for delete." }, { status: 400 });
    }
    const success = await deleteServiceCategory(categoryId);
    if (success) {
      return NextResponse.json({ message: "Category (and its children) deleted successfully" });
    } else {
      return NextResponse.json({ message: "Category not found or delete failed" }, { status: 404 });
    }
  } catch (error) {
    console.error(`API - Failed to delete service category ${params.categoryId}:`, error);
    return NextResponse.json({ message: `Failed to delete category ${params.categoryId}` }, { status: 500 });
  }
}
