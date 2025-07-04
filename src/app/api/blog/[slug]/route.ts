
import { NextResponse, type NextRequest } from 'next/server';
import { getPostBySlug, updatePost, deletePostBySlug } from '@/lib/blog-data';
import type { BlogPost } from '@/lib/blog-data';
import { findOrCreateTagsByNames, getTagsByIds, type Tag } from '@/lib/tags-data';
import { getCategoryPath } from '@/lib/categories-data';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const post = await getPostBySlug(slug, true, getCategoryPath, getTagsByIds); // Enrich data

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getSession();
  if (!session.user || !session.user.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const slug = params.slug;
    const body = await request.json();
    const { 
      title, content, tags, 
      featuredImageUrl, featuredImageHint, galleryImages, downloads, 
      originalLanguage, categoryId 
    } = body;

    const existingPost = await getPostBySlug(slug);
    if (!existingPost || !existingPost.id) {
      return NextResponse.json({ message: "Post to update not found" }, { status: 404 });
    }
    
    // Check if the current user is the author or an admin
    if (existingPost.authorId !== session.user.id && !session.user.roles.includes('admin')) {
      return NextResponse.json({ message: "You are not authorized to edit this post." }, { status: 403 });
    }
    
    if (!title || !content || !categoryId) {
      return NextResponse.json({ message: "Missing required fields for update: title, content, categoryId are mandatory." }, { status: 400 });
    }
    if (!ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid categoryId format for update" }, { status: 400 });
    }

    let tagIds: string[] = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const createdOrFoundTags: Tag[] = await findOrCreateTagsByNames(tags.filter(tag => typeof tag === 'string' && tag.trim() !== ''));
      tagIds = createdOrFoundTags.map(t => t.id!);
    }

    const updateData: Partial<Omit<BlogPost, 'id' | '_id' | 'slug' | 'date' | 'comments' | 'categoryName' | 'categorySlugPath' | 'resolvedTags' | 'authorId' | 'author' | 'authorAvatar'>> = {
      title,
      content,
      tagIds: tagIds,
      featuredImageUrl: featuredImageUrl !== undefined ? featuredImageUrl : existingPost.featuredImageUrl,
      featuredImageHint: featuredImageHint !== undefined ? featuredImageHint : existingPost.featuredImageHint,
      galleryImages: galleryImages !== undefined ? galleryImages : existingPost.galleryImages,
      downloads: downloads !== undefined ? downloads : existingPost.downloads,
      originalLanguage: originalLanguage || existingPost.originalLanguage,
      categoryId: categoryId || existingPost.categoryId,
    };

    const updatedPost = await updatePost(existingPost.id, updateData);
    if (!updatedPost) {
        throw new Error('Update operation failed in the data layer.');
    }
    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error(`API - Failed to update post ${params.slug}:`, error);
    return NextResponse.json({ message: error.message || `Failed to update post ${params.slug}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getSession();
  if (!session.user || !session.user.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const slug = params.slug;
    
    const existingPost = await getPostBySlug(slug);
    if (!existingPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id && !session.user.roles.includes('admin')) {
      return NextResponse.json({ message: "You are not authorized to delete this post." }, { status: 403 });
    }

    const success = await deletePostBySlug(slug);

    if (success) {
      return NextResponse.json({ message: "Post deleted successfully" });
    } else {
      return NextResponse.json({ message: "Post not found or delete failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API - Failed to delete post ${params.slug}:`, error);
    return NextResponse.json({ message: error.message || `Failed to delete post ${params.slug}` }, { status: 500 });
  }
}
