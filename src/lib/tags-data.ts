
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const TAGS_COLLECTION = 'tags';

export interface Tag {
  _id?: ObjectId;
  id?: string; // String representation of _id
  name: string;
  slug: string;
  description?: string;
}

// Helper to convert MongoDB document to Tag interface
function docToTag(doc: any): Tag {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Tag;
}

function createTagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  const tagsArray = await collection.find({}).sort({ name: 1 }).toArray();
  return tagsArray.map(docToTag);
}

export async function getTagById(id: string): Promise<Tag | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? docToTag(doc) : null;
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ? docToTag(doc) : null;
}

export async function getTagsByIds(ids: string[]): Promise<Tag[]> {
  if (!ids || ids.length === 0) return [];
  const validObjectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
  if (validObjectIds.length === 0) return [];
  
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  const tagsArray = await collection.find({ _id: { $in: validObjectIds } }).toArray();
  return tagsArray.map(docToTag);
}

export async function addTag(tagData: Omit<Tag, 'id' | '_id' | 'slug'> & { name: string }): Promise<Tag> {
  const collection = await getCollection<Omit<Tag, 'id' | '_id'>>(TAGS_COLLECTION);
  const slug = createTagSlug(tagData.name);

  if (!(await isTagSlugUnique(slug))) {
    throw new Error(`Tag with slug '${slug}' already exists.`);
  }

  const docToInsert = {
    name: tagData.name,
    slug,
    description: tagData.description,
  };

  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), _id: result.insertedId, ...docToInsert };
}

export async function findOrCreateTagsByNames(tagNames: string[]): Promise<Tag[]> {
  if (!tagNames || tagNames.length === 0) return [];
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  const resultTags: Tag[] = [];

  for (const name of tagNames) {
    if (typeof name !== 'string' || name.trim() === '') continue;
    const slug = createTagSlug(name);
    let tagDoc = await collection.findOne({ slug });

    if (!tagDoc) {
      const newTagData = {
        name: name, // Use original name casing for display
        slug: slug,
        description: `Content related to ${name}`,
      };
      const result = await collection.insertOne(newTagData as any);
      tagDoc = { _id: result.insertedId, ...newTagData };
    }
    resultTags.push(docToTag(tagDoc));
  }
  return resultTags;
}

export async function updateTag(id: string, updates: Partial<Omit<Tag, 'id' | '_id' | 'slug'>>): Promise<Tag | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<Tag>(TAGS_COLLECTION);

  const existingTag = await collection.findOne({ _id: new ObjectId(id) });
  if (!existingTag) return null;
  
  const updatePayload: any = {};
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.description !== undefined) updatePayload.description = updates.description;

  if (updates.name && updates.name !== existingTag.name) {
    const newSlug = createTagSlug(updates.name);
    if (!(await isTagSlugUnique(newSlug, id))) {
      throw new Error(`Update failed: Tag slug '${newSlug}' would conflict with an existing tag.`);
    }
    updatePayload.slug = newSlug;
  }

  if (Object.keys(updatePayload).length === 0) {
    return docToTag(existingTag); // No changes
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  return result ? docToTag(result) : null;
}

export async function deleteTag(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<Tag>(TAGS_COLLECTION);
  
  // Before deleting the tag, remove it from all posts' tagIds array
  const postsCollection = await getCollection<import('./blog-data').BlogPost>('posts');
  await postsCollection.updateMany(
    { tagIds: id }, // Match posts that contain this tagId
    { $pull: { tagIds: id } } // Remove this tagId from their tagIds array
  );
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
