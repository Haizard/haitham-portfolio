
import { NextResponse, type NextRequest } from 'next/server';
import { addCommentToPost, type Comment } from '@/lib/blog-data';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await request.json();
    const { commentText } = body;

    if (!commentText || typeof commentText !== 'string' || commentText.trim() === '') {
      return NextResponse.json({ message: "Comment text is required and cannot be empty." }, { status: 400 });
    }

    // In a real app, author and avatar would come from authenticated user session
    const newCommentData: Omit<Comment, 'id'> = {
      author: "Anonymous User", // Placeholder
      avatar: `https://placehold.co/50x50.png?text=${commentText.substring(0,1) || 'A'}`, // Placeholder
      date: new Date().toISOString(),
      text: commentText.trim(),
    };

    const addedComment = await addCommentToPost(slug, newCommentData);

    if (addedComment) {
      return NextResponse.json(addedComment, { status: 201 });
    } else {
      return NextResponse.json({ message: "Failed to add comment. Post not found or database error." }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API - Failed to add comment to post ${params.slug}:`, error);
    return NextResponse.json({ message: error.message || `Failed to add comment.` }, { status: 500 });
  }
}
