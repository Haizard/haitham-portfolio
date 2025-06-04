
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

// In-memory store for blog posts, initialized with MOCK_BLOG_POSTS
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

export async function GET(request: NextRequest) {
  try {
    const allPosts = Object.values(posts);
    return NextResponse.json(allPosts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ message: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, slug } = body;

    if (!title || !content || !slug) {
      return NextResponse.json({ message: "Missing required fields: title, content, slug" }, { status: 400 });
    }

    if (posts[slug]) {
      return NextResponse.json({ message: "Post with this slug already exists" }, { status: 409 });
    }

    const newPost: BlogPost = {
      slug,
      title,
      content,
      author: "AI Assistant", // Default author for AI generated posts
      authorAvatar: "https://placehold.co/100x100.png?text=AI",
      date: new Date().toISOString(),
      tags: ["AI Generated"], // Default tag
      imageUrl: "https://placehold.co/800x400.png", // Default image
      imageHint: "abstract content",
      comments: [],
    };

    posts[slug] = newPost;
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json({ message: "Failed to create post" }, { status: 500 });
  }
}
