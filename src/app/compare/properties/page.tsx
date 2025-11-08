'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function ComparePropertiesPage() {
  const searchParams = useSearchParams();
  const itemIds = searchParams.get('items')?.split(',') || [];
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const promises = itemIds.map((id) =>
        fetch(`/api/properties/${id}`).then((res) => res.json())
      );
      const results = await Promise.all(promises);
      const validProperties = results
        .filter((r) => r.success)
        .map((r) => r.property);
      setProperties(validProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (propertyId: string) => {
    try {
      await fetch(`/api/comparisons/property/items/${propertyId}`, {
        method: 'DELETE',
      });
      setProperties(properties.filter((p) => p.id !== propertyId));
      toast({
        title: 'Removed',
        description: 'Property removed from comparison',
      });
    } catch (error) {
      console.error('Error removing property:', error);
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

  if (properties.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No properties to compare
          </p>
          <Link href="/properties">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/properties">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">Compare Properties</h1>
        <p className="text-muted-foreground mt-2">
          Compare up to 3 properties side by side
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
              {properties.map((property) => (
                <th key={property.id} className="border p-4 bg-muted">
                  <div className="flex items-start justify-between">
                    <div className="text-left">
                      <p className="font-semibold">{property.name}</p>
                      <p className="text-sm text-muted-foreground font-normal">
                        {property.location?.city}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(property.id)}
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
              <td className="border p-4 font-semibold">Price (per night)</td>
              {properties.map((property) => (
                <td key={property.id} className="border p-4 text-center">
                  <p className="text-lg font-bold text-primary">
                    ${property.basePrice}
                  </p>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Property Type</td>
              {properties.map((property) => (
                <td key={property.id} className="border p-4 text-center">
                  <Badge>{property.propertyType}</Badge>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Rating</td>
              {properties.map((property) => (
                <td key={property.id} className="border p-4 text-center">
                  ⭐ {property.rating?.toFixed(1) || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Amenities</td>
              {properties.map((property) => (
                <td key={property.id} className="border p-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {property.amenities?.slice(0, 5).map((amenity: string) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Action</td>
              {properties.map((property) => (
                <td key={property.id} className="border p-4 text-center">
                  <Link href={`/properties/${property.id}`}>
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
        {properties.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{property.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {property.location?.city}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(property.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-primary">
                  ${property.basePrice}/night
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge>{property.propertyType}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p>⭐ {property.rating?.toFixed(1) || 'N/A'}</p>
              </div>
              <Link href={`/properties/${property.id}`}>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

