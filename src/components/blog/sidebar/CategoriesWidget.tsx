
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FolderOpen, ChevronRight } from "lucide-react";
import type { CategoryNode } from '@/lib/categories-data';

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

  const renderCategoryList = (categoryNodes: CategoryNode[], level = 0) => {
    return categoryNodes.map(category => (
      <li key={category.id} style={{ paddingLeft: `${level * 1}rem` }}>
        <Link 
          href={`/blog/category/${category.slug}`} 
          className="flex justify-between items-center py-2 text-sm text-muted-foreground hover:text-primary hover:font-medium transition-all"
        >
          <span className="flex items-center">
            {level > 0 && <ChevronRight className="h-3 w-3 mr-1 opacity-50" />}
            {category.name}
          </span>
          <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">({category.postCount || 0})</span>
        </Link>
        {category.children && category.children.length > 0 && (
          <ul className="pl-2">
            {renderCategoryList(category.children, level + 1)}
          </ul>
        )}
      </li>
    ));
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
