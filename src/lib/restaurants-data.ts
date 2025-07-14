
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const RESTAURANTS_COLLECTION = 'restaurants';
const MENU_ITEMS_COLLECTION = 'menuItems';
const MENU_CATEGORIES_COLLECTION = 'menuCategories';


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

export interface MenuItem {
    _id?: ObjectId;
    id?: string;
    restaurantId: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    dietaryFlags?: ('vegetarian' | 'gluten-free' | 'spicy')[];
}

export interface MenuCategory {
    _id?: ObjectId;
    id?: string;
    restaurantId: string;
    name: string;
    order: number; // To control display order
}

export interface FullMenu {
    categories: MenuCategory[];
    items: MenuItem[];
}

function docToRestaurant(doc: any): Restaurant {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Restaurant;
}

function docToMenuItem(doc: any): MenuItem {
    if (!doc) return doc;
    const { _id, ...rest } = doc;
    return { id: _id?.toString(), ...rest } as MenuItem;
}

function docToMenuCategory(doc: any): MenuCategory {
    if (!doc) return doc;
    const { _id, ...rest } = doc;
    return { id: _id?.toString(), ...rest } as MenuCategory;
}

// Seed some initial data if the collection is empty
async function seedInitialData() {
  const restaurantsCollection = await getCollection<Restaurant>(RESTAURANTS_COLLECTION);
  const menuItemsCollection = await getCollection<MenuItem>(MENU_ITEMS_COLLECTION);
  const menuCategoriesCollection = await getCollection<MenuCategory>(MENU_CATEGORIES_COLLECTION);
  
  const restCount = await restaurantsCollection.countDocuments();
  if (restCount === 0) {
    console.log("Seeding initial restaurants...");
    const initialRestaurants: Omit<Restaurant, 'id' | '_id'>[] = [
      { name: "KFC - Kentucky", logoUrl: "https://placehold.co/110x110.png?text=KFC", cuisineTypes: ["Cheese Burger", "Ice Cream", "Potato Fries"], location: "New York, New York State", rating: 4.5, reviewCount: 4, status: "Closed", isSponsored: true },
      { name: "Subway", logoUrl: "https://placehold.co/110x110.png?text=Subway", cuisineTypes: ["Cheese Burger", "Ice Cream", "Potato Fries"], location: "Berlin, City state of Berlin", rating: 4.2, reviewCount: 4, status: "Closed", isSponsored: true },
      { name: "Pizza Hut", logoUrl: "https://placehold.co/110x110.png?text=Pizza", cuisineTypes: ["Pizza", "Pasta", "Salads"], location: "London, UK", rating: 4.8, reviewCount: 15, status: "Open", isSponsored: false },
    ];
    const result = await restaurantsCollection.insertMany(initialRestaurants as any[]);
    
    // Use the ID of the first seeded restaurant for menu items
    const restaurantId = result.insertedIds[0].toString();

    const menuCatCount = await menuCategoriesCollection.countDocuments({ restaurantId });
    if (menuCatCount === 0) {
        console.log(`Seeding menu categories for restaurant ${restaurantId}...`);
        const initialCategories: Omit<MenuCategory, 'id' | '_id'>[] = [
            { restaurantId, name: "Starters", order: 1 },
            { restaurantId, name: "Kebabs", order: 2 },
            { restaurantId, name: "Burgers", order: 3 },
            { restaurantId, name: "Drinks", order: 4 },
        ];
        const catResult = await menuCategoriesCollection.insertMany(initialCategories as any[]);
        const categoryIdMap = {
            "Starters": catResult.insertedIds[0].toString(),
            "Kebabs": catResult.insertedIds[1].toString(),
            "Burgers": catResult.insertedIds[2].toString(),
            "Drinks": catResult.insertedIds[3].toString(),
        };

        const menuItemCount = await menuItemsCollection.countDocuments({ restaurantId });
        if (menuItemCount === 0) {
            console.log(`Seeding menu items for restaurant ${restaurantId}...`);
            const initialItems: Omit<MenuItem, 'id' | '_id'>[] = [
                { restaurantId, categoryId: categoryIdMap["Starters"], name: "Arpas kebab starters", description: "Freshly made with local ingredients.", price: 9.90, imageUrl: "https://placehold.co/100x100.png?text=Kebab", dietaryFlags: ['spicy'] },
                { restaurantId, categoryId: categoryIdMap["Kebabs"], name: "Adana Kebab", description: "Spicy minced meat kebab.", price: 15.50, imageUrl: "https://placehold.co/100x100.png?text=Adana", dietaryFlags: ['spicy'] },
                { restaurantId, categoryId: categoryIdMap["Burgers"], name: "Cheese Burger", description: "Classic beef burger with cheese.", price: 12.00, imageUrl: "https://placehold.co/100x100.png?text=Burger" },
                { restaurantId, categoryId: categoryIdMap["Burgers"], name: "Veggie Burger", description: "A delicious vegetarian alternative.", price: 11.00, imageUrl: "https://placehold.co/100x100.png?text=Veggie", dietaryFlags: ['vegetarian'] },
                { restaurantId, categoryId: categoryIdMap["Drinks"], name: "Coca-Cola", description: "Refreshing soft drink.", price: 2.50, imageUrl: "https://placehold.co/100x100.png?text=Coke" },
            ];
            await menuItemsCollection.insertMany(initialItems as any[]);
        }
    }
    console.log("Initial restaurants and menu data seeded.");
  }
}

seedInitialData().catch(console.error);

export async function getAllRestaurants(filters: any = {}): Promise<Restaurant[]> {
  const collection = await getCollection<Restaurant>(RESTAURANTS_COLLECTION);
  const restaurantDocs = await collection.find(filters).toArray();
  return restaurantDocs.map(docToRestaurant);
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    const collection = await getCollection<Restaurant>(RESTAURANTS_COLLECTION);
    const restaurantDoc = await collection.findOne({ _id: new ObjectId(id) });
    return restaurantDoc ? docToRestaurant(restaurantDoc) : null;
}

export async function getMenuForRestaurant(restaurantId: string): Promise<FullMenu> {
    if (!ObjectId.isValid(restaurantId)) {
        return { categories: [], items: [] };
    }
    const menuItemsCollection = await getCollection<MenuItem>(MENU_ITEMS_COLLECTION);
    const menuCategoriesCollection = await getCollection<MenuCategory>(MENU_CATEGORIES_COLLECTION);

    const [categoriesDocs, itemsDocs] = await Promise.all([
        menuCategoriesCollection.find({ restaurantId }).sort({ order: 1 }).toArray(),
        menuItemsCollection.find({ restaurantId }).toArray()
    ]);

    return {
        categories: categoriesDocs.map(docToMenuCategory),
        items: itemsDocs.map(docToMenuItem),
    };
}
