
export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null; // null or undefined for top-level
  children: CategoryNode[];
}

// In-memory store for categories, representing a tree structure.
// Only top-level categories are stored directly in this array.
// Children are nested within their parent nodes.
let categoriesStore: CategoryNode[] = [
  {
    id: 'cat_1',
    name: 'Technology',
    slug: 'technology',
    description: 'All things tech.',
    parentId: null,
    children: [
      {
        id: 'sub_1_1',
        name: 'Software Development',
        slug: 'software-development',
        parentId: 'cat_1',
        description: 'Coding, frameworks, and tools.',
        children: [
          {
            id: 'sub_1_1_1',
            name: 'Web Frameworks',
            slug: 'web-frameworks',
            parentId: 'sub_1_1',
            description: 'React, Vue, Angular, etc.',
            children: [],
          },
        ],
      },
      {
        id: 'sub_1_2',
        name: 'AI & Machine Learning',
        slug: 'ai-ml',
        parentId: 'cat_1',
        description: 'Artificial intelligence and machine learning concepts.',
        children: [],
      },
    ],
  },
  {
    id: 'cat_2',
    name: 'Trading',
    slug: 'trading',
    description: 'Financial markets and trading strategies.',
    parentId: null,
    children: [
      {
        id: 'sub_2_1',
        name: 'Indicators',
        slug: 'indicators',
        parentId: 'cat_2',
        description: 'Technical analysis indicators.',
        children: [],
      },
    ],
  },
  {
    id: 'cat_3',
    name: 'Automation',
    slug: 'automation',
    description: 'Automating tasks and processes.',
    parentId: null,
    children: [],
  },
];

// --- Helper Functions ---
function generateId(): string {
  return `node_${Math.random().toString(36).substring(2, 11)}`;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function findNodeRecursive(nodes: CategoryNode[], idOrSlug: string, findBy: 'id' | 'slug'): CategoryNode | undefined {
  for (const node of nodes) {
    if ((findBy === 'id' && node.id === idOrSlug) || (findBy === 'slug' && node.slug === idOrSlug)) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const foundInChildren = findNodeRecursive(node.children, idOrSlug, findBy);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  return undefined;
}

function findNodeAndParentRecursive(
  nodes: CategoryNode[],
  id: string,
  parent: CategoryNode | null = null
): { node: CategoryNode; parent: CategoryNode | null } | null {
  for (const node of nodes) {
    if (node.id === id) {
      return { node, parent };
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeAndParentRecursive(node.children, id, node);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function isSlugUnique(nodes: CategoryNode[], slug: string, currentIdToExclude?: string): boolean {
  return !nodes.some(node => node.slug === slug && node.id !== currentIdToExclude);
}

// --- CategoryNode CRUD ---

// Returns a deep clone of top-level categories with their children
export function getAllCategories(): CategoryNode[] {
  return JSON.parse(JSON.stringify(categoriesStore));
}

export function getCategoryById(id: string): CategoryNode | undefined {
  const result = findNodeRecursive(categoriesStore, id, 'id');
  return result ? JSON.parse(JSON.stringify(result)) : undefined;
}

// Get category by slug - note: slugs are only guaranteed unique among siblings.
// This function will find the first match. For specific child slugs, use context.
export function getCategoryBySlug(slug: string): CategoryNode | undefined {
  const result = findNodeRecursive(categoriesStore, slug, 'slug');
  return result ? JSON.parse(JSON.stringify(result)) : undefined;
}

export function addCategory(
  categoryData: Omit<CategoryNode, 'id' | 'slug' | 'children'> & { parentId?: string | null }
): CategoryNode {
  const newNode: CategoryNode = {
    id: generateId(),
    slug: createSlug(categoryData.name),
    name: categoryData.name,
    description: categoryData.description,
    parentId: categoryData.parentId || null,
    children: [],
  };

  if (newNode.parentId) {
    const parentNode = findNodeRecursive(categoriesStore, newNode.parentId, 'id');
    if (!parentNode) {
      throw new Error(`Parent category with ID '${newNode.parentId}' not found.`);
    }
    if (!isSlugUnique(parentNode.children, newNode.slug)) {
      throw new Error(`Category with slug '${newNode.slug}' already exists under parent '${parentNode.name}'.`);
    }
    parentNode.children.push(newNode);
  } else {
    if (!isSlugUnique(categoriesStore, newNode.slug)) {
      throw new Error(`Top-level category with slug '${newNode.slug}' already exists.`);
    }
    categoriesStore.push(newNode);
  }
  return JSON.parse(JSON.stringify(newNode));
}

export function updateCategory(
  id: string,
  updates: Partial<Omit<CategoryNode, 'id' | 'slug' | 'children' | 'parentId'>>
): CategoryNode | undefined {
  const foundResult = findNodeAndParentRecursive(categoriesStore, id);
  if (!foundResult) {
    return undefined;
  }

  const { node, parent } = foundResult;
  const originalName = node.name;
  
  // Update properties
  if (updates.name !== undefined) node.name = updates.name;
  if (updates.description !== undefined) node.description = updates.description;

  // If name changed, update slug and check for uniqueness among siblings
  if (updates.name && updates.name !== originalName) {
    const newSlug = createSlug(updates.name);
    const siblings = parent ? parent.children : categoriesStore;
    if (!isSlugUnique(siblings, newSlug, node.id)) {
      // Revert name change if slug conflicts
      node.name = originalName; 
      throw new Error(`Update failed: Category slug '${newSlug}' would conflict with an existing category at the same level.`);
    }
    node.slug = newSlug;
  }
  
  return JSON.parse(JSON.stringify(node));
}

export function deleteCategory(id: string): boolean {
  const foundResult = findNodeAndParentRecursive(categoriesStore, id);
  if (!foundResult) {
    return false;
  }

  const { node, parent } = foundResult;

  if (parent) {
    parent.children = parent.children.filter(child => child.id !== node.id);
  } else {
    // It's a top-level category
    categoriesStore = categoriesStore.filter(n => n.id !== node.id);
  }
  return true;
}
