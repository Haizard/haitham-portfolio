
// In-memory store for blog posts

export interface BlogPost {
  slug: string;
  title: string;
  author: string;
  authorAvatar: string;
  date: string;
  tags: string[];
  imageUrl: string;
  imageHint: string;
  content: string;
  originalLanguage: string;
  category: string; // Added
  subcategory?: string; // Added: optional
  comments?: { id: string; author: string; avatar: string; date: string; text: string }[];
}

let posts: Record<string, BlogPost> = {
  "my-first-blog-post": {
    slug: "my-first-blog-post",
    title: "My First Amazing Blog Post",
    author: "Alex Creator",
    authorAvatar: "https://placehold.co/100x100.png",
    date: "2024-08-01",
    tags: ["Introduction", "Tech", "CreatorOS"],
    imageUrl: "https://placehold.co/800x400.png",
    imageHint: "blog abstract technology",
    originalLanguage: "en",
    category: "Tech",
    subcategory: "General",
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
    imageUrl: "https://placehold.co/800x400.png",
    imageHint: "artificial intelligence brain",
    originalLanguage: "en",
    category: "AI",
    subcategory: "Trends",
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
  }
};

export function getAllPosts(): BlogPost[] {
  return Object.values(posts);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts[slug];
}

export function addPost(post: BlogPost): BlogPost {
  posts[post.slug] = post;
  return post;
}

export function getPostSlugs(): { slug: string }[] {
  return Object.keys(posts).map(slug => ({ slug }));
}

// New function to get posts by category (and optionally subcategory)
export function getPostsByCategory(category: string, subcategory?: string, limit?: number, excludeSlug?: string): BlogPost[] {
  let filteredPosts = Object.values(posts).filter(
    (post) => post.category.toLowerCase() === category.toLowerCase() && post.slug !== excludeSlug
  );

  if (subcategory) {
    filteredPosts = filteredPosts.filter(
      (post) => post.subcategory?.toLowerCase() === subcategory.toLowerCase()
    );
  }
  
  filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return limit ? filteredPosts.slice(0, limit) : filteredPosts;
}
