// /src/lib/mongodb.ts
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

if (!uri) {
  throw new Error('Please add your Mongo URI to your .env file')
}

// Add a more specific validation check for the connection string format.
if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
  throw new Error('Invalid MongoDB URI scheme. Please ensure your connection string in the .env file starts with "mongodb://" or "mongodb+srv://".');
}


let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// The official recommendation for Next.js is to use a global variable to preserve the
// client across module reloads caused by HMR (Hot Module Replacement) in development.
// This prevents a new connection from being established on every change.
let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

if (process.env.NODE_ENV === 'development') {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getCollection<T extends Document>(collectionName: string) {
    const mongoClient = await clientPromise;
    const dbName = process.env.DB_NAME;
    if (!dbName) {
        throw new Error("DB_NAME environment variable is not set. Please add it to your .env file.");
    }
    const db = mongoClient.db(dbName);
    return db.collection<T>(collectionName);
}
