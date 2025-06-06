
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { BlogPost } from './blog-data'; // Import BlogPost for posts collection type

const TAGS_COLLECTION = 'tags';

export interface Tag {
  _id?: ObjectId;
  id?: string; // String representation of _id
  name: string;
  slug: string;
  description?: string;
  postCount?: number; // Added for post count
}

// Helper to convert MongoDB document to Tag interface
function docToTag(doc: any): Tag {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Tag;
}

function createTagSlug(name: string): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars except space and hyphen
    .trim() // remove leading/trailing whitespace
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/-+/g, '-'); // replace multiple - with single -

  // Remove leading/trailing hyphens that might result from trimming
  if (slug.startsWith('-')) {
    slug = slug.substring(1);
  }
  if (slug.endsWith('-')) {
    slug = slug.slice(0, -1);
  }
  
  return slug || `tag-${Date.now()}`; // Default if empty
}

async function isTagSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  const query: Filter<Tag> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}

export async function getAllTags(): Promise<Tag[]> {
  const tagsCollection = await getCollection<Tag>(TAGS_COLLECTION);
  const postsCollection = await getCollection<BlogPost>('posts');
  
  const tagsArray = await tagsCollection.find({}).sort({ name: 1 }).toArray();

  // Aggregate post counts for all tags
  const tagCountsCursor = postsCollection.aggregate([
    { $match: { tagIds: { $exists: true, $ne: null, $not: { $size: 0 } } } }, 
    { $unwind: "$tagIds" }, 
    { $group: { _id: "$tagIds", count: { $sum: 1 } } }, 
  ]);
  const tagCountsArray = await tagCountsCursor.toArray();

  const tagCountMap = new Map<string, number>();
  tagCountsArray.forEach(item => {
    if (item._id) { 
      tagCountMap.set(item._id.toString(), item.count);
    }
  });

  // Map counts to tags
  return tagsArray.map(doc => {
    const tag = docToTag(doc);
    tag.postCount = tagCountMap.get(tag.id!) || 0;
    return tag;
  });
}

export async function getTagById(id: string): Promise<Tag | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  const tag = docToTag(doc);
  const postsCollection = await getCollection<BlogPost>('posts');
  tag.postCount = await postsCollection.countDocuments({ tagIds: tag.id });
  return tag;
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  const doc = await collection.findOne({ slug });
  if (!doc) return null;

  const tag = docToTag(doc);
  const postsCollection = await getCollection<BlogPost>('posts');
  tag.postCount = await postsCollection.countDocuments({ tagIds: tag.id });
  return tag;
}

export async function getTagsByIds(ids: string[]): Promise<Tag[]> {
  if (!ids || ids.length === 0) return [];
  const validObjectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
  if (validObjectIds.length === 0) return [];
  
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  const tagsArray = await collection.find({ _id: { $in: validObjectIds } }).toArray();
  return tagsArray.map(docToTag);
}

export async function addTag(tagData: Omit<Tag, 'id' | '_id' | 'slug' | 'postCount'> & { name: string }): Promise<Tag> {
  const collection = await getCollection<Omit<Tag, 'id' | '_id' | 'postCount'>>(TAGS_COLLECTION);
  const slug = createTagSlug(tagData.name);
  if (!slug) { // Should not happen
      throw new Error("Tag name resulted in an empty slug.");
  }

  if (!(await isTagSlugUnique(slug))) {
    throw new Error(`Tag with slug '${slug}' already exists.`);
  }

  const docToInsert = {
    name: tagData.name,
    slug,
    description: tagData.description,
  };

  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), _id: result.insertedId, ...docToInsert, postCount: 0 };
}

export async function findOrCreateTagsByNames(tagNames: string[]): Promise<Tag[]> {
  if (!tagNames || tagNames.length === 0) return [];
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  const resultTags: Tag[] = [];

  for (const name of tagNames) {
    if (typeof name !== 'string' || name.trim() === '') continue;
    const slug = createTagSlug(name);
     if (!slug) continue; // Skip if slug is empty after creation

    let tagDoc = await collection.findOne({ slug });

    if (!tagDoc) {
      const newTagData = {
        name: name, 
        slug: slug,
        description: `Content related to ${name}`,
      };
      const result = await collection.insertOne(newTagData as any);
      tagDoc = { _id: result.insertedId, ...newTagData };
    }
    const tagWithCount = docToTag(tagDoc);
    resultTags.push(tagWithCount);
  }
  return resultTags;
}

export async function updateTag(id: string, updates: Partial<Omit<Tag, 'id' | '_id' | 'slug' | 'postCount'>>): Promise<Tag | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<Tag>(TAGS_COLLECTION);

  const existingTag = await collection.findOne({ _id: new ObjectId(id) });
  if (!existingTag) return null;
  
  const updatePayload: any = {};
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.description !== undefined) updatePayload.description = updates.description;

  if (updates.name && updates.name !== existingTag.name) {
    const newSlug = createTagSlug(updates.name);
    if (!newSlug) { // Should not happen
        throw new Error("Updated tag name resulted in an empty slug.");
    }
    if (!(await isTagSlugUnique(newSlug, id))) {
      throw new Error(`Update failed: Tag slug '${newSlug}' would conflict with an existing tag.`);
    }
    updatePayload.slug = newSlug;
  }

  if (Object.keys(updatePayload).length === 0) {
    const currentTag = docToTag(existingTag);
    const postsCollection = await getCollection<BlogPost>('posts');
    currentTag.postCount = await postsCollection.countDocuments({ tagIds: currentTag.id });
    return currentTag;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  
  if (!result) return null;
  const updatedTag = docToTag(result);
  const postsCollection = await getCollection<BlogPost>('posts');
  updatedTag.postCount = await postsCollection.countDocuments({ tagIds: updatedTag.id }); // Recalculate count
  return updatedTag;
}

export async function deleteTag(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  
  const postsCollection = await getCollection<BlogPost>('posts');
  await postsCollection.updateMany(
    { tagIds: id }, 
    { $pull: { tagIds: id } } 
  );
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
