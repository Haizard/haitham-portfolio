
export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  children: CategoryNode[];
}

let categoriesStore: CategoryNode[] = [
  {
    id: 'cat_1',
    name: 'Technology',
    slug: 'technology',
    description: 'All things tech, from software to hardware and emerging trends.',
    parentId: null,
    children: [
      {
        id: 'sub_1_1',
        name: 'Software Development',
        slug: 'software-development',
        parentId: 'cat_1',
        description: 'Coding, frameworks, methodologies, and tools for developers.',
        children: [
          {
            id: 'sub_1_1_1',
            name: 'Web Frameworks',
            slug: 'web-frameworks',
            parentId: 'sub_1_1',
            description: 'Discussion about React, Vue, Angular, Svelte, and others.',
            children: [],
          },
          {
            id: 'sub_1_1_2',
            name: 'Backend Development',
            slug: 'backend-development',
            parentId: 'sub_1_1',
            description: 'Server-side logic, APIs, and databases.',
            children: [],
          }
        ],
      },
      {
        id: 'sub_1_2',
        name: 'AI & Machine Learning',
        slug: 'ai-ml',
        parentId: 'cat_1',
        description: 'Artificial intelligence concepts, machine learning models, and applications.',
        children: [],
      },
    ],
  },
  {
    id: 'cat_2',
    name: 'Trading',
    slug: 'trading',
    description: 'Financial markets, investment strategies, and trading techniques.',
    parentId: null,
    children: [
      {
        id: 'sub_2_1',
        name: 'Technical Analysis',
        slug: 'technical-analysis',
        parentId: 'cat_2',
        description: 'Using charts and indicators to predict market movements.',
        children: [],
      },
    ],
  },
  {
    id: 'cat_3',
    name: 'Automation',
    slug: 'automation',
    description: 'Automating tasks and processes in various domains.',
    parentId: null,
    children: [],
  },
];

function generateId(): string {
  return `node_${Math.random().toString(36).substring(2, 11)}`;
}

function createSlugFromName(name: string): string {
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

function isSlugUniqueAmongSiblings(siblings: CategoryNode[], slug: string, currentIdToExclude?: string): boolean {
  return !siblings.some(node => node.slug === slug && node.id !== currentIdToExclude);
}

export function getAllCategories(): CategoryNode[] {
  return JSON.parse(JSON.stringify(categoriesStore));
}

export function getCategoryById(id: string): CategoryNode | undefined {
  const result = findNodeRecursive(categoriesStore, id, 'id');
  return result ? JSON.parse(JSON.stringify(result)) : undefined;
}

export function getCategoryBySlug(slug: string): CategoryNode | undefined {
  const result = findNodeRecursive(categoriesStore, slug, 'slug');
  return result ? JSON.parse(JSON.stringify(result)) : undefined;
}

export function addCategory(
  categoryData: Omit<CategoryNode, 'id' | 'slug' | 'children'> & { parentId?: string | null }
): CategoryNode {
  const newNode: CategoryNode = {
    id: generateId(),
    slug: createSlugFromName(categoryData.name),
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
    if (!isSlugUniqueAmongSiblings(parentNode.children, newNode.slug)) {
      throw new Error(`Category with slug '${newNode.slug}' already exists under parent '${parentNode.name}'.`);
    }
    parentNode.children.push(newNode);
  } else {
    if (!isSlugUniqueAmongSiblings(categoriesStore, newNode.slug)) {
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
  
  if (updates.name !== undefined) node.name = updates.name;
  if (updates.description !== undefined) node.description = updates.description;

  if (updates.name && updates.name !== originalName) {
    const newSlug = createSlugFromName(updates.name);
    const siblings = parent ? parent.children : categoriesStore;
    if (!isSlugUniqueAmongSiblings(siblings, newSlug, node.id)) {
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
    categoriesStore = categoriesStore.filter(n => n.id !== node.id);
  }
  return true;
}

export function getCategoryPath(categoryId: string): CategoryNode[] {
  const path: CategoryNode[] = [];
  let currentNode = findNodeRecursive(categoriesStore, categoryId, 'id');

  while (currentNode) {
    path.unshift(JSON.parse(JSON.stringify(currentNode))); // Add a clone to the beginning of the path
    if (currentNode.parentId) {
      currentNode = findNodeRecursive(categoriesStore, currentNode.parentId, 'id');
    } else {
      currentNode = undefined;
    }
  }
  return path;
}

export function findCategoryBySlugPathRecursive(slugPath: string[], nodes: CategoryNode[] = categoriesStore): CategoryNode | undefined {
  if (!slugPath || slugPath.length === 0) {
    return undefined;
  }
  const currentSlug = slugPath[0];
  const foundNode = nodes.find(node => node.slug === currentSlug);

  if (!foundNode) {
    return undefined;
  }

  if (slugPath.length === 1) {
    return JSON.parse(JSON.stringify(foundNode)); // Found the target node
  }

  // If there are more slugs in the path, search in children
  if (foundNode.children && foundNode.children.length > 0) {
    return findCategoryBySlugPathRecursive(slugPath.slice(1), foundNode.children);
  }
  return undefined; // Path continues but no children to search
}
