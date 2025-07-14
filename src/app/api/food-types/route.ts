
import { NextResponse, type NextRequest } from 'next/server';
import { getAllFoodTypes, addFoodType } from '@/lib/food-types-data';
import type { FoodType } from '@/lib/food-types-data';

export async function GET(request: NextRequest) {
  try {
    const foodTypes = await getAllFoodTypes();
    return NextResponse.json(foodTypes);
  } catch (error) {
    console.error("API - Failed to fetch food types:", error);
    return NextResponse.json({ message: "Failed to fetch food types" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ message: "Missing required field: name" }, { status: 400 });
    }

    const newTagData: Omit<FoodType, 'id' | '_id' | 'slug'> & { name: string } = {
      name,
      description: description || undefined,
    };

    const addedTag = await addFoodType(newTagData);
    return NextResponse.json(addedTag, { status: 201 });
  } catch (error: any) {
    console.error("API - Failed to create food type:", error);
    const errorMessage = error.message || "Failed to create food type";
    const statusCode = errorMessage.includes('already exists') ? 409 : 500;
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
