
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { TourActivity } from './tour-activities-data';
import { getTourActivityById } from './tour-activities-data';
import { getGuideById } from './tour-guides-data';

export interface GalleryImage {
  url: string;
  caption?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Highlight {
  icon?: string; // e.g., "Clock", "Users" from lucide-react
  text: string;
}


export interface TourGuide {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  joinedYear?: number;
}

export interface TourPackage {
  _id?: ObjectId;
  id?: string;
  name: string;
  slug: string;
  duration: string;
  description: string;
  location: string;
  tourType: string;
  tags: string[];
  activityIds?: string[]; // Added to link to activities
  itinerary: string[];
  inclusions: string[];
  exclusions: string[];
  price: number;
  featuredImageUrl: string;
  galleryImages: GalleryImage[];
  highlights?: Highlight[];
  faqs?: FAQ[];
  mapEmbedUrl?: string;
  isActive: boolean;
  // New fields for guide and ratings
  guideId?: string; // Reference to tour guide/operator
  guide?: TourGuide; // Populated guide data (not stored in DB, populated on fetch)
  activities?: TourActivity[]; // Populated activity data (not stored in DB)
  rating?: number; // Average rating (0-5)
  reviewCount?: number; // Total number of reviews
  createdAt: string;
  updatedAt: string;
}

// Tour Booking Schema
export interface TourBooking {
  _id?: ObjectId;
  id?: string;
  tourId: string;
  tourName: string;
  tourSlug: string;
  userId: string;

  // Booking Details
  tourDate: string; // ISO date string (YYYY-MM-DD)
  tourTime?: string; // Optional time (HH:MM)

  // Participants
  participants: {
    adults: number;
    children: number;
    seniors: number;
  };
  totalParticipants: number;

  // Pricing
  pricing: {
    adultPrice: number;
    childPrice: number;
    seniorPrice: number;
    subtotal: number;
    tax: number;
    total: number;
  };

  // Customer Information
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  // Special Requests
  specialRequests?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;

  // Payment
  paymentInfo: {
    stripePaymentIntentId?: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paidAt?: string;
  };

  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  cancellationReason?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export function docToTour(doc: any): TourPackage {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as TourPackage;
}

function createSlugFromName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const collection = await getCollection<TourPackage>(TOURS_COLLECTION);
  const query: Filter<TourPackage> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}

// Define the collection name constant BEFORE using it
const TOURS_COLLECTION = 'tours';

// Seed initial data
async function seedInitialTours() {
  const toursCollection = await getCollection<TourPackage>(TOURS_COLLECTION);
  const activitiesCollection = await getCollection<TourActivity>('tourActivities');
  const count = await toursCollection.countDocuments();
  if (count === 0) {
    console.log("Seeding initial tour package...");
    const safariActivity = await activitiesCollection.findOne({ slug: 'safari' });
    const culturalActivity = await activitiesCollection.findOne({ slug: 'cultural-tour' });

    const activityIds = [];
    if (safariActivity) activityIds.push(safariActivity._id.toString());
    if (culturalActivity) activityIds.push(culturalActivity._id.toString());

    const now = new Date().toISOString();
    const sampleTour: Omit<TourPackage, 'id' | '_id' | 'slug' | 'guide'> = {
      name: "The Ultimate Serengeti Safari Adventure",
      duration: "5 Days, 4 Nights",
      description: "Embark on an unforgettable journey through the vast plains of the Serengeti. Witness the Great Migration, spot the 'Big Five', and experience the raw beauty of the African wilderness. This all-inclusive package offers luxury lodging and expert guides for a once-in-a-lifetime adventure.",
      location: "Serengeti National Park, Tanzania",
      tourType: "Wildlife Safari",
      tags: ["Big Five", "Luxury", "Great Migration", "Photography"],
      activityIds: activityIds,
      itinerary: [
        "Arrival at Kilimanjaro International Airport (JRO), transfer to Arusha for overnight stay.",
        "Drive to Serengeti National Park, with a game drive en route to your luxury tented camp.",
        "Full day exploring the central Serengeti, tracking wildlife with your expert guide.",
        "Morning game drive, followed by a visit to a local Maasai village for a cultural experience.",
        "Final morning game drive and transfer to a local airstrip for your flight back to Arusha."
      ],
      inclusions: ["All park fees and taxes", "Accommodation in luxury tented camps", "All meals (Breakfast, Lunch, Dinner)", "4x4 Safari vehicle with pop-up roof", "Professional English-speaking guide", "Bottled water during safari"],
      exclusions: ["International flights", "Visa fees", "Tips for your guide", "Personal travel insurance", "Alcoholic beverages"],
      price: 2500,
      featuredImageUrl: "https://placehold.co/800x600.png",
      galleryImages: [
        { url: "https://placehold.co/600x400.png", caption: "Our comfortable safari vehicle" },
        { url: "https://placehold.co/600x400.png", caption: "Luxury tented accommodation" },
        { url: "https://placehold.co/600x400.png", caption: "A stunning Serengeti sunset" }
      ],
      highlights: [
        { icon: "Users", text: "Private Group" },
        { icon: "Clock", text: "5 Days" },
        { icon: "Plane", text: "Flights Included" },
        { icon: "Hotel", text: "4 Nights Hotel" }
      ],
      faqs: [
        { question: "What is the best time of year to go?", answer: "The best time to visit the Serengeti is during the Dry season from June to October. However, the park offers excellent wildlife viewing year-round." },
        { question: "Are there any age restrictions?", answer: "This tour is suitable for ages 8 and up. We can arrange for more family-friendly private tours for those with younger children." },
        { question: "What kind of vaccinations do I need?", answer: "We recommend consulting your doctor or a travel clinic at least 6-8 weeks before your trip for personalized medical advice. A Yellow Fever vaccination may be required." }
      ],
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8164923.120111536!2d29.57073984928509!3d-2.457897214732001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x183359a17521c3b3%3A0x1b133c51806a41f8!2sSerengeti%20National%20Park!5e0!3m2!1sen!2sus!4v1626359238319!5m2!1sen!2sus",
      isActive: true,
      // New fields
      guideId: "000000000000000000000001", // Reference to John Safari guide
      rating: 4.8,
      reviewCount: 127,
      createdAt: now,
      updatedAt: now,
    };
    await addTour(sampleTour);
    console.log("Initial tour package seeded.");
  }
}
seedInitialTours().catch(console.error);


export async function getAllTours(filters: {
  isActive?: boolean;
  locations?: string[];
  tourTypes?: string[];
  durations?: string[];
  activityIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  excludeSlug?: string;
  limit?: number;
} = {}): Promise<{ tours: TourPackage[], filterOptions: any }> {
  const collection = await getCollection<TourPackage>(TOURS_COLLECTION);
  const query: Filter<TourPackage> = {};

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  } else {
    // Default to only active tours for public view if not specified
    // But we might want a way to say "don't filter by isActive"
    // query.isActive = true; 
  }

