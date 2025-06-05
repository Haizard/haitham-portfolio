
import { NextResponse, type NextRequest } from 'next/server';
import { getPostBySlug } from '@/lib/blog-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const post = await getPostBySlug(slug);

    if (post) {
      return NextResponse.json(post);
    } else {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`API - Failed to fetch post ${params.slug}:`, error);
    return NextResponse.json({ message: `Failed to fetch post ${params.slug}` }, { status: 500 });
  }
}
