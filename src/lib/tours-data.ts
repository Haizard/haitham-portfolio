
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { TourActivity } from './tour-activities-data';

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
  createdAt: string;
  updatedAt: string;
}

function docToTour(doc: any): TourPackage {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as TourPackage;
}

function createSlugFromName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
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
        const sampleTour: Omit<TourPackage, 'id' | '_id' | 'slug'> = {
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
  
  query.isActive = true; // Always filter for active tours on the public page

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
  return doc ? docToTour(doc) : null;
}

export async function getTourBySlug(slug: string): Promise<TourPackage | null> {
  const collection = await getCollection<TourPackage>(TOURS_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ? docToTour(doc) : null;
}

export async function addTour(tourData: Omit<TourPackage, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'slug'>): Promise<TourPackage> {
  const collection = await getCollection<Omit<TourPackage, 'id' | '_id'>>(TOURS_COLLECTION);
  const now = new Date().toISOString();
  const slug = createSlugFromName(tourData.name);
  // TODO: Check for slug uniqueness before inserting

  const docToInsert = {
    ...tourData,
    slug,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), ...docToInsert };
}

export async function updateTour(id: string, updates: Partial<Omit<TourPackage, 'id' | '_id' | 'createdAt' | 'updatedAt'>>): Promise<TourPackage | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<TourPackage>(TOURS_COLLECTION);

  const updatePayload: any = { ...updates, updatedAt: new Date().toISOString() };
  if (updates.name) {
      updatePayload.slug = createSlugFromName(updates.name);
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
