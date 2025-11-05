
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { ServiceCategoryNode } from './service-categories-data';
import type { FoodType } from './food-types-data';

const RESTAURANTS_COLLECTION = 'restaurants';
const MENU_ITEMS_COLLECTION = 'menuItems';
const MENU_CATEGORIES_COLLECTION = 'menuCategories';
const RESTAURANT_REVIEWS_COLLECTION = 'restaurantReviews';

export interface RestaurantReview {
  _id?: ObjectId;
  id?: string;
  restaurantId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}


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
  specialDeals?: string;
  // This would be the ID of the user who owns this restaurant
  ownerId: string;
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

// New interface for the filter data
export interface RestaurantFilterData {
    cuisineFilters: { id: string; name: string; count: number }[];
    foodTypeFilters: { id: string; name: string; count: number }[];
    minOrderFilters: { id: string; label: string; count: number }[];
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

function docToRestaurantReview(doc: any): RestaurantReview {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as RestaurantReview;
}


// Seed some initial data if the collection is empty
async function seedInitialData() {
  const restaurantsCollection = await getCollection<Restaurant>(RESTAURANTS_COLLECTION);
  const menuItemsCollection = await getCollection<MenuItem>(MENU_ITEMS_COLLECTION);
  const menuCategoriesCollection = await getCollection<MenuCategory>(MENU_CATEGORIES_COLLECTION);
  
  const restCount = await restaurantsCollection.countDocuments();
  if (restCount === 0) {
    console.log("Seeding initial restaurants...");
    // Mock ownerId. In a real app, this would come from a real user.
    const mockOwnerId = 'user1'; 
    const initialRestaurants: Omit<Restaurant, 'id' | '_id'>[] = [
      { name: "KFC - Kentucky", ownerId: mockOwnerId, logoUrl: "https://placehold.co/110x110.png", cuisineTypes: ["Cheese Burger", "Ice Cream", "Potato Fries"], location: "New York, New York State", rating: 4.5, reviewCount: 4, status: "Closed", isSponsored: true, specialDeals: "Family Bucket: 12 pieces of chicken, 4 fries, and a large drink for $29.99!" },
      { name: "Subway", ownerId: "user2", logoUrl: "https://placehold.co/110x110.png", cuisineTypes: ["Cheese Burger", "Ice Cream", "Potato Fries"], location: "Berlin, City state of Berlin", rating: 4.2, reviewCount: 4, status: "Open", isSponsored: true, specialDeals: "Footlong of the day for $5.99." },
      { name: "Pizza Hut", ownerId: "user3", logoUrl: "https://placehold.co/110x110.png", cuisineTypes: ["Pizza", "Pasta", "Salads"], location: "London, UK", rating: 4.8, reviewCount: 15, status: "Open", isSponsored: false, specialDeals: "Two large pizzas for the price of one on Tuesdays." },
    ];
    await restaurantsCollection.insertMany(initialRestaurants as any[]);
    console.log("Initial restaurants seeded.");
  }
}

seedInitialData().catch(console.error);

export async function createRestaurantForUser(ownerId: string, initialData: { name: string; email: string; }): Promise<Restaurant> {
  const collection = await getCollection<Restaurant>(RESTAURANTS_COLLECTION);
  const docToInsert = {
    name: `${initialData.name}'s Restaurant`,
    ownerId: ownerId,
    logoUrl: `https://placehold.co/110x110.png`,
    cuisineTypes: ["New Cuisine"],
    location: "Your City, Your State",
    rating: 0,
    reviewCount: 0,
    status: 'Closed' as const,
    isSponsored: false,
    specialDeals: "",
  };
  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), ...docToInsert };
}


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

export async function getRestaurantByOwnerId(ownerId: string): Promise<Restaurant | null> {
    const collection = await getCollection<Restaurant>(RESTAURANTS_COLLECTION);
    const restaurantDoc = await collection.findOne({ ownerId });
    return restaurantDoc ? docToRestaurant(restaurantDoc) : null;
}


