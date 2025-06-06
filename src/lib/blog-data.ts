
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';

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
  author: string;
  authorAvatar: string;
  date: string;
  tagIds?: string[];
  
  featuredImageUrl?: string;
  featuredImageHint?: string;
  galleryImages?: GalleryImage[];
  downloads?: DownloadLink[];

  content: string; // HTML content
  originalLanguage: string;
  categoryId: string;
  comments?: Comment[];
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

export async function getAllPosts(): Promise<BlogPost[]> {
  console.log("Attempting to fetch all posts from DB");
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const postsCursor = await collection.find({}).sort({ date: -1 });
  const postsArray = await postsCursor.toArray();
  console.log(`Fetched ${postsArray.length} posts from DB`);
  return postsArray.map(docToBlogPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  console.log(`Attempting to get post by slug: ${slug} from DB`);
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const postDoc = await collection.findOne({ slug });
  console.log(`Post found for slug ${slug}:`, !!postDoc);
  return postDoc ? docToBlogPost(postDoc) : null;
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

export async function addPost(postData: Omit<BlogPost, 'id' | '_id' | 'date'> & { date?: string }): Promise<BlogPost> {
  const collection = await getCollection<Omit<BlogPost, 'id' | '_id'>>(POSTS_COLLECTION);
  
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
  console.log(`[addPost] Post added with slug '${newPost.slug}'. Total posts might require re-fetch to see updated count from DB.`);
  return newPost;
}

export async function updatePost(id: string, updates: Partial<Omit<BlogPost, 'id' | '_id' | 'slug' | 'date' | 'comments' >>): Promise<BlogPost | null> {
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


export async function getPostsByCategoryId(categoryId: string, limit?: number, excludeSlug?: string): Promise<BlogPost[]> {
  if (!ObjectId.isValid(categoryId)) {
    console.warn(`getPostsByCategoryId: Invalid categoryId format: ${categoryId}`);
    return [];
  }
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
   if (!ObjectId.isValid(tagId)) {
    console.warn(`getPostsByTagId: Invalid tagId format: ${tagId}`);
    return [];
  }
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const query: any = { tagIds: tagId };
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

export async function addCommentToPost(postSlug: string, commentData: Omit<Comment, 'id'>): Promise<Comment | null> {
  const collection = await getCollection<BlogPost>(POSTS_COLLECTION);
  const post = await collection.findOne({ slug: postSlug });

  if (!post) {
    console.warn(`[addCommentToPost] Post with slug '${postSlug}' not found.`);
    return null;
  }

  const newComment: Comment = {
    id: new ObjectId().toString(), // Generate a new unique ID for the comment
    ...commentData,
  };

  const result = await collection.updateOne(
    { slug: postSlug },
    { $push: { comments: { $each: [newComment], $position: 0 } } } // Add to the beginning of the array
  );

  if (result.modifiedCount === 1) {
    console.log(`[addCommentToPost] Comment added to post '${postSlug}'.`);
    return newComment;
  } else {
    console.warn(`[addCommentToPost] Failed to add comment to post '${postSlug}'.`);
    return null;
  }
}
