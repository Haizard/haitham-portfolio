
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';
import type { Tag } from './tags-data'; // Used for the deprecated `tags` field if needed
import { findOrCreateTagsByNames } from './tags-data';

const POSTS_COLLECTION = 'posts';

export interface BlogPost {
  _id?: ObjectId; // MongoDB specific ID
  id?: string; // String representation of _id, used in application logic
  slug: string;
  title: string;
  author: string;
  authorAvatar: string;
  date: string; // Should be ISOString, consider storing as BSON Date in DB for better querying
  tagIds?: string[];
  imageUrl: string;
  imageHint: string;
  content: string;
  originalLanguage: string;
  categoryId: string; // Will store the string representation of Category's ObjectId
  comments?: { id: string; author: string; avatar: string; date: string; text: string }[];

  // Deprecated, kept for potential data structure reference if needed during transition
  tags?: string[];
}

// Helper to convert MongoDB document to BlogPost interface (especially _id to id)
function docToBlogPost(doc: any): BlogPost {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as BlogPost;
}


export async function getAllPosts(): Promise<BlogPost[]> {
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const postsCursor = await collection.find({}).sort({ date: -1 });
  const postsArray = await postsCursor.toArray();
  return postsArray.map(docToBlogPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const postDoc = await collection.findOne({ slug });
  return postDoc ? docToBlogPost(postDoc) : null;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const postDoc = await collection.findOne({ _id: new ObjectId(id) });
  return postDoc ? docToBlogPost(postDoc) : null;
}


export async function addPost(postData: Omit<BlogPost, 'id' | '_id' | 'date'> & { date?: string }): Promise<BlogPost> {
  const collection = await getCollection<Omit<BlogPost, 'id' | '_id'>>(POSTS_COLLECTION);
  
  const existingPost = await collection.findOne({ slug: postData.slug });
  if (existingPost) {
    throw new Error(`Post with slug '${postData.slug}' already exists.`);
  }

  const docToInsert = {
    ...postData,
    date: postData.date || new Date().toISOString(), // Default to now if not provided
    comments: postData.comments || [],
  };

  const result = await collection.insertOne(docToInsert as any); // Cast to any to handle _id potentially not being in Omit
  
  // Construct the full BlogPost object to return, including the generated ID
  const newPost: BlogPost = {
    _id: result.insertedId,
    id: result.insertedId.toString(),
    ...docToInsert
  };
  return newPost;
}


export async function getPostsByCategoryId(categoryId: string, limit?: number, excludeSlug?: string): Promise<BlogPost[]> {
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const query: any = { categoryId };
  if (excludeSlug) {
    query.slug = { $ne: excludeSlug };
  }
  const cursor = collection.find(query).sort({ date: -1 });
  if (limit) {
    cursor.limit(limit);
  }
  const postsArray = await cursor.toArray();
  return postsArray.map(docToBlogPost);
}

export async function getPostsByTagId(tagId: string, limit?: number, excludeSlug?: string): Promise<BlogPost[]> {
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const query: any = { tagIds: tagId }; // Assumes tagIds is an array of strings
  if (excludeSlug) {
    query.slug = { $ne: excludeSlug };
  }
  const cursor = collection.find(query).sort({ date: -1 });
  if (limit) {
    cursor.limit(limit);
  }
  const postsArray = await cursor.toArray();
  return postsArray.map(docToBlogPost);
}

// Note: updatePost and deletePost functions would be needed for full CRUD
// but are not implemented here to keep the scope manageable for this request.
// They would follow similar patterns: connect, operate, convert _id.
