
import { NextResponse } from 'next/server';
import { getAllGuides } from '@/lib/tour-guides-data';

export async function GET() {
  try {
    const guides = await getAllGuides();
    return NextResponse.json(guides);
  } catch (error: any) {
    console.error('Error fetching tour guides:', error);
    return NextResponse.json(
      { message: 'Failed to fetch tour guides', error: error.message },
      { status: 500 }
    );
  }
}

