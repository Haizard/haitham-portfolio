
import { MongoClient, ServerApiVersion, type Db, type Collection } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'CreatorOS'; // Default DB name if not set

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env or .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

interface MongoGlobal extends NodeJS.Global {
    _mongoClientPromise?: Promise<MongoClient>;
}
declare const global: MongoGlobal;


if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const mongoClient = await clientPromise;
  return mongoClient.db(dbName);
}

export async function getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(collectionName);
}

// Optional: A function to explicitly close the connection if needed (e.g., in serverless functions after execution)
export async function closeConnection(): Promise<void> {
  if (clientPromise) {
    const c = await clientPromise;
    await c.close();
    if (process.env.NODE_ENV === 'development') {
        delete global._mongoClientPromise;
    }
    console.log("MongoDB connection closed.");
  }
}

// Export the client promise if you need direct access to the MongoClient instance
export { clientPromise };
