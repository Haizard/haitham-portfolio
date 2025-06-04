
import { NextResponse, type NextRequest } from 'next/server';

interface BlogPost {
  slug: string;
  title: string;
  author: string;
  authorAvatar: string;
  date: string;
  tags: string[];
  imageUrl: string;
  imageHint: string;
  content: string;
  comments?: { id: string; author: string; avatar: string; date: string; text: string }[];
}

// This should ideally share the same in-memory store as /api/blog/route.ts
// For simplicity in this example, we'll re-declare it. In a real app, use a shared module or database.
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
// Note: This is a simplified way to share state between route handlers.
// In a production app, you'd use a proper database or a more robust in-memory store solution.
// To make POSTs to /api/blog reflect here, you'd need to ensure this `posts` object is the same instance.
// For Next.js route handlers, module-level variables are generally preserved across requests for the same server instance.

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const post = Object.values(posts).find(p => p.slug === slug); // Access the shared posts

    if (post) {
      return NextResponse.json(post);
    } else {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to fetch post ${params.slug}:`, error);
    return NextResponse.json({ message: `Failed to fetch post ${params.slug}` }, { status: 500 });
  }
}