  if (filters.locations && filters.locations.length > 0) {
    query.location = { $in: filters.locations };
  }
  if (filters.tourTypes && filters.tourTypes.length > 0) {
    query.tourType = { $in: filters.tourTypes };
  }
  if (filters.durations && filters.durations.length > 0) {
    query.duration = { $in: filters.durations };
  }
  if (filters.activityIds && filters.activityIds.length > 0) {
    query.activityIds = { $in: filters.activityIds };
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
  }
  if (filters.excludeSlug) {
    query.slug = { $ne: filters.excludeSlug };
  }

  const cursor = collection.find(query).sort({ createdAt: -1 });

  if (filters.limit) {
    cursor.limit(filters.limit);
  }

  const [tours, filterOptions] = await Promise.all([
    cursor.toArray().then(docs => docs.map(docToTour)),
    getTourFilterOptions() // Fetch filter options in parallel
  ]);

  return { tours, filterOptions };
}

export async function getTourById(id: string): Promise<TourPackage | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<TourPackage>(TOURS_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  const tour = docToTour(doc);

  // Populate guide data if guideId exists
  if (tour.guideId) {
    const guide = await getGuideById(tour.guideId);
    if (guide) {
      tour.guide = guide;
    }
  }

  // Populate activity data if activityIds exist
  if (tour.activityIds && tour.activityIds.length > 0) {
    const activities = await Promise.all(
      tour.activityIds.map(id => getTourActivityById(id))
    );
    // @ts-ignore
    tour.activities = activities.filter((a): a is TourActivity => a !== null);
  }

  return tour;
}

export async function getTourBySlug(slug: string): Promise<TourPackage | null> {
  const collection = await getCollection<TourPackage>(TOURS_COLLECTION);
  const doc = await collection.findOne({ slug });
  if (!doc) return null;

  const tour = docToTour(doc);

  // Populate guide data if guideId exists
  if (tour.guideId) {
    const guide = await getGuideById(tour.guideId);
    if (guide) {
      tour.guide = guide;
    }
  }

  // Populate activity data if activityIds exist
  if (tour.activityIds && tour.activityIds.length > 0) {
    const activities = await Promise.all(
      tour.activityIds.map(id => getTourActivityById(id))
    );
    // @ts-ignore
    tour.activities = activities.filter((a): a is TourActivity => a !== null);
  }

  return tour;
}

// Get tour by ID or slug (helper function for API routes)
export async function getTourByIdOrSlug(idOrSlug: string): Promise<TourPackage | null> {
  // Try to get by ID first if it's a valid ObjectId
  if (ObjectId.isValid(idOrSlug)) {
    const tour = await getTourById(idOrSlug);
    if (tour) return tour;
  }

  // Otherwise try to get by slug
  return await getTourBySlug(idOrSlug);
}

