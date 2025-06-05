
import type { Tag } from './tags-data';

export interface BlogPost {
  slug: string;
  title: string;
  author: string;
  authorAvatar: string;
  date: string;
  tags: string[]; // Will now be deprecated in favor of tagIds for new posts
  tagIds?: string[]; // Stores IDs of tags from tags-data.ts
  imageUrl: string;
  imageHint: string;
  content: string;
  originalLanguage: string;
  categoryId: string;
  comments?: { id: string; author: string; avatar: string; date: string; text: string }[];
}

let posts: Record<string, BlogPost> = {
  "my-first-blog-post": {
    slug: "my-first-blog-post",
    title: "My First Amazing Blog Post",
    author: "Alex Creator",
    authorAvatar: "https://placehold.co/100x100.png",
    date: "2024-08-01",
    tags: ["Introduction", "Tech", "CreatorOS"], // Kept for backward compatibility if needed
    tagIds: ["tag_3", "tag_1"], // Example: Productivity, AI
    imageUrl: "https://placehold.co/800x400.png",
    imageHint: "blog abstract technology",
    originalLanguage: "en",
    categoryId: "cat_1",
    content: `
      <p>This is the beginning of something great. Welcome to my first blog post powered by CreatorOS! I'm excited to share my thoughts and ideas with the world.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <h2>A New Section</h2>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <p>Here's a list:</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      <p>Stay tuned for more updates!</p>
    `,
    comments: [
      { id: "1", author: "Commenter One", avatar: "https://placehold.co/50x50.png", date: "2024-08-01", text: "Great first post!" },
      { id: "2", author: "Another User", avatar: "https://placehold.co/50x50.png", date: "2024-08-02", text: "Looking forward to more content." },
    ]
  },
  "the-future-of-ai": {
    slug: "the-future-of-ai",
    title: "The Future of AI in Content Creation",
    author: "Dr. AI Enthusiast",
    authorAvatar: "https://placehold.co/100x100.png",
    date: "2024-07-25",
    tags: ["AI", "Technology", "Future"],
    tagIds: ["tag_1"], // Example: AI
    imageUrl: "https://placehold.co/800x400.png",
    imageHint: "artificial intelligence brain",
    originalLanguage: "en",
    categoryId: "sub_1_2",
    content: `
      <p>Artificial Intelligence is rapidly changing the landscape of content creation. From automated writing assistants to generative art, the possibilities are endless.</p>
      <p>In this post, we explore some of the key trends and predictions for AI in the creative industries. How will it empower creators? What are the ethical considerations?</p>
      <h2>Impact on Writing</h2>
      <p>AI tools can now generate drafts, suggest edits, and even mimic specific writing styles. This can significantly speed up the content creation process.</p>
      <h2>Visual Content</h2>
      <p>Image and video generation using AI is becoming increasingly sophisticated. This opens up new avenues for visual storytelling, even for those without traditional design skills.</p>
      <p>However, concerns about copyright and authenticity remain pertinent.</p>
    `,
    comments: [
      { id: "3", author: "TechGeek", avatar: "https://placehold.co/50x50.png", date: "2024-07-26", text: "Very insightful. AI is indeed a game changer." },
    ]
  },
  "deep-dive-into-react-hooks": {
    slug: "deep-dive-into-react-hooks",
    title: "A Deep Dive into React Hooks",
    author: "Frontend Master",
    authorAvatar: "https://placehold.co/100x100.png",
    date: "2024-06-10",
    tags: ["React", "JavaScript", "Web Development"],
    tagIds: ["tag_2", "tag_4"], // Example: React, Next.js
    imageUrl: "https://placehold.co/800x400.png",
    imageHint: "react code screen",
    originalLanguage: "en",
    categoryId: "sub_1_1_1", // Web Frameworks
    content: "<p>React Hooks have revolutionized how we build components. Let's explore useState, useEffect, and custom hooks in depth.</p>",
    comments: []
  }
};

export function getAllPosts(): BlogPost[] {
  return Object.values(posts);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts[slug];
}

export function addPost(post: BlogPost): BlogPost {
  // The 'tags' field (string array) from input is now processed to tagIds
  // This logic should ideally be in the API route before calling addPost
  // but for in-memory, we ensure post object matches the interface.
  if (!post.tagIds && post.tags && post.tags.length > 0) {
     // This is a placeholder; actual tag creation/retrieval would happen in API
     // For mock data, we assume tagIds are pre-populated by the calling logic (API)
     console.warn("addPost received tags string array, but tagIds is preferred. Ensure API layer handles tag to tagId conversion.");
  }
  posts[post.slug] = post;
  return post;
}

export function getPostSlugs(): { slug: string }[] {
  return Object.keys(posts).map(slug => ({ slug }));
}

export function getPostsByCategoryId(categoryId: string, limit?: number, excludeSlug?: string): BlogPost[] {
  let filteredPosts = Object.values(posts).filter(
    (post) => post.categoryId === categoryId && post.slug !== excludeSlug
  );
  filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return limit ? filteredPosts.slice(0, limit) : filteredPosts;
}

export function getPostsByTagId(tagId: string, limit?: number, excludeSlug?: string): BlogPost[] {
  let filteredPosts = Object.values(posts).filter(
    (post) => post.tagIds?.includes(tagId) && post.slug !== excludeSlug
  );
  filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return limit ? filteredPosts.slice(0, limit) : filteredPosts;
}
