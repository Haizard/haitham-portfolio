
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FolderOpen, ChevronRight } from "lucide-react";
import type { CategoryNode } from '@/lib/categories-data';
import { cn } from '@/lib/utils';

export function CategoriesWidget() {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data: CategoryNode[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.error(error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const renderCategoryList = (categoryNodes: CategoryNode[], currentPathSegments: string[] = []) => {
    if (!Array.isArray(categoryNodes)) return null;
    return categoryNodes.map(category => {
      if (!category.slug || category.slug.trim() === '') return null;

      const newPathSegments = [...currentPathSegments, category.slug];
      const linkPath = `/blog/category/${newPathSegments.join('/')}`;
      const level = currentPathSegments.length;

      return (
        <li key={category.id}>
          <Link
            href={linkPath}
            className={cn(
              "flex justify-between items-center py-2 text-sm transition-all group",
              level === 0 ? "text-foreground font-semibold" : "text-muted-foreground hover:text-primary"
            )}
            style={{ paddingLeft: `${level * 0.75}rem` }}
          >
            <span className="flex items-center">
              {level > 0 && <ChevronRight className="h-3 w-3 mr-1 opacity-50 group-hover:opacity-100 transition-opacity" />}
              {category.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-secondary/80 group-hover:bg-primary/10 group-hover:text-primary px-1.5 py-0.5 rounded-full transition-colors">
                {category.postCount || 0}
              </span>
            </div>
          </Link>
          {category.children && Array.isArray(category.children) && category.children.length > 0 && (
            <ul className="space-y-0">
              {renderCategoryList(category.children, newPathSegments)}
            </ul>
          )}
        </li>
      );
    }).filter(Boolean);
  };


  return (
    <Card className="shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <FolderOpen className="mr-2 h-5 w-5 text-primary" /> Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : categories.length > 0 ? (
          <ul className="space-y-0 divide-y divide-border">
            {renderCategoryList(categories)}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center">No categories found.</p>
        )}
      </CardContent>
    </Card>
  );
}
