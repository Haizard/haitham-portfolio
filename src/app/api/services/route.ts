
import { NextResponse, type NextRequest } from 'next/server';
import { getAllServices, addService, type Service } from '@/lib/services-data';

export async function GET(request: NextRequest) {
  try {
    const allServicesData = await getAllServices();
    // Log the raw data and its type for detailed debugging
    console.log("[API /api/services GET] Data received from getAllServices:", JSON.stringify(allServicesData));
    console.log("[API /api/services GET] Typeof data from getAllServices:", typeof allServicesData, ". IsArray:", Array.isArray(allServicesData));

    if (Array.isArray(allServicesData) && allServicesData.length > 0) {
      console.log("[API /api/services GET] Sending non-empty array to client.");
      return NextResponse.json(allServicesData);
    } else {
      // This branch handles:
      // 1. allServicesData is [] (empty array)
      // 2. allServicesData is null/undefined (should be handled by getAllServices returning [] already)
      // 3. allServicesData is somehow {} (which would trigger the client error)
      console.log("[API /api/services GET] Data from getAllServices was not a populated array. Sending empty array [] to client. Actual data was:", JSON.stringify(allServicesData));
      return NextResponse.json([]); // Explicitly return an empty array
    }
  } catch (error) {
    console.error("[API /api/services GET] Critical error in GET handler:", error);
    let errorDetails = "An unknown server error occurred.";
    let errorMessageForClient = "Failed to fetch services due to a server-side issue.";

    if (error instanceof Error) {
        errorDetails = error.message;
        errorMessageForClient = `Failed to fetch services: ${error.message}`; // Provide more specific message if possible
        if (error.stack) {
            console.error("[API /api/services GET] Stack trace:", error.stack);
        }
    } else if (typeof error === 'string') {
        errorDetails = error;
        errorMessageForClient = `Failed to fetch services: ${error}`;
    } else if (typeof error === 'object' && error !== null && 'toString' in error) {
        errorDetails = error.toString();
    }
    
    // Log the details that will be sent to the client for clarity
    console.log(`[API /api/services GET] Responding with 500. Client message: "${errorMessageForClient}", Details: "${errorDetails}"`);

    return NextResponse.json({ 
        message: errorMessageForClient, 
        errorDetailsLog: errorDetails // Keep this for server logs, client will primarily use 'message'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, duration, description } = body;

    if (!name || !price || !duration || !description) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newServiceData: Omit<Service, 'id' | '_id'> = {
      name,
      price,
      duration,
      description,
    };

    const addedService = await addService(newServiceData);
    return NextResponse.json(addedService, { status: 201 });
  } catch (error) {
    console.error("[API /api/services POST] Failed to create service:", error);
    let errorMessage = "Failed to create service due to an unknown error";
    if (error instanceof Error) {
        errorMessage = `Failed to create service: ${error.message}`;
         if (error.stack) {
            console.error("[API /api/services POST] Stack trace:", error.stack);
        }
    } else if (typeof error === 'string') {
        errorMessage = `Failed to create service: ${error}`;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

