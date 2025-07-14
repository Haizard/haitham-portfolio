
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const FOOD_TYPES_COLLECTION = 'foodTypes';

export interface FoodType {
  _id?: ObjectId;
  id?: string;
  name: string;
  slug: string;
  description?: string;
}

function docToFoodType(doc: any): FoodType {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as FoodType;
}

function createSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const collection = await getCollection<FoodType>(FOOD_TYPES_COLLECTION);
  const query: Filter<FoodType> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}

export async function getAllFoodTypes(): Promise<FoodType[]> {
  const collection = await getCollection<FoodType>(FOOD_TYPES_COLLECTION);
  const docs = await collection.find({}).sort({ name: 1 }).toArray();
  return docs.map(docToFoodType);
}

export async function getFoodTypeById(id: string): Promise<FoodType | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<FoodType>(FOOD_TYPES_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? docToFoodType(doc) : null;
}

export async function addFoodType(foodTypeData: Omit<FoodType, 'id' | '_id' | 'slug'>): Promise<FoodType> {
  const collection = await getCollection<Omit<FoodType, 'id' | '_id'>>(FOOD_TYPES_COLLECTION);
  const slug = createSlug(foodTypeData.name);
  if (!slug) throw new Error("Name resulted in an empty slug.");

  if (!(await isSlugUnique(slug))) {
    throw new Error(`Food type with slug '${slug}' already exists.`);
  }

  const docToInsert = { slug, ...foodTypeData };
  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), _id: result.insertedId, ...docToInsert };
}

export async function updateFoodType(id: string, updates: Partial<Omit<FoodType, 'id' | '_id' | 'slug'>>): Promise<FoodType | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<FoodType>(FOOD_TYPES_COLLECTION);

  const existing = await collection.findOne({ _id: new ObjectId(id) });
  if (!existing) return null;

  const updatePayload: any = { ...updates };

  if (updates.name && updates.name !== existing.name) {
    const newSlug = createSlug(updates.name);
    if (!newSlug) throw new Error("Updated name resulted in an empty slug.");
    if (!(await isSlugUnique(newSlug, id))) {
      throw new Error(`Update failed: Slug '${newSlug}' would conflict with an existing food type.`);
    }
    updatePayload.slug = newSlug;
  }

  if (Object.keys(updatePayload).length === 0) {
    return docToFoodType(existing);
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  return result ? docToFoodType(result) : null;
}

export async function deleteFoodType(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<FoodType>(FOOD_TYPES_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
