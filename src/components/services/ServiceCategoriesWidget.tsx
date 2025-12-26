"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ListTree, ChevronRight, Check } from "lucide-react";
import type { ServiceCategoryNode } from '@/lib/service-categories-data';
import { cn } from '@/lib/utils';

interface ServiceCategoriesWidgetProps {
    selectedCategoryId?: string;
    onCategorySelect: (categoryId: string | undefined) => void;
}

export function ServiceCategoriesWidget({ selectedCategoryId, onCategorySelect }: ServiceCategoriesWidgetProps) {
    const [categories, setCategories] = useState<ServiceCategoryNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/service-categories');
                if (!response.ok) {
                    throw new Error('Failed to fetch service categories');
                }
                const data: ServiceCategoryNode[] = await response.json();
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

    const renderCategoryList = (categoryNodes: ServiceCategoryNode[], level = 0) => {
        return categoryNodes.map(category => {
            const isSelected = selectedCategoryId === category.id;

            return (
                <li key={category.id}>
                    <button
                        onClick={() => onCategorySelect(isSelected ? undefined : category.id)}
                        className={cn(
                            "flex justify-between items-center w-full py-2 text-sm transition-all text-left",
                            isSelected ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
                        )}
                        style={{ paddingLeft: `${level * 0.75}rem` }}
                    >
                        <span className="flex items-center">
                            {level > 0 && <ChevronRight className="h-3 w-3 mr-1 opacity-50" />}
                            {category.name}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">({category.serviceCount || 0})</span>
                            {isSelected && <Check className="h-3 w-3 text-primary" />}
                        </div>
                    </button>
                    {category.children && category.children.length > 0 && (
                        <ul className="space-y-0">
                            {renderCategoryList(category.children, level + 1)}
                        </ul>
                    )}
                </li>
            );
        });
    };

    return (
        <Card className="shadow-lg border-primary/10">
            <CardHeader className="pb-3 px-4">
                <CardTitle className="text-lg font-bold flex items-center text-primary">
                    <ListTree className="mr-2 h-5 w-5" /> Categories
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                {isLoading ? (
                    <div className="flex justify-center items-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : categories.length > 0 ? (
                    <div className="space-y-4">
                        <button
                            onClick={() => onCategorySelect(undefined)}
                            className={cn(
                                "text-sm w-full text-left py-1 font-medium transition-colors",
                                !selectedCategoryId ? "text-primary underline" : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            All Services
                        </button>
                        <ul className="space-y-0 divide-y divide-border/50">
                            {renderCategoryList(categories)}
                        </ul>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No categories found.</p>
                )}
            </CardContent>
        </Card>
    );
}
