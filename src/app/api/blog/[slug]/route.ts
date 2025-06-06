
import { NextResponse, type NextRequest } from 'next/server';
import { getPostBySlug, updatePost } from '@/lib/blog-data';
import type { BlogPost } from '@/lib/blog-data';
import { findOrCreateTagsByNames, getTagsByIds, type Tag } from '@/lib/tags-data';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const post = await getPostBySlug(slug);

    if (post) {
      let enrichedPost: any = { ...post };
      if (post.tagIds && post.tagIds.length > 0) {
        const resolvedTags = await getTagsByIds(post.tagIds);
        enrichedPost.resolvedTags = resolvedTags;
      } else {
        enrichedPost.resolvedTags = [];
      }
      return NextResponse.json(enrichedPost);
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
  try {
    const slug = params.slug;
    const body = await request.json();
    const { 
      title, content, author, authorAvatar, tags, 
      featuredImageUrl, featuredImageHint, galleryImages, downloads, 
      originalLanguage, categoryId 
    } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json({ message: "Missing required fields for update: title, content, categoryId are mandatory." }, { status: 400 });
    }
    if (!ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid categoryId format for update" }, { status: 400 });
    }

    const existingPost = await getPostBySlug(slug);
    if (!existingPost || !existingPost.id) {
      return NextResponse.json({ message: "Post to update not found" }, { status: 404 });
    }

    let tagIds: string[] = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const createdOrFoundTags: Tag[] = await findOrCreateTagsByNames(tags.filter(tag => typeof tag === 'string' && tag.trim() !== ''));
      tagIds = createdOrFoundTags.map(t => t.id!);
    }

    const updateData: Partial<Omit<BlogPost, 'id' | '_id' | 'slug' | 'date'>> = {
      title,
      content,
      author: author || existingPost.author,
      authorAvatar: authorAvatar || existingPost.authorAvatar,
      tagIds: tagIds,
      featuredImageUrl: featuredImageUrl !== undefined ? featuredImageUrl : existingPost.featuredImageUrl,
      featuredImageHint: featuredImageHint !== undefined ? featuredImageHint : existingPost.featuredImageHint,
      galleryImages: galleryImages !== undefined ? galleryImages : existingPost.galleryImages,
      downloads: downloads !== undefined ? downloads : existingPost.downloads,
      originalLanguage: originalLanguage || existingPost.originalLanguage,
      categoryId: categoryId || existingPost.categoryId,
      // Comments are typically handled separately or appended, not overwritten wholesale by main post update.
      // For simplicity, we're not updating comments here.
    };

    // Ensure date is not accidentally overwritten if not provided in body
    // In fact, date should typically not be updated unless explicitly intended
    // For now, updatePost in blog-data.ts will preserve the original date.

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