export async function updateRestaurantProfile(id: string, updates: Partial<Omit<Restaurant, 'id' | '_id' | 'ownerId'>>): Promise<Restaurant | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await getCollection<Restaurant>(RESTAURANTS_COLLECTION);
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );

  if (!result) {
    return null;
  }
  return docToRestaurant(result);
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


// --- Menu Category Management ---

export async function addMenuCategory(categoryData: Omit<MenuCategory, 'id' | '_id' | 'order'>): Promise<MenuCategory> {
  const collection = await getCollection<MenuCategory>(MENU_CATEGORIES_COLLECTION);
  const count = await collection.countDocuments({ restaurantId: categoryData.restaurantId });
  const docToInsert = { ...categoryData, order: count + 1 };
  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), ...docToInsert };
}

export async function updateMenuCategory(id: string, updates: Partial<Omit<MenuCategory, 'id' | '_id' | 'restaurantId'>>): Promise<MenuCategory | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<MenuCategory>(MENU_CATEGORIES_COLLECTION);
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ? docToMenuCategory(result) : null;
}

export async function deleteMenuCategory(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<MenuCategory>(MENU_CATEGORIES_COLLECTION);
  const itemsCollection = await getCollection<MenuItem>(MENU_ITEMS_COLLECTION);
  // Also delete all items within this category
  await itemsCollection.deleteMany({ categoryId: id });
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}


// --- Menu Item Management ---

export async function addMenuItem(itemData: Omit<MenuItem, 'id' | '_id'>): Promise<MenuItem> {
  const collection = await getCollection<MenuItem>(MENU_ITEMS_COLLECTION);
  const docToInsert = { ...itemData };
  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), ...docToInsert };
}

export async function updateMenuItem(id: string, updates: Partial<Omit<MenuItem, 'id' | '_id' | 'restaurantId'>>): Promise<MenuItem | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<MenuItem>(MENU_ITEMS_COLLECTION);
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ? docToMenuItem(result) : null;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<MenuItem>(MENU_ITEMS_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

// --- Restaurant Review Management ---

export async function getReviewsForRestaurant(restaurantId: string): Promise<RestaurantReview[]> {
  if (!ObjectId.isValid(restaurantId)) {
    return [];
  }
  const collection = await getCollection<RestaurantReview>(RESTAURANT_REVIEWS_COLLECTION);
  const reviewDocs = await collection.find({ restaurantId }).sort({ createdAt: -1 }).toArray();
  return reviewDocs.map(docToRestaurantReview);
}

export async function updateRestaurantRating(restaurantId: string, newAverageRating: number, newReviewCount: number): Promise<boolean> {
  if (!ObjectId.isValid(restaurantId)) {
    return false;
  }
  const restaurantsCollection = await getCollection<Restaurant>(RESTAURANTS_COLLECTION);
  const result = await restaurantsCollection.updateOne(
    { _id: new ObjectId(restaurantId) },
    { $set: { rating: newAverageRating, reviewCount: newReviewCount } }
  );
  return result.modifiedCount === 1;
}

export async function addRestaurantReview(reviewData: Omit<RestaurantReview, 'id' | '_id' | 'createdAt'>): Promise<RestaurantReview> {
  const reviewsCollection = await getCollection<Omit<RestaurantReview, 'id' | '_id'>>(RESTAURANT_REVIEWS_COLLECTION);
  
  // TODO: Verify if user has ordered from this restaurant.

  const now = new Date();
  const docToInsert = { ...reviewData, createdAt: now };

  const result = await reviewsCollection.insertOne(docToInsert as any);
  const newReview = { _id: result.insertedId, id: result.insertedId.toString(), ...docToInsert };

  // After adding the review, recalculate and update the restaurant's average rating
  const allReviewsForRestaurant = await getReviewsForRestaurant(reviewData.restaurantId);
  const totalReviews = allReviewsForRestaurant.length;
  const averageRating = totalReviews > 0
    ? allReviewsForRestaurant.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  
  await updateRestaurantRating(
    reviewData.restaurantId,
    parseFloat(averageRating.toFixed(2)),
    totalReviews
  );

  return newReview;
}


// --- Table Booking Management ---
export type TableBookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface TableBooking {
  _id?: ObjectId;
  id?: string;
  restaurantId: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string; // ISO Date string
  bookingTime: string;
  guestCount: number;
  status: TableBookingStatus;
  createdAt: Date;
}

function docToTableBooking(doc: any): TableBooking {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as TableBooking;
}


export async function addTableBooking(bookingData: Omit<TableBooking, 'id' | '_id' | 'status' | 'createdAt'>): Promise<TableBooking> {
    const collection = await getCollection<TableBooking>(`tableBookings`);
    const docToInsert = {
        ...bookingData,
        status: 'pending' as TableBookingStatus,
        createdAt: new Date(),
    };
    const result = await collection.insertOne(docToInsert as any);
    return { id: result.insertedId.toString(), ...docToInsert };
}


export async function getBookingsForRestaurant(restaurantId: string): Promise<TableBooking[]> {
    if (!ObjectId.isValid(restaurantId)) return [];
    const collection = await getCollection<TableBooking>(`tableBookings`);
    const bookingDocs = await collection.find({ restaurantId }).sort({ bookingDate: 1, bookingTime: 1 }).toArray();
    return bookingDocs.map(docToTableBooking);
}

export async function updateTableBookingStatus(bookingId: string, status: TableBookingStatus): Promise<TableBooking | null> {
    if (!ObjectId.isValid(bookingId)) return null;
    const collection = await getCollection<TableBooking>(`tableBookings`);
    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(bookingId) },
        { $set: { status } },
        { returnDocument: 'after' }
    );
    return result ? docToTableBooking(result) : null;
}


