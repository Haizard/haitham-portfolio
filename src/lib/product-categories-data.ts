
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { Product } from './products-data';

const PRODUCT_CATEGORIES_COLLECTION = 'productCategories';

export interface ProductCategoryNode {
  _id?: ObjectId; 
  id?: string; 
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null; 
  children?: ProductCategoryNode[]; 
  productCount?: number;
}

function docToCategoryNode(doc: any): ProductCategoryNode {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest, children: rest.children || [], productCount: rest.productCount || 0 } as ProductCategoryNode;
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
  const collection = await getCollection<ProductCategoryNode>(PRODUCT_CATEGORIES_COLLECTION);
  const query: Filter<ProductCategoryNode> = { slug, parentId: parentId || null };
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}


export async function getAllProductCategories(): Promise<ProductCategoryNode[]> {
  const categoriesCollection = await getCollection<ProductCategoryNode>(PRODUCT_CATEGORIES_COLLECTION);
  const productsCollection = await getCollection<Product>('products');

  const allCategoryDocs = await categoriesCollection.find({}).sort({ name: 1 }).toArray();

  const categoryCountsCursor = productsCollection.aggregate([
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

  const allNodesMap = new Map<string, ProductCategoryNode>();
  allCategoryDocs.forEach(doc => {
    const node = docToCategoryNode(doc);
    node.productCount = categoryCountMap.get(node.id!) || 0;
    node.children = [];
    allNodesMap.set(node.id!, node);
  });

  const tree: ProductCategoryNode[] = [];
  allNodesMap.forEach(node => {
    if (node.parentId && allNodesMap.has(node.parentId)) {
      allNodesMap.get(node.parentId)!.children!.push(node);
    } else {
      tree.push(node);
    }
  });
  return tree;
}

export async function getProductCategoryById(id: string): Promise<ProductCategoryNode | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<ProductCategoryNode>(PRODUCT_CATEGORIES_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  
  const category = docToCategoryNode(doc);
  const productsCollection = await getCollection<Product>('products');
  category.productCount = await productsCollection.countDocuments({ categoryId: category.id });
  return category;
}

export async function addProductCategory(
  categoryData: Omit<ProductCategoryNode, 'id' | '_id' | 'slug' | 'children' | 'productCount'> & { name: string, parentId?: string | null }
): Promise<ProductCategoryNode> {
  const collection = await getCollection<Omit<ProductCategoryNode, 'id' | '_id' | 'children' | 'productCount'>>(PRODUCT_CATEGORIES_COLLECTION);
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
  return { id: result.insertedId.toString(), _id: result.insertedId, ...docToInsert, children: [], productCount: 0 };
}

export async function updateProductCategory(
  id: string,
  updates: Partial<Omit<ProductCategoryNode, 'id' | '_id' | 'slug' | 'children' | 'parentId' | 'productCount'>>
): Promise<ProductCategoryNode | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<ProductCategoryNode>(PRODUCT_CATEGORIES_COLLECTION);

  const existingCategory = await collection.findOne({_id: new ObjectId(id)});
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
    const productsCollection = await getCollection<Product>('products');
    currentCategory.productCount = await productsCollection.countDocuments({ categoryId: currentCategory.id });
    return currentCategory;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  if(!result) return null;

  const updatedCategory = docToCategoryNode(result);
  const productsCollection = await getCollection<Product>('products');
  updatedCategory.productCount = await productsCollection.countDocuments({ categoryId: updatedCategory.id });
  return updatedCategory;
}

export async function deleteProductCategory(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<ProductCategoryNode>(PRODUCT_CATEGORIES_COLLECTION);
  
  const children = await collection.find({ parentId: id }).toArray();
  for (const child of children) {
    await deleteProductCategory(child._id.toString()); 
  }
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
