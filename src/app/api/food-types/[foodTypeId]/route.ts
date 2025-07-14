
import { NextResponse, type NextRequest } from 'next/server';
import { getFoodTypeById, updateFoodType, deleteFoodType, type FoodType } from '@/lib/food-types-data';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { foodTypeId: string } }
) {
  try {
    const foodType = await getFoodTypeById(params.foodTypeId);
    if (foodType) {
      return NextResponse.json(foodType);
    } else {
      return NextResponse.json({ message: "Food type not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`API - Failed to fetch food type ${params.foodTypeId}:`, error);
    return NextResponse.json({ message: `Failed to fetch food type ${params.foodTypeId}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { foodTypeId: string } }
) {
  try {
    const foodTypeId = params.foodTypeId; 
    if (!ObjectId.isValid(foodTypeId)) {
        return NextResponse.json({ message: "Invalid food type ID format for update." }, { status: 400 });
    }
    const body = await request.json();
    const { name, description } = body;

    const updates: Partial<Omit<FoodType, 'id' | '_id' | 'slug'>> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }
    if (updates.name === '') {
        return NextResponse.json({ message: "Food type name cannot be empty" }, { status: 400 });
    }

    const updated = await updateFoodType(foodTypeId, updates);

    if (updated) {
      return NextResponse.json(updated);
    } else {
      return NextResponse.json({ message: "Food type not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API - Failed to update food type ${params.foodTypeId}:`, error);
    const errorMessage = error.message || `Failed to update food type`;
    const statusCode = errorMessage.includes('conflict') || errorMessage.includes('not found') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { foodTypeId: string } }
) {
  try {
    const foodTypeId = params.foodTypeId; 
    if (!ObjectId.isValid(foodTypeId)) {
        return NextResponse.json({ message: "Invalid food type ID format for delete." }, { status: 400 });
    }
    
    const tagToDelete = await getFoodTypeById(foodTypeId);
    if (!tagToDelete) {
         return NextResponse.json({ message: "Food type not found with this ID" }, { status: 404 });
    }

    const success = await deleteFoodType(foodTypeId);
    if (success) {
      return NextResponse.json({ message: "Food type deleted successfully" });
    } else {
      return NextResponse.json({ message: "Food type not found or delete failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API - Failed to delete food type ${params.foodTypeId}:`, error);
    return NextResponse.json({ message: `Failed to delete food type: ${error.message}` }, { status: 500 });
  }
}
