
"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { CategoryNode } from '@/lib/categories-data';

interface BreadcrumbDisplayProps {
  path: CategoryNode[];
  className?: string;
}

export function BreadcrumbDisplay({ path, className }: BreadcrumbDisplayProps) {
  if (!path || path.length === 0) {
    return null;
  }

  const buildCategoryLink = (currentPath: CategoryNode[]) => {
    return `/blog/category/${currentPath.map(p => p.slug).join('/')}`;
  };

  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        <li>
          <Link href="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
        </li>
        {path.map((segment, index) => {
          const isLast = index === path.length - 1;
          const linkPath = buildCategoryLink(path.slice(0, index + 1));
          return (
            <li key={segment.id} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              {isLast ? (
                <span className="font-medium text-foreground">{segment.name}</span>
              ) : (
                <Link href={linkPath} className="hover:text-primary transition-colors">
                  {segment.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
