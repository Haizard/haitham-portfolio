
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';

const SETTINGS_COLLECTION = 'settings';
const PLATFORM_SETTINGS_DOC_ID = 'platform_config'; // Use a fixed ID for the single settings document

export interface PlatformSettings {
  _id?: string; // Use a fixed string ID
  commissionRate: number; // e.g., 0.15 for 15%
}

const defaultSettings: PlatformSettings = {
  _id: PLATFORM_SETTINGS_DOC_ID,
  commissionRate: 0.15, // Default to 15%
};

// Ensure the settings document exists with defaults
async function ensureSettingsDocExists(): Promise<void> {
  const collection = await getCollection<PlatformSettings>(SETTINGS_COLLECTION);
  const existing = await collection.findOne({ _id: PLATFORM_SETTINGS_DOC_ID });
  if (!existing) {
    await collection.insertOne(defaultSettings);
    console.log("Platform settings document created with defaults.");
  }
}

ensureSettingsDocExists().catch(console.error);


export async function getPlatformSettings(): Promise<PlatformSettings> {
  const collection = await getCollection<PlatformSettings>(SETTINGS_COLLECTION);
  const settings = await collection.findOne({ _id: PLATFORM_SETTINGS_DOC_ID });
  
  // If for some reason it doesn't exist, return the default and let the seeder function handle creation
  return settings || defaultSettings;
}

export async function updatePlatformSettings(updates: Partial<Omit<PlatformSettings, '_id'>>): Promise<PlatformSettings | null> {
  const collection = await getCollection<PlatformSettings>(SETTINGS_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { _id: PLATFORM_SETTINGS_DOC_ID },
    { $set: updates },
    { returnDocument: 'after', upsert: true } // Upsert ensures the doc is created if it was manually deleted
  );
  
  return result;
}
