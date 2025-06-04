
import { CommentSection } from "@/components/blog/comment-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays, UserCircle } from "lucide-react";

// Mock data - in a real app, fetch this based on slug
const MOCK_BLOG_POSTS = {
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

export async function generateStaticParams() {
  return Object.keys(MOCK_BLOG_POSTS).map((slug) => ({
    slug,
  }));
}

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const post = MOCK_BLOG_POSTS[slug as keyof typeof MOCK_BLOG_POSTS];

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline mb-4">{post.title}</h1>
          <div className="flex items-center space-x-4 text-muted-foreground mb-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.authorAvatar} alt={post.author} data-ai-hint="author avatar" />
                <AvatarFallback>{post.author.substring(0,1)}</AvatarFallback>
              </Avatar>
              <span>{post.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CalendarDays className="h-4 w-4" />
              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </header>

        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={800}
            height={400}
            className="rounded-lg mb-8 shadow-lg w-full object-cover aspect-[2/1]"
            data-ai-hint={post.imageHint}
          />
        )}

        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <Separator className="my-12" />

      <CommentSection postId={post.slug} initialComments={post.comments} />
    </div>
  );
}
