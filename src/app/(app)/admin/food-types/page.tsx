
import { FoodTypeManagement } from '@/components/admin/food-types/food-type-management';
import { Leaf } from 'lucide-react';

export default function AdminFoodTypesPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Leaf className="mr-3 h-10 w-10 text-primary" />
          Manage Food Types
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Create and manage dietary or food type labels (e.g., Vegetarian, Gluten-Free).
        </p>
      </header>
      <FoodTypeManagement />
    </div>
  );
}
