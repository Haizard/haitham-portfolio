
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { Service } from './services-data';

const SERVICE_CATEGORIES_COLLECTION = 'serviceCategories';

export interface ServiceCategoryNode {
  _id?: ObjectId;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  children?: ServiceCategoryNode[];
  serviceCount?: number;
}

function docToCategoryNode(doc: any): ServiceCategoryNode {
  if (!doc) return doc;
  const { _id, parentId, ...rest } = doc;
  return {
    id: _id?.toString(),
    parentId: parentId?.toString() || null,
    ...rest,
    children: rest.children || [],
    serviceCount: rest.serviceCount || 0
  } as ServiceCategoryNode;
}

function createSlugFromName(name: string): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (slug.startsWith('-')) slug = slug.substring(1);
  if (slug.endsWith('-')) slug = slug.slice(0, -1);

  return slug || `category-${Date.now()}`;
}

async function isSlugUnique(slug: string, parentId: string | null, excludeId?: string): Promise<boolean> {
  const collection = await getCollection<ServiceCategoryNode>(SERVICE_CATEGORIES_COLLECTION);
  const query: Filter<ServiceCategoryNode> = { slug, parentId: parentId || null };
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}

export async function getAllServiceCategories(): Promise<ServiceCategoryNode[]> {
  const categoriesCollection = await getCollection<ServiceCategoryNode>(SERVICE_CATEGORIES_COLLECTION);
  const servicesCollection = await getCollection<Service>('services');

  const allCategoryDocs = await categoriesCollection.find({}).sort({ name: 1 }).toArray();

  const categoryCountsCursor = servicesCollection.aggregate([
    { $match: { categoryId: { $exists: true, $ne: null } } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);
  const categoryCountsArray = await categoryCountsCursor.toArray();
  const categoryCountMap = new Map<string, number>();
  categoryCountsArray.forEach(item => {
    if (item._id) {
      categoryCountMap.set(item._id.toString(), item.count);
    }
  });

  const allNodesMap = new Map<string, ServiceCategoryNode>();
  allCategoryDocs.forEach(doc => {
    const node = docToCategoryNode(doc);
    node.serviceCount = categoryCountMap.get(node.id!) || 0;
    node.children = [];
    allNodesMap.set(node.id!, node);
  });

  const tree: ServiceCategoryNode[] = [];
  allNodesMap.forEach(node => {
    if (node.parentId && allNodesMap.has(node.parentId)) {
      allNodesMap.get(node.parentId)!.children!.push(node);
    } else {
      tree.push(node);
    }
  });
  return tree;
}

export async function getServiceCategoryById(id: string): Promise<ServiceCategoryNode | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<ServiceCategoryNode>(SERVICE_CATEGORIES_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  const category = docToCategoryNode(doc);
  const servicesCollection = await getCollection<Service>('services');
  category.serviceCount = await servicesCollection.countDocuments({ categoryId: category.id });
  return category;
}

export async function addServiceCategory(
  categoryData: Omit<ServiceCategoryNode, 'id' | '_id' | 'slug' | 'children' | 'serviceCount'> & { name: string, parentId?: string | null }
): Promise<ServiceCategoryNode> {
  const collection = await getCollection<Omit<ServiceCategoryNode, 'id' | '_id' | 'children' | 'serviceCount'>>(SERVICE_CATEGORIES_COLLECTION);
  const slug = createSlugFromName(categoryData.name);
  if (!slug) throw new Error("Category name resulted in an empty slug.");

  if (!(await isSlugUnique(slug, categoryData.parentId || null))) {
    throw new Error(`Category with slug '${slug}' already exists at this level.`);
  }

  if (categoryData.parentId && !ObjectId.isValid(categoryData.parentId)) {
    throw new Error(`Invalid parentId format: ${categoryData.parentId}`);
  }

  const docToInsert = {
    name: categoryData.name,
    slug,
    description: categoryData.description,
    parentId: categoryData.parentId || null,
  };

  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), _id: result.insertedId, ...docToInsert, children: [], serviceCount: 0 };
}

export async function updateServiceCategory(
  id: string,
  updates: Partial<Omit<ServiceCategoryNode, 'id' | '_id' | 'slug' | 'children' | 'parentId' | 'serviceCount'>>
): Promise<ServiceCategoryNode | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<ServiceCategoryNode>(SERVICE_CATEGORIES_COLLECTION);

  const existingCategory = await collection.findOne({ _id: new ObjectId(id) });
  if (!existingCategory) return null;

  const updatePayload: any = {};
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.description !== undefined) updatePayload.description = updates.description;

  if (updates.name && updates.name !== existingCategory.name) {
    const newSlug = createSlugFromName(updates.name);
    if (!newSlug) throw new Error("Updated category name resulted in an empty slug.");
    if (!(await isSlugUnique(newSlug, existingCategory.parentId || null, id))) {
      throw new Error(`Update failed: Category slug '${newSlug}' would conflict with an existing category at the same level.`);
    }
    updatePayload.slug = newSlug;
  }

  if (Object.keys(updatePayload).length === 0) {
    const currentCategory = docToCategoryNode(existingCategory);
    const servicesCollection = await getCollection<Service>('services');
    currentCategory.serviceCount = await servicesCollection.countDocuments({ categoryId: currentCategory.id });
    return currentCategory;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  if (!result) return null;

  const updatedCategory = docToCategoryNode(result);
  const servicesCollection = await getCollection<Service>('services');
  updatedCategory.serviceCount = await servicesCollection.countDocuments({ categoryId: updatedCategory.id });
  return updatedCategory;
}

export async function deleteServiceCategory(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<ServiceCategoryNode>(SERVICE_CATEGORIES_COLLECTION);

  const children = await collection.find({ parentId: id }).toArray();
  for (const child of children) {
    await deleteServiceCategory(child._id.toString());
  }

  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
