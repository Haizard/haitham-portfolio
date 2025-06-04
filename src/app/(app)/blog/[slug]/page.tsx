
import { CommentSection } from "@/components/blog/comment-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import type { BlogPost } from '@/lib/blog-data';
import { getPostSlugs, getPostBySlug } from '@/lib/blog-data'; // Import directly

// Function to fetch all post slugs for generateStaticParams
async function getAllPostSlugsForStaticParams(): Promise<{ slug: string }[]> {
  try {
    const posts = getPostSlugs(); // Use direct import
    return posts.map((post) => ({ slug: post.slug }));
  } catch (error) {
    console.error("Error in getAllPostSlugsForStaticParams:", error);
    return [];
  }
}

export async function generateStaticParams() {
  return getAllPostSlugsForStaticParams();
}

// Function to fetch a single post by slug
async function getPostData(slug: string): Promise<BlogPost | null> {
  try {
    const post = getPostBySlug(slug); // Use direct import
    return post || null; // Ensure null is returned if undefined
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const post = await getPostData(slug);

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

      <CommentSection postId={post.slug} initialComments={post.comments || []} />
    </div>
  );
}

// Revalidate this page on demand if posts change frequently
// export const revalidate = 60; // Revalidate every 60 seconds
