// /src/lib/mongodb.ts
import { MongoClient, type Db, type Collection } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME || 'CreatorOS';

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
  const { db } = await connectToDatabase();
  return db.collection<T>(collectionName);
}
