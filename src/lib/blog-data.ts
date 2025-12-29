
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { CategoryNode, getCategoryPath as getCategoryPathType } from './categories-data'; // For enriched data
import type { Tag, getTagsByIds as getTagsByIdsType } from './tags-data'; // For enriched data


const POSTS_COLLECTION = 'posts';

export interface GalleryImage {
  url: string;
  caption?: string;
  hint?: string;
}

export interface DownloadLink {
  name: string;
  url: string;
  description?: string;
  fileName?: string; // Suggested filename for the download attribute
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  date: string;
  text: string;
}

export interface BlogPost {
  _id?: ObjectId;
  id?: string;
  slug: string;
  title: string;
  authorId: string; // ID of the author (freelancer)
  author: string;
  authorAvatar: string;
  date: string;
  tagIds?: string[];

  featuredImageUrl?: string;
  featuredImageHint?: string;
  videoUrl?: string;
  galleryImages?: GalleryImage[];
  downloads?: DownloadLink[];

  content: string; // HTML content
  originalLanguage: string;
  categoryId: string;
  comments?: Comment[];

  // Fields for enriched data, typically added by API resolvers
  categoryName?: string;
  categorySlugPath?: string; // e.g., "parent-slug/child-slug"
  resolvedTags?: Tag[];
}

function docToBlogPost(doc: any): BlogPost {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  const commentsWithId = (rest.comments || []).map((comment: any) => ({
    ...comment,
    id: comment.id || new ObjectId().toString(), // Ensure comments always have an id
  }));
  return {
    id: _id?.toString(),
    ...rest,
    galleryImages: rest.galleryImages || [],
    downloads: rest.downloads || [],
    comments: commentsWithId,
  } as BlogPost;
}

export async function getAllPosts(
  enrich: boolean = false,
  categoryDataFetcher?: typeof getCategoryPathType,
  tagDataFetcher?: typeof getTagsByIdsType,
  searchQuery?: string,
  limit?: number,
  excludeSlugs?: string[],
  authorId?: string // New parameter
): Promise<BlogPost[]> {
  console.log(`Attempting to fetch posts from DB. Search: "${searchQuery || ''}", Limit: ${limit}, ExcludeSlugs: ${excludeSlugs?.join(',')}, AuthorId: ${authorId}`);
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);

  const query: Filter<BlogPost> = {};
  if (searchQuery) {
    const regex = { $regex: searchQuery, $options: 'i' };
    query.$or = [
      { title: regex },
      { content: regex }
    ];
  }

  if (excludeSlugs && excludeSlugs.length > 0) {
    query.slug = { $nin: excludeSlugs };
  }

  if (authorId) {
    query.authorId = authorId;
  }

  const postsCursor = collection.find(query).sort({ date: -1 });
  if (limit) {
    postsCursor.limit(limit);
  }
  let postsArray = await postsCursor.toArray();
  console.log(`Fetched ${postsArray.length} posts from DB with current filters.`);

  let results = postsArray.map(docToBlogPost);

  if (enrich && categoryDataFetcher && tagDataFetcher) {
    results = await Promise.all(results.map(async (post) => {
      let categoryName: string | undefined;
      let categorySlugPath: string | undefined;
      let resolvedTags: Tag[] = [];

      if (post.categoryId) {
        const path = await categoryDataFetcher(post.categoryId);
        if (path && path.length > 0) {
          categoryName = path[path.length - 1].name;
          categorySlugPath = path.map(p => p.slug).filter(s => s && s.trim() !== '').join('/');
        }
      }
      if (post.tagIds && post.tagIds.length > 0) {
        resolvedTags = await tagDataFetcher(post.tagIds);
      }
      return { ...post, categoryName, categorySlugPath, resolvedTags };
    }));
  }
  return results;
}


export async function getPostBySlug(slug: string, enrich: boolean = false, categoryDataFetcher?: typeof getCategoryPathType, tagDataFetcher?: typeof getTagsByIdsType): Promise<BlogPost | null> {
  console.log(`Attempting to get post by slug: ${slug} from DB`);
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const postDoc = await collection.findOne({ slug });
  console.log(`Post found for slug ${slug}:`, !!postDoc);
  if (!postDoc) return null;

  let post = docToBlogPost(postDoc);

  if (enrich && categoryDataFetcher && tagDataFetcher) {
    if (post.categoryId) {
      const path = await categoryDataFetcher(post.categoryId);
      if (path && path.length > 0) {
        post.categoryName = path[path.length - 1].name;
        post.categorySlugPath = path.map(p => p.slug).filter(s => s && s.trim() !== '').join('/');
      }
    }
    if (post.tagIds && post.tagIds.length > 0) {
      post.resolvedTags = await tagDataFetcher(post.tagIds);
    }
  }
  return post;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!ObjectId.isValid(id)) {
    console.log(`Invalid ObjectId for getPostById: ${id}`);
    return null;
  }
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const postDoc = await collection.findOne({ _id: new ObjectId(id) });
  return postDoc ? docToBlogPost(postDoc) : null;
}

