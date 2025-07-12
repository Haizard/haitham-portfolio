
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { Product } from './products-data';

const PRODUCT_TAGS_COLLECTION = 'productTags';

export interface ProductTag {
  _id?: ObjectId;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
}

function docToTag(doc: any): ProductTag {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as ProductTag;
}

function createTagSlug(name: string): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (slug.startsWith('-')) slug = slug.substring(1);
  if (slug.endsWith('-')) slug = slug.slice(0, -1);
  
  return slug || `tag-${Date.now()}`;
}

async function isTagSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const collection = await getCollection<ProductTag>(PRODUCT_TAGS_COLLECTION);
  const query: Filter<ProductTag> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}

export async function getAllProductTags(): Promise<ProductTag[]> {
  const tagsCollection = await getCollection<ProductTag>(PRODUCT_TAGS_COLLECTION);
  const productsCollection = await getCollection<Product>('products');
  
  const tagsArray = await tagsCollection.find({}).sort({ name: 1 }).toArray();

  const tagCountsCursor = productsCollection.aggregate([
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

  return tagsArray.map(doc => {
    const tag = docToTag(doc);
    tag.productCount = tagCountMap.get(tag.id!) || 0;
    return tag;
  });
}

export async function getProductTagById(id: string): Promise<ProductTag | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<ProductTag>(PRODUCT_TAGS_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  const tag = docToTag(doc);
  const productsCollection = await getCollection<Product>('products');
  tag.productCount = await productsCollection.countDocuments({ tagIds: tag.id });
  return tag;
}

export async function getProductTagsByIds(ids: string[]): Promise<ProductTag[]> {
  if (!ids || ids.length === 0) return [];
  const validObjectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
  if (validObjectIds.length === 0) return [];
  
  const collection = await getCollection<ProductTag>(PRODUCT_TAGS_COLLECTION);
  const tagsArray = await collection.find({ _id: { $in: validObjectIds } }).toArray();
  return tagsArray.map(docToTag);
}

export async function addProductTag(tagData: Omit<ProductTag, 'id' | '_id' | 'slug' | 'productCount'> & { name: string }): Promise<ProductTag> {
  const collection = await getCollection<Omit<ProductTag, 'id' | '_id' | 'productCount'>>(PRODUCT_TAGS_COLLECTION);
  const slug = createTagSlug(tagData.name);
  if (!slug) throw new Error("Tag name resulted in an empty slug.");

  if (!(await isTagSlugUnique(slug))) {
    throw new Error(`Tag with slug '${slug}' already exists.`);
  }

  const docToInsert = {
    name: tagData.name,
    slug,
    description: tagData.description,
  };

  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), _id: result.insertedId, ...docToInsert, productCount: 0 };
}

export async function findOrCreateProductTagsByNames(tagNames: string[]): Promise<ProductTag[]> {
  if (!tagNames || tagNames.length === 0) return [];
  const collection = await getCollection<ProductTag>(PRODUCT_TAGS_COLLECTION);
  const resultTags: ProductTag[] = [];

  for (const name of tagNames) {
    if (typeof name !== 'string' || name.trim() === '') continue;
    const slug = createTagSlug(name);
     if (!slug) continue;

    let tagDoc = await collection.findOne({ slug });

    if (!tagDoc) {
      const newTagData = {
        name: name, 
        slug: slug,
        description: `Products related to ${name}`,
      };
      const result = await collection.insertOne(newTagData as any);
      tagDoc = { _id: result.insertedId, ...newTagData };
    }
    const tagWithCount = docToTag(tagDoc);
    resultTags.push(tagWithCount);
  }
  return resultTags;
}

export async function updateProductTag(id: string, updates: Partial<Omit<ProductTag, 'id' | '_id' | 'slug' | 'productCount'>>): Promise<ProductTag | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<ProductTag>(PRODUCT_TAGS_COLLECTION);

  const existingTag = await collection.findOne({ _id: new ObjectId(id) });
  if (!existingTag) return null;
  
  const updatePayload: any = {};
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.description !== undefined) updatePayload.description = updates.description;

  if (updates.name && updates.name !== existingTag.name) {
    const newSlug = createTagSlug(updates.name);
    if (!newSlug) throw new Error("Updated tag name resulted in an empty slug.");
    if (!(await isTagSlugUnique(newSlug, id))) {
      throw new Error(`Update failed: Tag slug '${newSlug}' would conflict with an existing tag.`);
    }
    updatePayload.slug = newSlug;
  }

  if (Object.keys(updatePayload).length === 0) {
    const currentTag = docToTag(existingTag);
    const productsCollection = await getCollection<Product>('products');
    currentTag.productCount = await productsCollection.countDocuments({ tagIds: currentTag.id });
    return currentTag;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  
  if (!result) return null;
  const updatedTag = docToTag(result);
  const productsCollection = await getCollection<Product>('products');
  updatedTag.productCount = await productsCollection.countDocuments({ tagIds: updatedTag.id });
  return updatedTag;
}

export async function deleteProductTag(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<ProductTag>(PRODUCT_TAGS_COLLECTION);
  
  const productsCollection = await getCollection<Product>('products');
  await productsCollection.updateMany(
    { tagIds: id }, 
    { $pull: { tagIds: id } } 
  );
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
