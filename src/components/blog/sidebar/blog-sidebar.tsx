
"use client";

import { AuthorCard } from './AuthorCard';
import { SearchWidget } from './SearchWidget';
import { RecentPostsWidget } from './RecentPostsWidget';
import { CategoriesWidget } from './CategoriesWidget';
import { InstagramWidget } from './InstagramWidget';
import { TagsWidget } from './TagsWidget';

interface BlogSidebarProps {
  onSearch: (query: string) => void;
  searchInitialQuery?: string;
  searchIsLoading?: boolean;
  recentPostsLimit?: number;
  recentPostsExcludeSlug?: string;
}

export function BlogSidebar({ 
    onSearch, 
    searchInitialQuery, 
    searchIsLoading,
    recentPostsLimit,
    recentPostsExcludeSlug 
}: BlogSidebarProps) {
  return (
    <div className="space-y-8">
      <AuthorCard />
      <SearchWidget 
        onSearch={onSearch} 
        initialQuery={searchInitialQuery} 
        isLoading={searchIsLoading} 
      />
      <RecentPostsWidget 
        limit={recentPostsLimit} 
        excludeSlug={recentPostsExcludeSlug}
      />
      <CategoriesWidget />
      <InstagramWidget />
      <TagsWidget />
    </div>
  );
}
