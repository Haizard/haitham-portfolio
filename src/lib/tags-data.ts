
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

let tagsStore: Tag[] = [
  { id: 'tag_1', name: 'AI', slug: 'ai', description: 'Artificial Intelligence topics' },
  { id: 'tag_2', name: 'React', slug: 'react', description: 'Posts about the React library' },
  { id: 'tag_3', name: 'Productivity', slug: 'productivity', description: 'Tips and tricks for being more productive' },
  { id: 'tag_4', name: 'Next.js', slug: 'next-js', description: 'Content related to Next.js framework' },
];

function generateTagId(): string {
  return `tag_${Math.random().toString(36).substring(2, 9)}`;
}

function createTagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getAllTags(): Tag[] {
  return JSON.parse(JSON.stringify(tagsStore));
}

export function getTagById(id: string): Tag | undefined {
  const tag = tagsStore.find(t => t.id === id);
  return tag ? JSON.parse(JSON.stringify(tag)) : undefined;
}

export function getTagBySlug(slug: string): Tag | undefined {
  const tag = tagsStore.find(t => t.slug === slug);
  return tag ? JSON.parse(JSON.stringify(tag)) : undefined;
}

export function getTagsByIds(ids: string[]): Tag[] {
  if (!ids || ids.length === 0) return [];
  return JSON.parse(JSON.stringify(tagsStore.filter(tag => ids.includes(tag.id))));
}


export function addTag(tagData: Omit<Tag, 'id' | 'slug'> & { name: string }): Tag {
  const slug = createTagSlug(tagData.name);
  if (tagsStore.some(t => t.slug === slug)) {
    throw new Error(`Tag with slug '${slug}' already exists.`);
  }
  const newTag: Tag = {
    id: generateTagId(),
    name: tagData.name,
    slug: slug,
    description: tagData.description,
  };
  tagsStore.push(newTag);
  return JSON.parse(JSON.stringify(newTag));
}

export function findOrCreateTagsByNames(tagNames: string[]): Tag[] {
  const resultTags: Tag[] = [];
  for (const name of tagNames) {
    const slug = createTagSlug(name);
    let tag = tagsStore.find(t => t.slug === slug);
    if (!tag) {
      tag = {
        id: generateTagId(),
        name: name, // Use original name casing for display
        slug: slug,
        description: `Content related to ${name}`,
      };
      tagsStore.push(tag);
    }
    resultTags.push(JSON.parse(JSON.stringify(tag)));
  }
  return resultTags;
}


export function updateTag(id: string, updates: Partial<Omit<Tag, 'id' | 'slug'>>): Tag | undefined {
  const tagIndex = tagsStore.findIndex(t => t.id === id);
  if (tagIndex === -1) {
    return undefined;
  }
  const originalName = tagsStore[tagIndex].name;
  const updatedTag = { ...tagsStore[tagIndex], ...updates };

  if (updates.name && updates.name !== originalName) {
    const newSlug = createTagSlug(updates.name);
    if (tagsStore.some(t => t.slug === newSlug && t.id !== id)) {
      throw new Error(`Update failed: Tag slug '${newSlug}' would conflict with an existing tag.`);
    }
    updatedTag.slug = newSlug;
  }
  
  tagsStore[tagIndex] = updatedTag;
  return JSON.parse(JSON.stringify(updatedTag));
}

export function deleteTag(id: string): boolean {
  const initialLength = tagsStore.length;
  tagsStore = tagsStore.filter(t => t.id !== id);
  // In a real app, you'd also need to remove this tagId from all posts.
  // For this in-memory example, we'll skip that step for simplicity.
  return tagsStore.length < initialLength;
}