export async function addPost(postData: Omit<BlogPost, 'id' | '_id' | 'date' | 'categoryName' | 'categorySlugPath' | 'resolvedTags'> & { date?: string }): Promise<BlogPost> {
  const collection = await getCollection<Omit<BlogPost, 'id' | '_id' | 'categoryName' | 'categorySlugPath' | 'resolvedTags'>>(POSTS_COLLECTION);

  const existingPost = await collection.findOne({ slug: postData.slug });
  if (existingPost) {
    console.warn(`[addPost] Post with slug '${postData.slug}' already exists. Update or use new slug.`);
    throw new Error(`Post with slug '${postData.slug}' already exists.`);
  }

  const docToInsert = {
    ...postData,
    date: postData.date || new Date().toISOString(),
    comments: postData.comments || [],
    galleryImages: postData.galleryImages || [],
    downloads: postData.downloads || [],
  };

  console.log("[addPost] Attempting to insert new post with slug:", postData.slug);
  const result = await collection.insertOne(docToInsert as any);

  const newPost: BlogPost = {
    _id: result.insertedId,
    id: result.insertedId.toString(),
    ...docToInsert
  };
  console.log(`[addPost] Post added with slug '${newPost.slug}'.`);
  return newPost;
}

export async function updatePost(id: string, updates: Partial<Omit<BlogPost, 'id' | '_id' | 'slug' | 'date' | 'comments' | 'categoryName' | 'categorySlugPath' | 'resolvedTags' | 'authorId'>>): Promise<BlogPost | null> {
  if (!ObjectId.isValid(id)) {
    console.log(`Invalid ObjectId for updatePost: ${id}`);
    return null;
  }
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );

  if (!result) {
    console.warn(`[updatePost] Post with ID '${id}' not found for update.`);
    return null;
  }
  console.log(`[updatePost] Post with ID '${id}' updated successfully.`);
  return docToBlogPost(result);
}


export async function getPostsByCategoryId(categoryId: string, limit?: number, excludeSlugs?: string[], enrich: boolean = false, categoryDataFetcher?: typeof getCategoryPathType, tagDataFetcher?: typeof getTagsByIdsType): Promise<BlogPost[]> {
  if (!ObjectId.isValid(categoryId)) {
    console.warn(`getPostsByCategoryId: Invalid categoryId format: ${categoryId}`);
    return [];
  }
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const query: any = { categoryId };
  if (excludeSlugs && excludeSlugs.length > 0) {
    query.slug = { $nin: excludeSlugs };
  }
  const cursor = collection.find(query).sort({ date: -1 });
  if (limit) {
    cursor.limit(limit);
  }
  const postsArray = await cursor.toArray();
  let results = postsArray.map(docToBlogPost);

  if (enrich && categoryDataFetcher && tagDataFetcher) {
    results = await Promise.all(results.map(async (post) => {
      let categoryName: string | undefined;
      let categorySlugPath: string | undefined;
      let resolvedTags: Tag[] = [];

      if (post.categoryId) {
        const path = await categoryDataFetcher(post.categoryId);
        if (path && path.length > 0) {
          categoryName = path[path.length - 1].name;
          categorySlugPath = path.map(p => p.slug).filter(s => s && s.trim() !== '').join('/');
        }
      }
      if (post.tagIds && post.tagIds.length > 0) {
        resolvedTags = await tagDataFetcher(post.tagIds);
      }
      return { ...post, categoryName, categorySlugPath, resolvedTags };
    }));
  }
  return results;
}

export async function getPostsByTagId(tagId: string, limit?: number, excludeSlugs?: string[], enrich: boolean = false, categoryDataFetcher?: typeof getCategoryPathType, tagDataFetcher?: typeof getTagsByIdsType): Promise<BlogPost[]> {
  if (!ObjectId.isValid(tagId)) {
    console.warn(`getPostsByTagId: Invalid tagId format: ${tagId}`);
    return [];
  }
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const query: any = { tagIds: tagId };
  if (excludeSlugs && excludeSlugs.length > 0) {
    query.slug = { $nin: excludeSlugs };
  }
  const cursor = collection.find(query).sort({ date: -1 });
  if (limit) {
    cursor.limit(limit);
  }
  const postsArray = await cursor.toArray();
  let results = postsArray.map(docToBlogPost);

  if (enrich && categoryDataFetcher && tagDataFetcher) {
    results = await Promise.all(results.map(async (post) => {
      let categoryName: string | undefined;
      let categorySlugPath: string | undefined;
      let resolvedTags: Tag[] = [];

      if (post.categoryId) {
        const path = await categoryDataFetcher(post.categoryId);
        if (path && path.length > 0) {
          categoryName = path[path.length - 1].name;
          categorySlugPath = path.map(p => p.slug).filter(s => s && s.trim() !== '').join('/');
        }
      }
      if (post.tagIds && post.tagIds.length > 0) {
        resolvedTags = await tagDataFetcher(post.tagIds);
      }
      return { ...post, categoryName, categorySlugPath, resolvedTags };
    }));
  }
  return results;
}

export async function addCommentToPost(postSlug: string, commentData: Omit<Comment, 'id'>): Promise<Comment | null> {
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const post = await collection.findOne({ slug: postSlug });

  if (!post) {
    console.warn(`[addCommentToPost] Post with slug '${postSlug}' not found.`);
    return null;
  }

  const newComment: Comment = {
    id: new ObjectId().toString(),
    ...commentData,
  };

  const result = await collection.updateOne(
    { slug: postSlug },
    { $push: { comments: { $each: [newComment], $position: 0 } } }
  );

  if (result.modifiedCount === 1) {
    console.log(`[addCommentToPost] Comment added to post '${postSlug}'.`);
    return newComment;
  } else {
    console.warn(`[addCommentToPost] Failed to add comment to post '${postSlug}'.`);
    return null;
  }
}

export async function deletePostBySlug(slug: string): Promise<boolean> {
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const result = await collection.deleteOne({ slug: slug });
  if (result.deletedCount === 1) {
    console.log(`[deletePostBySlug] Post with slug '${slug}' deleted successfully.`);
    return true;
  } else {
    console.warn(`[deletePostBySlug] Post with slug '${slug}' not found or delete failed.`);
    return false;
  }
}
