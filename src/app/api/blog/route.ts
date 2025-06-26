
import { NextResponse, type NextRequest } from 'next/server';
import { getAllPosts, addPost, type BlogPost, getPostBySlug as getExistingPostBySlug, getPostsByCategoryId, getPostsByTagId } from '@/lib/blog-data';
import { findOrCreateTagsByNames, getTagsByIds, type Tag } from '@/lib/tags-data';
import { getCategoryPath, type CategoryNode } from '@/lib/categories-data';
import { ObjectId } from 'mongodb';

// This would come from auth in a real app
const MOCK_FREELANCER_ID = "mockFreelancer456";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const tagId = searchParams.get('tagId');
    const limitStr = searchParams.get('limit');
    const excludeSlugsStr = searchParams.get('excludeSlugs'); // Changed from excludeSlug
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const enriched = searchParams.get('enriched') === 'true';
    const searchQuery = searchParams.get('search'); 

    const excludeSlugsArray = excludeSlugsStr ? excludeSlugsStr.split(',').map(s => s.trim()).filter(s => s) : undefined;

    let postsData: BlogPost[];

    if (categoryId) {
      if (!ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid categoryId format" }, { status: 400 });
      }
      postsData = await getPostsByCategoryId(categoryId, limit, excludeSlugsArray, enriched, getCategoryPath, getTagsByIds);
    } else if (tagId) {
      if (!ObjectId.isValid(tagId)) {
        return NextResponse.json({ message: "Invalid tagId format" }, { status: 400 });
      }
      postsData = await getPostsByTagId(tagId, limit, excludeSlugsArray, enriched, getCategoryPath, getTagsByIds);
    } else {
      postsData = await getAllPosts(enriched, getCategoryPath, getTagsByIds, searchQuery || undefined, limit, excludeSlugsArray);
    }
    return NextResponse.json(postsData);
  } catch (error) {
    console.error("API - Failed to fetch posts:", error);
    return NextResponse.json({ message: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, content, slug, author, authorAvatar, tags, 
      featuredImageUrl, featuredImageHint, galleryImages, downloads, 
      originalLanguage, categoryId 
    } = body;
    
    // In a real app, this would come from the authenticated session
    const authorId = MOCK_FREELANCER_ID; 

    if (!title || !content || !slug || !categoryId) {
      return NextResponse.json({ message: "Missing required fields: title, content, slug, categoryId are all mandatory." }, { status: 400 });
    }
    if (!ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid categoryId format" }, { status: 400 });
    }

    const existingPost = await getExistingPostBySlug(slug);
    if (existingPost) {
      return NextResponse.json({ message: "Post with this slug already exists" }, { status: 409 });
    }

    let tagIds: string[] = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const createdOrFoundTags: Tag[] = await findOrCreateTagsByNames(tags.filter(tag => typeof tag === 'string' && tag.trim() !== ''));
      tagIds = createdOrFoundTags.map(t => t.id!);
    }

    const newPostData: Omit<BlogPost, 'id' | '_id' | 'date'> = {
      slug,
      title,
      content,
      authorId: authorId, // Set the author ID
      author: author || "CreatorOS Freelancer", // Use a dynamic name in the future
      authorAvatar: authorAvatar || "https://placehold.co/100x100.png?text=F", 
      tagIds: tagIds,
      featuredImageUrl: featuredImageUrl || `https://placehold.co/800x400.png?text=${encodeURIComponent(title.substring(0,20))}`,
      featuredImageHint: featuredImageHint || "abstract content topic",
      galleryImages: galleryImages || [],
      downloads: downloads || [],
      originalLanguage: originalLanguage || "en",
      categoryId: categoryId,
      comments: [],
    };

    const addedPost = await addPost(newPostData);
    return NextResponse.json(addedPost, { status: 201 });
  } catch (error: any) {
    console.error("API - Failed to create post:", error);
    return NextResponse.json({ message: error.message || "Failed to create post" }, { status: error.message?.includes('already exists') ? 409 : 500 });
  }
}