export async function addTour(tourData: Omit<TourPackage, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'slug' | 'guide'>): Promise<TourPackage> {
  const collection = await getCollection<Omit<TourPackage, 'id' | '_id'>>(TOURS_COLLECTION);
  const now = new Date().toISOString();
  let slug = createSlugFromName(tourData.name);

  // Check for slug uniqueness and append number if needed
  let slugIsUnique = await isSlugUnique(slug);
  let counter = 1;
  while (!slugIsUnique) {
    slug = `${createSlugFromName(tourData.name)}-${counter}`;
    slugIsUnique = await isSlugUnique(slug);
    counter++;
  }

  const docToInsert = {
    ...tourData,
    slug,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), ...docToInsert };
}

export async function updateTour(id: string, updates: Partial<Omit<TourPackage, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'guide'>>): Promise<TourPackage | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<TourPackage>(TOURS_COLLECTION);

  const updatePayload: any = { ...updates, updatedAt: new Date().toISOString() };

  // If name is being updated, check slug uniqueness
  if (updates.name) {
    let slug = createSlugFromName(updates.name);
    let slugIsUnique = await isSlugUnique(slug, id);
    let counter = 1;
    while (!slugIsUnique) {
      slug = `${createSlugFromName(updates.name)}-${counter}`;
      slugIsUnique = await isSlugUnique(slug, id);
      counter++;
    }
    updatePayload.slug = slug;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  return result ? docToTour(result) : null;
}

export async function deleteTour(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<TourPackage>(TOURS_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function getTourFilterOptions() {
  const collection = await getCollection<TourPackage>(TOURS_COLLECTION);
  const activitiesCollection = await getCollection<TourActivity>('tourActivities');

  const toursPipeline = [
    { $match: { isActive: true } }, // Only consider active tours for filter options
    {
      $group: {
        _id: null,
        locations: { $addToSet: "$location" },
        tourTypes: { $addToSet: "$tourType" },
        durations: { $addToSet: "$duration" },
        maxPrice: { $max: "$price" }
      }
    }
  ];

  const [toursResult, activitiesResult] = await Promise.all([
    collection.aggregate(toursPipeline).toArray(),
    activitiesCollection.find({}).sort({ name: 1 }).toArray()
  ]);


  if (toursResult.length === 0) {
    return { locations: [], tourTypes: [], durations: [], maxPrice: 1000, activities: activitiesResult };
  }

  const data = toursResult[0];
  return {
    locations: (data.locations || []).sort(),
    tourTypes: (data.tourTypes || []).sort(),
    durations: (data.durations || []).sort(),
    maxPrice: data.maxPrice || 1000,
    activities: activitiesResult.map(a => ({ id: a._id!.toString(), name: a.name, slug: a.slug })),
  };
}

// ==================== TOUR BOOKING OPERATIONS ====================

const TOUR_BOOKINGS_COLLECTION = 'tourBookings';

export function docToTourBooking(doc: any): TourBooking {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as TourBooking;
}

// Create a new tour booking
export async function createTourBooking(bookingData: Omit<TourBooking, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<TourBooking> {
  const collection = await getCollection<TourBooking>(TOUR_BOOKINGS_COLLECTION);
  const now = new Date().toISOString();

  const newBooking: Omit<TourBooking, 'id'> = {
    ...bookingData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(newBooking as any);
  const insertedBooking = await collection.findOne({ _id: result.insertedId });
  return docToTourBooking(insertedBooking);
}

// Get all tour bookings with filters
export async function getAllTourBookings(filters: {
  userId?: string;
  tourId?: string;
  status?: string;
  tourDate?: string;
} = {}): Promise<TourBooking[]> {
  const collection = await getCollection<TourBooking>(TOUR_BOOKINGS_COLLECTION);
  const query: Filter<TourBooking> = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }
  if (filters.tourId) {
    query.tourId = filters.tourId;
  }
  if (filters.status) {
    query.status = filters.status as any;
  }
  if (filters.tourDate) {
    query.tourDate = filters.tourDate;
  }

  const bookings = await collection.find(query).sort({ createdAt: -1 }).toArray();
  return bookings.map(docToTourBooking);
}

// Get a single tour booking by ID
export async function getTourBookingById(id: string): Promise<TourBooking | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<TourBooking>(TOUR_BOOKINGS_COLLECTION);
  const booking = await collection.findOne({ _id: new ObjectId(id) });
  return docToTourBooking(booking);
}

// Update a tour booking
export async function updateTourBooking(
  id: string,
  updates: Partial<Omit<TourBooking, 'id' | '_id' | 'createdAt'>>
): Promise<TourBooking | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<TourBooking>(TOUR_BOOKINGS_COLLECTION);

  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  return docToTourBooking(result);
}

// Delete a tour booking
export async function deleteTourBooking(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<TourBooking>(TOUR_BOOKINGS_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

// Get bookings for a specific tour (for tour operators)
export async function getTourBookingsByTourId(tourId: string): Promise<TourBooking[]> {
  const collection = await getCollection<TourBooking>(TOUR_BOOKINGS_COLLECTION);
  const bookings = await collection.find({ tourId }).sort({ tourDate: 1, createdAt: -1 }).toArray();
  return bookings.map(docToTourBooking);
}
