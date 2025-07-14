
import { NextResponse, type NextRequest } from 'next/server';
import { getPlatformSettings, updatePlatformSettings, type PlatformSettings } from '@/lib/settings-data';
import { z } from 'zod';

const settingsUpdateSchema = z.object({
  commissionRate: z.number().min(0).max(1), // Store as a decimal (e.g., 0.15 for 15%)
});

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication
    const settings = await getPlatformSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("[API /api/settings GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch settings: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Add admin authentication
    const body = await request.json();
    const validation = settingsUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid settings data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedSettings = await updatePlatformSettings(validation.data);
    
    return NextResponse.json(updatedSettings);

  } catch (error: any) {
    console.error("[API /api/settings PUT] Error:", error);
    return NextResponse.json({ message: `Failed to update settings: ${error.message}` }, { status: 500 });
  }
}
