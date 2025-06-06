
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { BlogPost } from './blog-data'; // Import for post counts

const CATEGORIES_COLLECTION = 'categories';

export interface CategoryNode {
  _id?: ObjectId; 
  id?: string; 
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null; 
  children?: CategoryNode[]; 
  postCount?: number; // Added for post count
}

// Helper to convert MongoDB document to CategoryNode interface
function docToCategoryNode(doc: any): CategoryNode {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest, children: rest.children || [], postCount: rest.postCount || 0 } as CategoryNode;
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
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}


export async function getAllCategories(): Promise<CategoryNode[]> {
  const categoriesCollection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  const postsCollection = await getCollection<BlogPost>('posts');

  // Step 1: Fetch all categories
  const allCategoryDocs = await categoriesCollection.find({}).toArray();

  // Step 2: Aggregate post counts for all categories
  const categoryCountsCursor = postsCollection.aggregate([
    { $match: { categoryId: { $exists: true, $ne: null } } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);
  const categoryCountsArray = await categoryCountsCursor.toArray();
  const categoryCountMap = new Map<string, number>();
  categoryCountsArray.forEach(item => {
    if (item._id) { // _id here is the categoryId (string)
      categoryCountMap.set(item._id.toString(), item.count);
    }
  });

  // Step 3: Map docs to CategoryNode and attach post counts
  const allNodesMap = new Map<string, CategoryNode>();
  allCategoryDocs.forEach(doc => {
    const node = docToCategoryNode(doc);
    node.postCount = categoryCountMap.get(node.id!) || 0;
    node.children = []; // Initialize children array
    allNodesMap.set(node.id!, node);
  });

  // Step 4: Build the tree structure
  const tree: CategoryNode[] = [];
  allNodesMap.forEach(node => {
    if (node.parentId && allNodesMap.has(node.parentId)) {
      allNodesMap.get(node.parentId)!.children!.push(node);
    } else {
      tree.push(node); // Top-level node
    }
  });

  // Optional: Sort children for consistent order if needed, e.g., by name
  // function sortChildrenRecursive(nodes: CategoryNode[]): void {
  //   nodes.sort((a, b) => a.name.localeCompare(b.name));
  //   nodes.forEach(node => {
  //     if (node.children && node.children.length > 0) {
  //       sortChildrenRecursive(node.children);
  //     }
  //   });
  // }
  // sortChildrenRecursive(tree);

  return tree;
}


export async function getCategoryById(id: string): Promise<CategoryNode | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  
  const category = docToCategoryNode(doc);
  const postsCollection = await getCollection<BlogPost>('posts');
  category.postCount = await postsCollection.countDocuments({ categoryId: category.id });
  return category;
}

export async function getCategoryBySlug(slug: string, parentId?: string | null): Promise<CategoryNode | null> {
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  const query: Filter<CategoryNode> = { slug };
  if (parentId !== undefined) { 
    query.parentId = parentId;
  }
  const doc = await collection.findOne(query);
  if (!doc) return null;

  const category = docToCategoryNode(doc);
  const postsCollection = await getCollection<BlogPost>('posts');
  category.postCount = await postsCollection.countDocuments({ categoryId: category.id });
  return category;
}

export async function addCategory(
  categoryData: Omit<CategoryNode, 'id' | '_id' | 'slug' | 'children' | 'postCount'> & { name: string, parentId?: string | null }
): Promise<CategoryNode> {
  const collection = await getCollection<Omit<CategoryNode, 'id' | '_id' | 'children' | 'postCount'>>(CATEGORIES_COLLECTION);
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
    parentId: categoryData.parentId || null, 
  };

  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), _id: result.insertedId, ...docToInsert, children: [], postCount: 0 };
}

export async function updateCategory(
  id: string,
  updates: Partial<Omit<CategoryNode, 'id' | '_id' | 'slug' | 'children' | 'parentId' | 'postCount'>>
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
    const currentCategory = docToCategoryNode(existingCategory);
    const postsCollection = await getCollection<BlogPost>('posts');
    currentCategory.postCount = await postsCollection.countDocuments({ categoryId: currentCategory.id });
    return currentCategory;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  if(!result) return null;

  const updatedCategory = docToCategoryNode(result);
  const postsCollection = await getCollection<BlogPost>('posts');
  updatedCategory.postCount = await postsCollection.countDocuments({ categoryId: updatedCategory.id });
  return updatedCategory;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  
  const children = await collection.find({ parentId: id }).toArray();
  for (const child of children) {
    await deleteCategory(child._id.toString()); 
  }
  
  // TODO: Handle posts in this category: re-assign to a default/uncategorized, or nullify categoryId.
  // For now, we are just deleting the category. Posts will retain the old categoryId which will no longer resolve.
  // Example: await getCollection<BlogPost>('posts').updateMany({ categoryId: id }, { $set: { categoryId: null } }); // or some default ID
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function getCategoryPath(categoryId: string): Promise<CategoryNode[]> {
  if (!ObjectId.isValid(categoryId)) return [];
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  const postsCollection = await getCollection<BlogPost>('posts');
  const path: CategoryNode[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const categoryDoc = await collection.findOne({ _id: new ObjectId(currentId) });
    if (!categoryDoc) break;
    const categoryNode = docToCategoryNode(categoryDoc);
    categoryNode.postCount = await postsCollection.countDocuments({ categoryId: categoryNode.id });
    path.unshift(categoryNode); 
    currentId = categoryNode.parentId || null;
  }
  return path;
}


export async function findCategoryBySlugPathRecursive(slugPath: string[]): Promise<CategoryNode | null> {
  const collection = await getCollection<CategoryNode>(CATEGORIES_COLLECTION);
  const postsCollection = await getCollection<BlogPost>('posts');
  let currentParentId: string | null = null;
  let foundNode: CategoryNode | null = null;

  for (const slug of slugPath) {
    const query: Filter<CategoryNode> = { slug: slug, parentId: currentParentId };
    const nodeDoc = await collection.findOne(query);
    if (!nodeDoc) {
      return null; 
    }
    foundNode = docToCategoryNode(nodeDoc);
    currentParentId = foundNode.id!; 
  }
  
  if (foundNode && foundNode.id) {
    foundNode.postCount = await postsCollection.countDocuments({ categoryId: foundNode.id });
    
    async function fetchChildrenWithCounts(parentId: string): Promise<CategoryNode[]> {
        const childrenDocs = await collection.find({ parentId }).toArray();
        const childrenNodes: CategoryNode[] = [];
        for (const childDoc of childrenDocs) {
            const node = docToCategoryNode(childDoc);
            node.postCount = await postsCollection.countDocuments({ categoryId: node.id! });
            node.children = await fetchChildrenWithCounts(node.id!); 
            childrenNodes.push(node);
        }
        return childrenNodes;
    }
    foundNode.children = await fetchChildrenWithCounts(foundNode.id!);
  }
  return foundNode;
}

