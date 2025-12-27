
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const SERVICES_COLLECTION = 'services';

export interface Testimonial {
  id: string;
  customerName: string;
  customerAvatar?: string; // URL
  comment: string;
  rating?: number; // e.g., 1-5
  date: string; // ISO string
}

export interface Service {
  _id?: ObjectId;
  id?: string;
  freelancerId: string; // ID of the freelancer offering the service
  slug: string;
  name: string;
  price: string;
  duration: string;
  description: string; // Short description for listing
  categoryIds?: string[]; // Array of service category IDs (supports multiple categories)
  detailedDescription?: string; // Longer, potentially HTML content for detail page
  howItWorks?: string[]; // Array of steps or process points
  benefits?: string[]; // Array of benefits
  offers?: string[]; // Array of special offers
  securityInfo?: string;
  imageUrl?: string; // Featured image for the service
  imageHint?: string;
  testimonials?: Testimonial[];
  deliveryTime?: string; // e.g., "3 days", "1 week"
  revisionsIncluded?: string; // e.g., "2 revisions", "Unlimited"
}

function docToService(doc: any): Service {
  if (!doc) return doc;
  const { _id, categoryId, ...rest } = doc;

  // Backward compatibility: convert old single categoryId to categoryIds array
  let categoryIds = rest.categoryIds;
  if (!categoryIds && categoryId) {
    categoryIds = [categoryId];
  }

  return {
    id: _id?.toString(),
    ...rest,
    categoryIds: categoryIds || [],
    howItWorks: rest.howItWorks || [],
    benefits: rest.benefits || [],
    offers: rest.offers || [],
    testimonials: (rest.testimonials || []).map((t: any) => ({ id: new ObjectId().toString(), ...t })),
    deliveryTime: rest.deliveryTime || undefined,
    revisionsIncluded: rest.revisionsIncluded || undefined,
  } as Service;
}

function createServiceSlug(name: string): string {
  if (!name) return `service-${Date.now()}`;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70);
}

async function isServiceSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const collection = await getCollection<Service>(SERVICES_COLLECTION);
  const query: Filter<Service> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}

export async function getAllServices(freelancerId?: string, categoryId?: string): Promise<Service[]> {
  const collection = await getCollection<Service>(SERVICES_COLLECTION);
  const query: Filter<Service> = {};
  if (freelancerId) {
    query.freelancerId = freelancerId;
  }
  if (categoryId) {
    // Support both old categoryId (string) and new categoryIds (array)
    query.$or = [
      { categoryIds: categoryId },
      { categoryId: categoryId } // Backward compatibility
    ];
  }
  const serviceDocs = await collection.find(query).sort({ name: 1 }).toArray();
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

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const collection = await getCollection<Service>(SERVICES_COLLECTION);
  const serviceDoc = await collection.findOne({ slug });
  return serviceDoc ? docToService(serviceDoc) : null;
}

export async function addService(serviceData: Omit<Service, 'id' | '_id' | 'slug'>): Promise<Service> {
  const collection = await getCollection<Omit<Service, 'id' | '_id'>>(SERVICES_COLLECTION);
  let slug = createServiceSlug(serviceData.name);
  let counter = 1;
  while (!(await isServiceSlugUnique(slug))) {
    slug = `${createServiceSlug(serviceData.name)}-${counter}`;
    counter++;
  }

  const docToInsert = {
    ...serviceData,
    slug,
    detailedDescription: serviceData.detailedDescription || serviceData.description,
    howItWorks: serviceData.howItWorks || [],
    benefits: serviceData.benefits || [],
    offers: serviceData.offers || [],
    securityInfo: serviceData.securityInfo || undefined,
    imageUrl: serviceData.imageUrl || `https://placehold.co/800x400.png?text=${encodeURIComponent(serviceData.name.substring(0, 15))}`,
    imageHint: serviceData.imageHint || "service photo",
    testimonials: (serviceData.testimonials || []).map(t => ({ ...t, id: new ObjectId().toString() })),
    deliveryTime: serviceData.deliveryTime || undefined,
    revisionsIncluded: serviceData.revisionsIncluded || undefined,
  };

  const result = await collection.insertOne(docToInsert as any);

  const newService: Service = {
    _id: result.insertedId,
    id: result.insertedId.toString(),
    ...docToInsert
  };
  return newService;
}

export async function updateService(id: string, updates: Partial<Omit<Service, 'id' | '_id' | 'slug' | 'freelancerId'>>): Promise<Service | null> {
  if (!ObjectId.isValid(id)) {
    console.warn(`updateService: Invalid ID format: ${id}`);
    return null;
  }
  const collection = await getCollection<Service>(SERVICES_COLLECTION);

  const existingService = await collection.findOne({ _id: new ObjectId(id) });
  if (!existingService) {
    console.warn(`updateService: Service with ID ${id} not found.`);
    return null;
  }

  const updatePayload = { ...updates };

  if (updates.name && updates.name !== existingService.name) {
    let newSlug = createServiceSlug(updates.name);
    let counter = 1;
    while (!(await isServiceSlugUnique(newSlug, id))) {
      newSlug = `${createServiceSlug(updates.name)}-${counter}`;
      counter++;
    }
    (updatePayload as Service).slug = newSlug;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );

  if (!result) {
    console.warn(`updateService: Service with ID '${id}' not found or update failed post-operation.`);
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
