
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const RESTAURANTS_COLLECTION = 'restaurants';

export interface Restaurant {
  _id?: ObjectId;
  id?: string;
  name: string;
  logoUrl: string;
  cuisineTypes: string[];
  location: string;
  rating: number;
  reviewCount: number;
  status: 'Open' | 'Closed';
  isSponsored: boolean;
}

function docToRestaurant(doc: any): Restaurant {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Restaurant;
}

// Seed some initial data if the collection is empty
async function seedInitialRestaurants() {
  const collection = await getCollection<Restaurant>(RESTAURANTS_COLLECTION);
  const count = await collection.countDocuments();
  if (count === 0) {
    console.log("Seeding initial restaurants...");
    const initialRestaurants: Omit<Restaurant, 'id' | '_id'>[] = [
      {
        name: "KFC - Kentucky",
        logoUrl: "https://placehold.co/110x110.png?text=KFC",
        cuisineTypes: ["Cheese Burger", "Ice Cream", "Potato Fries"],
        location: "New York, New York State",
        rating: 4.5,
        reviewCount: 4,
        status: "Closed",
        isSponsored: true,
      },
      {
        name: "Subway",
        logoUrl: "https://placehold.co/110x110.png?text=Subway",
        cuisineTypes: ["Cheese Burger", "Ice Cream", "Potato Fries"],
        location: "Berlin, City state of Berlin",
        rating: 4.2,
        reviewCount: 4,
        status: "Closed",
        isSponsored: true,
      },
       {
        name: "Pizza Hut",
        logoUrl: "https://placehold.co/110x110.png?text=Pizza",
        cuisineTypes: ["Pizza", "Pasta", "Salads"],
        location: "London, UK",
        rating: 4.8,
        reviewCount: 15,
        status: "Open",
        isSponsored: false,
      },
    ];
    await collection.insertMany(initialRestaurants as any[]);
    console.log("Initial restaurants seeded.");
  }
}

seedInitialRestaurants().catch(console.error);

export async function getAllRestaurants(filters: any = {}): Promise<Restaurant[]> {
  const collection = await getCollection<Restaurant>(RESTAURANTS_COLLECTION);
  const restaurantDocs = await collection.find(filters).toArray();
  return restaurantDocs.map(docToRestaurant);
}
