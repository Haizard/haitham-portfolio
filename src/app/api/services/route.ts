
import { NextResponse, type NextRequest } from 'next/server';
import { getAllServices, addService, type Service } from '@/lib/services-data';

export async function GET(request: NextRequest) {
  try {
    const allServices = getAllServices();
    return NextResponse.json(allServices);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json({ message: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, duration, description } = body;

    if (!name || !price || !duration || !description) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newServiceData: Omit<Service, 'id'> = {
      name,
      price,
      duration,
      description,
    };

    const addedService = addService(newServiceData);
    return NextResponse.json(addedService, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);
    if (error instanceof Error) {
        return NextResponse.json({ message: `Failed to create service: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to create service due to an unknown error" }, { status: 500 });
  }
}
