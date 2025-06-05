
import { NextResponse, type NextRequest } from 'next/server';
import { getAllPosts, addPost, type BlogPost, getPostBySlug as getExistingPostBySlug, getPostsByCategoryId, getPostsByTagId } from '@/lib/blog-data';
import { findOrCreateTagsByNames, type Tag } from '@/lib/tags-data'; // Import tag functions

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const tagId = searchParams.get('tagId'); // New: for fetching by tag
    const limitStr = searchParams.get('limit');
    const excludeSlug = searchParams.get('excludeSlug');
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    if (categoryId) {
      const relatedPosts = getPostsByCategoryId(categoryId, limit, excludeSlug || undefined);
      return NextResponse.json(relatedPosts);
    }

    if (tagId) { // New: handle fetching by tagId
      const taggedPosts = getPostsByTagId(tagId, limit, excludeSlug || undefined);
      return NextResponse.json(taggedPosts);
    }

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
    const { title, content, slug, author, authorAvatar, tags, imageUrl, imageHint, originalLanguage, categoryId } = body;

    if (!title || !content || !slug || !categoryId) {
      return NextResponse.json({ message: "Missing required fields: title, content, slug, categoryId are all mandatory." }, { status: 400 });
    }

    if (getExistingPostBySlug(slug)) {
      return NextResponse.json({ message: "Post with this slug already exists" }, { status: 409 });
    }

    // Process tags: tags from body can be an array of strings (names)
    let tagIds: string[] = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const createdOrFoundTags: Tag[] = findOrCreateTagsByNames(tags.filter(tag => typeof tag === 'string' && tag.trim() !== ''));
      tagIds = createdOrFoundTags.map(t => t.id);
    }

    const newPostData: BlogPost = {
      slug,
      title,
      content,
      author: author || "AI Assistant",
      authorAvatar: authorAvatar || "https://placehold.co/100x100.png?text=AI",
      date: new Date().toISOString(),
      tags: tags || [], // Keep original tags for now, or clear if fully migrated
      tagIds: tagIds, // Store the resolved tag IDs
      imageUrl: imageUrl || "https://placehold.co/800x400.png",
      imageHint: imageHint || "abstract content",
      originalLanguage: originalLanguage || "en",
      categoryId: categoryId,
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
