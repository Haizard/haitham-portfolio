
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const CATEGORIES_COLLECTION = 'categories';

export interface CategoryNode {
  _id?: ObjectId; // MongoDB specific ID
  id?: string; // String representation of _id
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null; // Stores string representation of parent's ObjectId
  // children are not stored directly in the document; they are resolved dynamically
  // For simplicity in this refactor, children will be fetched separately if needed
  // or category path logic will rely on parentId lookups.
  children?: CategoryNode[]; // This will be populated dynamically if needed
}

// Helper to convert MongoDB document to CategoryNode interface
function docToCategoryNode(doc: any): CategoryNode {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  // Children are not directly stored, so don't expect them from DB doc unless explicitly joined/populated
  return { id: _id?.toString(), ...rest, children: rest.children || [] } as CategoryNode;
}

function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function isSlugUnique(slug: string, parentId: string | null, excludeId?: string): Promise<boolean> {
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  const query: Filter<CategoryNode> = { slug, parentId: parentId || null };
  if (excludeId) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}


export async function getAllCategories(): Promise<CategoryNode[]> {
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  const categories = await collection.find({ parentId: { $in: [null, undefined] } }).toArray(); // Get top-level

  // Recursive function to fetch children
  async function fetchChildren(parentId: string): Promise<CategoryNode[]> {
    const childrenDocs = await collection.find({ parentId }).toArray();
    const childrenNodes: CategoryNode[] = [];
    for (const childDoc of childrenDocs) {
      const node = docToCategoryNode(childDoc);
      node.children = await fetchChildren(node.id!);
      childrenNodes.push(node);
    }
    return childrenNodes;
  }

  const categoryTree: CategoryNode[] = [];
  for (const categoryDoc of categories) {
    const node = docToCategoryNode(categoryDoc);
    node.children = await fetchChildren(node.id!);
    categoryTree.push(node);
  }
  return categoryTree;
}

export async function getCategoryById(id: string): Promise<CategoryNode | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? docToCategoryNode(doc) : null;
}

export async function getCategoryBySlug(slug: string, parentId?: string | null): Promise<CategoryNode | null> {
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  const query: Filter<CategoryNode> = { slug };
  if (parentId !== undefined) { // Allows finding top-level slug if parentId is null
    query.parentId = parentId;
  }
  const doc = await collection.findOne(query);
  return doc ? docToCategoryNode(doc) : null;
}

export async function addCategory(
  categoryData: Omit<CategoryNode, 'id' | '_id' | 'slug' | 'children'> & { name: string, parentId?: string | null }
): Promise<CategoryNode> {
  const collection = await getCollection<Omit<CategoryNode, 'id' | '_id' | 'children'>>(CATEGORIES_COLLECTION);
  const slug = createSlugFromName(categoryData.name);

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
    parentId: categoryData.parentId || null, // Store as string or null
  };

  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), _id: result.insertedId, ...docToInsert, children: [] };
}

export async function updateCategory(
  id: string,
  updates: Partial<Omit<CategoryNode, 'id' | '_id' | 'slug' | 'children' | 'parentId'>>
): Promise<CategoryNode | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);

  const existingCategory = await collection.findOne({_id: new ObjectId(id)});
  if (!existingCategory) return null;

  const updatePayload: any = {};
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.description !== undefined) updatePayload.description = updates.description;

  if (updates.name && updates.name !== existingCategory.name) {
    const newSlug = createSlugFromName(updates.name);
    if (!(await isSlugUnique(newSlug, existingCategory.parentId || null, id))) {
      throw new Error(`Update failed: Category slug '${newSlug}' would conflict with an existing category at the same level.`);
    }
    updatePayload.slug = newSlug;
  }
  
  if (Object.keys(updatePayload).length === 0) {
    return docToCategoryNode(existingCategory); // No changes
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  return result ? docToCategoryNode(result) : null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  
  // Recursively delete children
  const children = await collection.find({ parentId: id }).toArray();
  for (const child of children) {
    await deleteCategory(child._id.toString()); // child._id is ObjectId
  }
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function getCategoryPath(categoryId: string): Promise<CategoryNode[]> {
  if (!ObjectId.isValid(categoryId)) return [];
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  const path: CategoryNode[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const categoryDoc = await collection.findOne({ _id: new ObjectId(currentId) });
    if (!categoryDoc) break;
    const categoryNode = docToCategoryNode(categoryDoc);
    path.unshift(categoryNode); // Add to the beginning of the path
    currentId = categoryNode.parentId || null;
  }
  return path;
}


export async function findCategoryBySlugPathRecursive(slugPath: string[]): Promise<CategoryNode | null> {
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  let currentParentId: string | null = null;
  let foundNode: CategoryNode | null = null;

  for (const slug of slugPath) {
    const query: Filter<CategoryNode> = { slug: slug, parentId: currentParentId };
    const nodeDoc = await collection.findOne(query);
    if (!nodeDoc) {
      return null; // Path segment not found
    }
    foundNode = docToCategoryNode(nodeDoc);
    currentParentId = foundNode.id!; // Use the ID of the found node as parent for the next segment
  }
  
  // If foundNode is not null here, it's the category at the end of the path.
  // We might want to fetch its children for the archive page.
  if (foundNode) {
     // Recursive function to fetch children, similar to getAllCategories
    async function fetchChildren(parentId: string): Promise<CategoryNode[]> {
        const childrenDocs = await collection.find({ parentId }).toArray();
        const childrenNodes: CategoryNode[] = [];
        for (const childDoc of childrenDocs) {
        const node = docToCategoryNode(childDoc);
        node.children = await fetchChildren(node.id!); // Recursively fetch grandchildren
        childrenNodes.push(node);
        }
        return childrenNodes;
    }
    foundNode.children = await fetchChildren(foundNode.id!);
  }
  return foundNode;
}
