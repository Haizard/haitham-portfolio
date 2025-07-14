
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

export interface MenuItemOption {
    id: string;
    name: string;
    price: number;
}

export interface MenuItemOptionGroup {
    id: string;
    title: string;
    selectionType: 'single' | 'multi';
    isRequired: boolean;
    requiredCount?: number;
    options: MenuItemOption[];
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
    dietaryFlags?: ('vegetarian' | 'spicy' | 'gluten-free')[];
    optionGroups?: MenuItemOptionGroup[];
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
    const optionGroups = (rest.optionGroups || []).map((group: any) => ({
        ...group,
        id: group.id || new ObjectId().toString(),
        options: (group.options || []).map((opt: any) => ({
            ...opt,
            id: opt.id || new ObjectId().toString(),
        })),
    }));
    return { id: _id?.toString(), ...rest, optionGroups } as MenuItem;
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
            { restaurantId, name: "Pizza", order: 4 },
            { restaurantId, name: "Drinks", order: 5 },
        ];
        const catResult = await menuCategoriesCollection.insertMany(initialCategories as any[]);
        const categoryIdMap = {
            "Starters": catResult.insertedIds[0].toString(),
            "Kebabs": catResult.insertedIds[1].toString(),
            "Burgers": catResult.insertedIds[2].toString(),
            "Pizza": catResult.insertedIds[3].toString(),
            "Drinks": catResult.insertedIds[4].toString(),
        };

        const menuItemCount = await menuItemsCollection.countDocuments({ restaurantId });
        if (menuItemCount === 0) {
            console.log(`Seeding menu items for restaurant ${restaurantId}...`);
            const initialItems: Omit<MenuItem, 'id' | '_id'>[] = [
                {
                    restaurantId,
                    categoryId: categoryIdMap["Starters"],
                    name: "Arpas kebab starters",
                    description: "Freshly made with local ingredients.",
                    price: 9.90,
                    imageUrl: "https://placehold.co/100x100.png?text=Kebab",
                    dietaryFlags: ['spicy']
                },
                {
                    restaurantId,
                    categoryId: categoryIdMap["Kebabs"],
                    name: "Adana Kebab",
                    description: "Spicy minced meat kebab.",
                    price: 15.50,
                    imageUrl: "https://placehold.co/100x100.png?text=Adana",
                    dietaryFlags: ['spicy'],
                    optionGroups: [
                        { id: "g3", title: "Side Dish", selectionType: 'single', isRequired: true, options: [
                            { id: "sd1", name: "Rice", price: 0.00 },
                            { id: "sd2", name: "Fries", price: 1.00 },
                        ]}
                    ]
                },
                {
                    restaurantId,
                    categoryId: categoryIdMap["Burgers"],
                    name: "Cheese Burger",
                    description: "Classic beef burger with cheese.",
                    price: 12.00,
                    imageUrl: "https://placehold.co/100x100.png?text=Burger",
                    optionGroups: [
                         { id: "g4", title: "Add Ons", selectionType: 'multi', isRequired: false, options: [
                            { id: "ao1", name: "Extra Bacon", price: 1.50 },
                            { id: "ao2", name: "Extra Cheese", price: 1.00 },
                         ]}
                    ]
                },
                {
                    restaurantId,
                    categoryId: categoryIdMap["Burgers"],
                    name: "Veggie Burger",
                    description: "A delicious vegetarian alternative.",
                    price: 11.00,
                    imageUrl: "https://placehold.co/100x100.png?text=Veggie",
                    dietaryFlags: ['vegetarian']
                },
                {
                    restaurantId,
                    categoryId: categoryIdMap["Pizza"],
                    name: "Marinara Pizza",
                    description: "Cheese, tomatoes, tuna fish, sweetcorn and italian herbs.",
                    price: 70.00,
                    imageUrl: "https://placehold.co/100x100.png?text=Pizza",
                    optionGroups: [
                        { id: "g1", title: "Extra Topping", selectionType: 'multi', isRequired: true, requiredCount: 2, options: [
                            { id: "t1", name: "Pepperoni", price: 9.00 },
                            { id: "t2", name: "Tuna", price: 6.00 },
                            { id: "t3", name: "Sweet corn", price: 0.00 },
                            { id: "t4", name: "Asparagus", price: 1.00 },
                            { id: "t5", name: "Jalapenos", price: 2.00 },
                        ]},
                        { id: "g2", title: "Sauces", selectionType: 'single', isRequired: true, options: [
                            { id: "s1", name: "Lime Sauce", price: 2.00 },
                            { id: "s2", name: "Hot Chili", price: 2.50 },
                        ]}
                    ]
                },
                {
                    restaurantId,
                    categoryId: categoryIdMap["Drinks"],
                    name: "Coca-Cola",
                    description: "Refreshing soft drink.",
                    price: 2.50,
                    imageUrl: "https://placehold.co/100x100.png?text=Coke"
                },
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