// NEW FUNCTION TO GET DYNAMIC FILTER DATA
export async function getRestaurantFilterData(): Promise<RestaurantFilterData> {
    const serviceCategoriesCollection = await getCollection<ServiceCategoryNode>('serviceCategories');
    const foodTypesCollection = await getCollection<FoodType>('foodTypes');
    const restaurantsCollection = await getCollection<Restaurant>('restaurants');

    // Fetch all cuisines and food types
    const [allCuisines, allFoodTypes] = await Promise.all([
        serviceCategoriesCollection.find({ parentId: null }).toArray(), // Assuming top-level categories are cuisines
        foodTypesCollection.find({}).toArray()
    ]);

    // This is a placeholder for dynamic counts. A real implementation would be more complex.
    // For now, we'll assign random counts for demonstration.
    const cuisineFilters = allCuisines.map(c => ({
        id: c._id!.toString(),
        name: c.name,
        count: Math.floor(Math.random() * 20) + 1 // Random count
    }));

    const foodTypeFilters = allFoodTypes.map(ft => ({
        id: ft._id!.toString(),
        name: ft.name,
        count: Math.floor(Math.random() * 15) + 1 // Random count
    }));
    
    // For Min Order, a real implementation would do an aggregation query.
    // We will simulate it for now.
    const minOrderFilters = [
        { id: "5", label: "$5", count: await restaurantsCollection.countDocuments({ /* query for min order <= 5 */ }) || 3 },
        { id: "10", label: "$10", count: await restaurantsCollection.countDocuments({ /* query for min order <= 10 */ }) || 8 },
        { id: "15", label: "$15", count: await restaurantsCollection.countDocuments({ /* query for min order <= 15 */ }) || 4 },
        { id: "20", label: "$20", count: await restaurantsCollection.countDocuments({ /* query for min order <= 20 */ }) || 2 },
    ];


    return {
        cuisineFilters,
        foodTypeFilters,
        minOrderFilters,
    };
}

    