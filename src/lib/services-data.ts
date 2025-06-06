
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const SERVICES_COLLECTION = 'services';

export interface Service {
  _id?: ObjectId; // MongoDB native ID
  id?: string;    // String representation of _id, used in frontend/API
  name: string;
  price: string; // Keep as string as per current schema, can be parsed to number if needed
  duration: string;
  description: string;
}

// Helper to convert MongoDB document to Service interface
function docToService(doc: any): Service {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Service;
}

export async function getAllServices(): Promise<Service[]> {
  const collection = await getCollection<Service>(SERVICES_COLLECTION);
  const serviceDocs = await collection.find({}).sort({ name: 1 }).toArray();
  return serviceDocs.map(docToService);
}

export async function getServiceById(id: string): Promise<Service | null> {
  if (!ObjectId.isValid(id)) {
    console.warn(`getServiceById: Invalid ID format: ${id}`);
    return null;
  }
  const collection = await getCollection<Service>(SERVICES_COLLECTION);
  const serviceDoc = await collection.findOne({ _id: new ObjectId(id) });
  return serviceDoc ? docToService(serviceDoc) : null;
}

export async function addService(serviceData: Omit<Service, 'id' | '_id'>): Promise<Service> {
  const collection = await getCollection<Omit<Service, 'id' | '_id'>>(SERVICES_COLLECTION);
  
  // Optional: Check for existing service by name if names should be unique
  // const existingService = await collection.findOne({ name: serviceData.name });
  // if (existingService) {
  //   throw new Error(`Service with name '${serviceData.name}' already exists.`);
  // }

  const result = await collection.insertOne(serviceData as any); // Cast to any to satisfy MongoDB driver if schema slightly differs
  
  // Construct the service object to return, including the new _id and its string version id
  const newService: Service = {
    _id: result.insertedId,
    id: result.insertedId.toString(),
    ...serviceData
  };
  return newService;
}

export async function updateService(id: string, updates: Partial<Omit<Service, 'id' | '_id'>>): Promise<Service | null> {
  if (!ObjectId.isValid(id)) {
    console.warn(`updateService: Invalid ID format: ${id}`);
    return null;
  }
  const collection = await getCollection<Service>(SERVICES_COLLECTION);
    
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' } // Ensures the updated document is returned
  );

  if (!result) { // MongoDB driver 4.x+ findOneAndUpdate returns the document itself or null
    console.warn(`updateService: Service with ID '${id}' not found or update failed.`);
    return null;
  }
  return docToService(result);
}

export async function deleteService(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    console.warn(`deleteService: Invalid ID format: ${id}`);
    return false;
  }
  const collection = await getCollection<Service>(SERVICES_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  
  if (result.deletedCount === 1) {
    console.log(`Service with ID '${id}' deleted successfully.`);
    return true;
  } else {
    console.warn(`Service with ID '${id}' not found or delete failed.`);
    return false;
  }
}
