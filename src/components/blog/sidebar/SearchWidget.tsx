
"use client";

import { useState, type FormEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, XCircle, Loader2 } from "lucide-react";

interface SearchWidgetProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isLoading?: boolean;
}

export function SearchWidget({ onSearch, initialQuery = "", isLoading = false }: SearchWidgetProps) {
  const [searchInput, setSearchInput] = useState(initialQuery);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    onSearch(""); // Trigger search with empty query to reset
  };

  return (
    <Card className="shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Search className="mr-2 h-5 w-5 text-primary" /> Live Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10 text-sm" // Add padding for clear button
              disabled={isLoading}
            />
            {searchInput && !isLoading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                aria-label="Clear search"
              >
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
             {isLoading && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button type="submit" size="icon" disabled={isLoading} aria-label="Submit search">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
