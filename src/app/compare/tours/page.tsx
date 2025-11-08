'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function CompareToursPage() {
  const searchParams = useSearchParams();
  const itemIds = searchParams.get('items')?.split(',') || [];
  const [tours, setTours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      const promises = itemIds.map((id) =>
        fetch(`/api/tours/${id}`).then((res) => res.json())
      );
      const results = await Promise.all(promises);
      const validTours = results.filter((r) => r.success).map((r) => r.tour);
      setTours(validTours);
    } catch (error) {
      console.error('Error loading tours:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tours',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (tourId: string) => {
    try {
      await fetch(`/api/comparisons/tour/items/${tourId}`, {
        method: 'DELETE',
      });
      setTours(tours.filter((t) => t.id !== tourId));
      toast({
        title: 'Removed',
        description: 'Tour removed from comparison',
      });
    } catch (error) {
      console.error('Error removing tour:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No tours to compare</p>
          <Link href="/tours">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Tours
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tours">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tours
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">Compare Tours</h1>
        <p className="text-muted-foreground mt-2">
          Compare up to 3 tours side by side
        </p>
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-4 bg-muted text-left font-semibold">
                Feature
              </th>
              {tours.map((tour) => (
                <th key={tour.id} className="border p-4 bg-muted">
                  <div className="flex items-start justify-between">
                    <div className="text-left">
                      <p className="font-semibold">{tour.title}</p>
                      <p className="text-sm text-muted-foreground font-normal">
                        {tour.location?.city}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(tour.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-4 font-semibold">Price (per person)</td>
              {tours.map((tour) => (
                <td key={tour.id} className="border p-4 text-center">
                  <p className="text-lg font-bold text-primary">
                    ${tour.basePrice}
                  </p>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Duration</td>
              {tours.map((tour) => (
                <td key={tour.id} className="border p-4 text-center">
                  {tour.duration}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Category</td>
              {tours.map((tour) => (
                <td key={tour.id} className="border p-4 text-center">
                  <Badge>{tour.category}</Badge>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Difficulty</td>
              {tours.map((tour) => (
                <td key={tour.id} className="border p-4 text-center">
                  {tour.difficulty}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Group Size</td>
              {tours.map((tour) => (
                <td key={tour.id} className="border p-4 text-center">
                  {tour.maxGroupSize} people
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Rating</td>
              {tours.map((tour) => (
                <td key={tour.id} className="border p-4 text-center">
                  ⭐ {tour.rating?.toFixed(1) || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Action</td>
              {tours.map((tour) => (
                <td key={tour.id} className="border p-4 text-center">
                  <Link href={`/tours/${tour.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {tours.map((tour) => (
          <Card key={tour.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{tour.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {tour.location?.city}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(tour.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-primary">
                  ${tour.basePrice}/person
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p>{tour.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <p>{tour.difficulty}</p>
                </div>
              </div>
              <Link href={`/tours/${tour.id}`}>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

