
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const TOUR_ACTIVITIES_COLLECTION = 'tourActivities';

export interface TourActivity {
  _id?: ObjectId;
  id?: string;
  name: string;
  slug: string;
  description?: string;
}

function docToTourActivity(doc: any): TourActivity {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as TourActivity;
}

function createSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const collection = await getCollection<TourActivity>(TOUR_ACTIVITIES_COLLECTION);
  const query: Filter<TourActivity> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}

// Seed initial data
async function seedInitialActivities() {
    const collection = await getCollection<TourActivity>(TOUR_ACTIVITIES_COLLECTION);
    const count = await collection.countDocuments();
    if (count === 0) {
        console.log("Seeding initial tour activities...");
        const activities = [
            { name: "Safari", description: "Wildlife viewing expeditions." },
            { name: "Cultural Tour", description: "Immersive local cultural experiences." },
            { name: "Hiking", description: "Guided treks and mountain climbs." },
            { name: "Beach Holiday", description: "Relaxing stays at coastal resorts." },
        ];
        const activitiesToInsert = activities.map(a => ({
            name: a.name,
            slug: createSlug(a.name),
            description: a.description,
        }));
        await collection.insertMany(activitiesToInsert as any[]);
        console.log("Initial tour activities seeded.");
    }
}
seedInitialActivities().catch(console.error);


export async function getAllTourActivities(): Promise<TourActivity[]> {
  const collection = await getCollection<TourActivity>(TOUR_ACTIVITIES_COLLECTION);
  const docs = await collection.find({}).sort({ name: 1 }).toArray();
  return docs.map(docToTourActivity);
}

export async function getTourActivityById(id: string): Promise<TourActivity | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<TourActivity>(TOUR_ACTIVITIES_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? docToTourActivity(doc) : null;
}

export async function addTourActivity(activityData: Omit<TourActivity, 'id' | '_id' | 'slug'>): Promise<TourActivity> {
  const collection = await getCollection<Omit<TourActivity, 'id' | '_id'>>(TOUR_ACTIVITIES_COLLECTION);
  const slug = createSlug(activityData.name);
  if (!slug) throw new Error("Name resulted in an empty slug.");

  if (!(await isSlugUnique(slug))) {
    throw new Error(`Tour activity with slug '${slug}' already exists.`);
  }

  const docToInsert = { slug, ...activityData };
  const result = await collection.insertOne(docToInsert as any);
  return { id: result.insertedId.toString(), _id: result.insertedId, ...docToInsert };
}

export async function updateTourActivity(id: string, updates: Partial<Omit<TourActivity, 'id' | '_id' | 'slug'>>): Promise<TourActivity | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<TourActivity>(TOUR_ACTIVITIES_COLLECTION);

  const existing = await collection.findOne({ _id: new ObjectId(id) });
  if (!existing) return null;

  const updatePayload: any = { ...updates };

  if (updates.name && updates.name !== existing.name) {
    const newSlug = createSlug(updates.name);
    if (!newSlug) throw new Error("Updated name resulted in an empty slug.");
    if (!(await isSlugUnique(newSlug, id))) {
      throw new Error(`Update failed: Slug '${newSlug}' would conflict with an existing activity.`);
    }
    updatePayload.slug = newSlug;
  }

  if (Object.keys(updatePayload).length === 0) {
    return docToTourActivity(existing);
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  return result ? docToTourActivity(result) : null;
}

export async function deleteTourActivity(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<TourActivity>(TOUR_ACTIVITIES_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
