
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag as TagIconLucide } from "lucide-react";
import type { Tag } from '@/lib/tags-data';

export function TagsWidget() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTags() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data: Tag[] = await response.json();
        setTags(data);
      } catch (error) {
        console.error(error);
        setTags([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTags();
  }, []);

  return (
    <Card className="shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <TagIconLucide className="mr-2 h-5 w-5 text-primary" /> Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                <Badge 
                  variant="secondary" 
                  className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">No tags found.</p>
        )}
      </CardContent>
    </Card>
  );
}
