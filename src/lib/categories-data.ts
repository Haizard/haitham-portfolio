
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  parentCategoryId: string;
  description?: string;
}

let categories: Category[] = [
  { id: 'cat_1', name: 'Technology', slug: 'technology', description: 'All things tech.' },
  { id: 'cat_2', name: 'Trading', slug: 'trading', description: 'Financial markets and trading strategies.' },
  { id: 'cat_3', name: 'Automation', slug: 'automation', description: 'Automating tasks and processes.' },
];

let subcategories: Subcategory[] = [
  { id: 'sub_1', name: 'Software Development', slug: 'software-development', parentCategoryId: 'cat_1', description: 'Coding, frameworks, and tools.' },
  { id: 'sub_2', name: 'AI & Machine Learning', slug: 'ai-ml', parentCategoryId: 'cat_1', description: 'Artificial intelligence and machine learning concepts.' },
  { id: 'sub_3', name: 'Indicators', slug: 'indicators', parentCategoryId: 'cat_2', description: 'Technical analysis indicators.' },
  { id: 'sub_4', name: 'Trading Bots', slug: 'trading-bots', parentCategoryId: 'cat_2', description: 'Automated trading systems.' },
];

// --- Helper Functions ---
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// --- Category CRUD ---
export function getAllCategories(): Category[] {
  return [...categories];
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(cat => cat.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(cat => cat.slug === slug);
}

export function addCategory(categoryData: Omit<Category, 'id' | 'slug'>): Category {
  const newCategory: Category = {
    id: generateId(),
    slug: createSlug(categoryData.name),
    ...categoryData,
  };
  // Check for duplicate slug/name before adding
  if (categories.some(cat => cat.slug === newCategory.slug)) {
    throw new Error(`Category with slug '${newCategory.slug}' already exists.`);
  }
  categories.push(newCategory);
  return newCategory;
}

export function updateCategory(idOrSlug: string, updates: Partial<Omit<Category, 'id' | 'slug'>>): Category | undefined {
  const findCategory = (cat: Category) => cat.id === idOrSlug || cat.slug === idOrSlug;
  const categoryIndex = categories.findIndex(findCategory);

  if (categoryIndex === -1) {
    return undefined;
  }

  const originalCategory = categories[categoryIndex];
  const updatedCategoryFields = { ...originalCategory, ...updates };

  // If name is updated, slug should also be updated
  if (updates.name && updates.name !== originalCategory.name) {
    updatedCategoryFields.slug = createSlug(updates.name);
    // Check if new slug conflicts with another category (excluding itself)
    if (categories.some(cat => cat.slug === updatedCategoryFields.slug && cat.id !== originalCategory.id)) {
      throw new Error(`Update failed: Category slug '${updatedCategoryFields.slug}' would conflict with an existing category.`);
    }
  }
  
  categories[categoryIndex] = updatedCategoryFields;
  return categories[categoryIndex];
}

export function deleteCategory(idOrSlug: string): boolean {
  const categoryIndex = categories.findIndex(cat => cat.id === idOrSlug || cat.slug === idOrSlug);
  if (categoryIndex === -1) {
    return false;
  }
  const categoryToDelete = categories[categoryIndex];
  categories.splice(categoryIndex, 1);
  // Also delete associated subcategories
  subcategories = subcategories.filter(sub => sub.parentCategoryId !== categoryToDelete.id);
  return true;
}

// --- Subcategory CRUD ---
export function getSubcategoriesByParentId(parentCategoryId: string): Subcategory[] {
  return subcategories.filter(sub => sub.parentCategoryId === parentCategoryId);
}

export function getSubcategoryById(id: string): Subcategory | undefined {
  return subcategories.find(sub => sub.id === id);
}

export function getSubcategoryBySlug(parentCategoryId: string, slug: string): Subcategory | undefined {
    return subcategories.find(sub => sub.parentCategoryId === parentCategoryId && sub.slug === slug);
}


export function addSubcategory(parentCategoryId: string, subcategoryData: Omit<Subcategory, 'id' | 'slug' | 'parentCategoryId'>): Subcategory {
  const parentCategory = getCategoryById(parentCategoryId);
  if (!parentCategory) {
    throw new Error(`Parent category with ID '${parentCategoryId}' not found.`);
  }
  const newSubcategory: Subcategory = {
    id: generateId(),
    slug: createSlug(subcategoryData.name),
    parentCategoryId: parentCategoryId,
    ...subcategoryData,
  };
  // Check for duplicate slug/name within the same parent category
  if (subcategories.some(sub => sub.parentCategoryId === parentCategoryId && sub.slug === newSubcategory.slug)) {
    throw new Error(`Subcategory with slug '${newSubcategory.slug}' already exists under parent '${parentCategory.name}'.`);
  }
  subcategories.push(newSubcategory);
  return newSubcategory;
}

export function updateSubcategory(idOrSlug: string, updates: Partial<Omit<Subcategory, 'id' | 'slug' | 'parentCategoryId'>>): Subcategory | undefined {
  const findSubcategory = (sub: Subcategory) => sub.id === idOrSlug || sub.slug === idOrSlug;
  const subcategoryIndex = subcategories.findIndex(findSubcategory);

  if (subcategoryIndex === -1) {
    return undefined;
  }
  
  const originalSubcategory = subcategories[subcategoryIndex];
  const updatedSubcategoryFields = { ...originalSubcategory, ...updates };

  // If name is updated, slug should also be updated
  if (updates.name && updates.name !== originalSubcategory.name) {
    updatedSubcategoryFields.slug = createSlug(updates.name);
     // Check if new slug conflicts with another subcategory under the same parent (excluding itself)
    if (subcategories.some(sub => sub.parentCategoryId === originalSubcategory.parentCategoryId && sub.slug === updatedSubcategoryFields.slug && sub.id !== originalSubcategory.id)) {
      throw new Error(`Update failed: Subcategory slug '${updatedSubcategoryFields.slug}' would conflict with an existing subcategory under the same parent.`);
    }
  }

  subcategories[subcategoryIndex] = updatedSubcategoryFields;
  return subcategories[subcategoryIndex];
}

export function deleteSubcategory(idOrSlug: string): boolean {
  const subcategoryIndex = subcategories.findIndex(sub => sub.id === idOrSlug || sub.slug === idOrSlug);
  if (subcategoryIndex === -1) {
    return false;
  }
  subcategories.splice(subcategoryIndex, 1);
  return true;
}
