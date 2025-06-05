
import { NextResponse, type NextRequest } from 'next/server';
import { getAllPosts, addPost, type BlogPost, getPostBySlug as getExistingPostBySlug } from '@/lib/blog-data';

export async function GET(request: NextRequest) {
  try {
    const allPosts = getAllPosts();
    return NextResponse.json(allPosts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ message: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, slug, author, authorAvatar, tags, imageUrl, imageHint, originalLanguage, category, subcategory } = body;

    if (!title || !content || !slug || !category) {
      return NextResponse.json({ message: "Missing required fields: title, content, slug, category" }, { status: 400 });
    }

    if (getExistingPostBySlug(slug)) {
      return NextResponse.json({ message: "Post with this slug already exists" }, { status: 409 });
    }

    const newPostData: BlogPost = {
      slug,
      title,
      content,
      author: author || "AI Assistant",
      authorAvatar: authorAvatar || "https://placehold.co/100x100.png?text=AI",
      date: new Date().toISOString(),
      tags: tags || ["AI Generated"],
      imageUrl: imageUrl || "https://placehold.co/800x400.png",
      imageHint: imageHint || "abstract content",
      originalLanguage: originalLanguage || "en",
      category: category, // Ensure category is included
      subcategory: subcategory || undefined, // Include subcategory if provided
      comments: [],
    };

    const addedPost = addPost(newPostData);
    return NextResponse.json(addedPost, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    if (error instanceof Error) {
        return NextResponse.json({ message: `Failed to create post: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to create post due to an unknown error" }, { status: 500 });
  }
}
