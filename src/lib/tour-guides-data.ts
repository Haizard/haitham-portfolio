
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';
import type { TourGuide } from './tours-data';

const TOUR_GUIDES_COLLECTION = 'tourGuides';

interface TourGuideDoc extends Omit<TourGuide, 'id'> {
  _id?: ObjectId;
}

function docToGuide(doc: any): TourGuide {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as TourGuide;
}

// Seed initial tour guides
async function seedInitialGuides() {
  const collection = await getCollection<TourGuideDoc>(TOUR_GUIDES_COLLECTION);
  const count = await collection.countDocuments();
  if (count === 0) {
    console.log("Seeding initial tour guides...");
    const guides = [
      {
        _id: new ObjectId("000000000000000000000001"), // Fixed ID for sample guide
        name: "John Safari",
        avatarUrl: "https://placehold.co/100x100.png?text=JS",
        bio: "Expert safari guide with over 15 years of experience in East African wildlife tourism. Certified naturalist and wildlife photographer.",
        joinedYear: 2009,
      },
      {
        name: "Maria Kilimanjaro",
        avatarUrl: "https://placehold.co/100x100.png?text=MK",
        bio: "Specialized in mountain trekking and cultural tours. Fluent in English, Swahili, and Spanish.",
        joinedYear: 2015,
      },
      {
        name: "David Coastal",
        avatarUrl: "https://placehold.co/100x100.png?text=DC",
        bio: "Beach and coastal tour specialist. Expert in marine life and water sports activities.",
        joinedYear: 2018,
      },
    ];
    await collection.insertMany(guides);
    console.log("Initial tour guides seeded.");
  }
}
seedInitialGuides().catch(console.error);

export async function getAllGuides(): Promise<TourGuide[]> {
  const collection = await getCollection<TourGuideDoc>(TOUR_GUIDES_COLLECTION);
  const docs = await collection.find({}).sort({ name: 1 }).toArray();
  return docs.map(docToGuide);
}

export async function getGuideById(id: string): Promise<TourGuide | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<TourGuideDoc>(TOUR_GUIDES_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? docToGuide(doc) : null;
}

export async function getGuidesByIds(ids: string[]): Promise<TourGuide[]> {
  const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
  if (validIds.length === 0) return [];

  const collection = await getCollection<TourGuideDoc>(TOUR_GUIDES_COLLECTION);
  const docs = await collection.find({ _id: { $in: validIds } }).toArray();
  return docs.map(docToGuide);
}

export async function addGuide(guideData: Omit<TourGuide, 'id'>): Promise<TourGuide> {
  const collection = await getCollection<TourGuideDoc>(TOUR_GUIDES_COLLECTION);
  const result = await collection.insertOne(guideData as TourGuideDoc);
  return { id: result.insertedId.toString(), ...guideData };
}

export async function updateGuide(id: string, updates: Partial<Omit<TourGuide, 'id'>>): Promise<TourGuide | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<TourGuideDoc>(TOUR_GUIDES_COLLECTION);
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ? docToGuide(result) : null;
}

export async function deleteGuide(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<TourGuideDoc>(TOUR_GUIDES_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

