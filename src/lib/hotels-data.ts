import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const PROPERTIES_COLLECTION = 'properties';
const ROOMS_COLLECTION = 'rooms';
const HOTEL_BOOKINGS_COLLECTION = 'hotel_bookings';

// --- Type Definitions ---

export type PropertyType = 'hotel' | 'apartment' | 'resort' | 'villa' | 'hostel' | 'guesthouse';
export type PropertyStatus = 'active' | 'inactive' | 'pending_approval';
export type RoomType = 'single' | 'double' | 'twin' | 'suite' | 'deluxe' | 'family';
export type BedType = 'single' | 'double' | 'queen' | 'king' | 'sofa_bed';
export type HotelBookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'non_refundable';

export interface PropertyImage {
  url: string;
  caption?: string;
  order: number;
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PropertyPolicies {
  checkInTime: string; // e.g., "14:00"
  checkOutTime: string; // e.g., "11:00"
  cancellationPolicy: CancellationPolicy;
  childrenAllowed: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
}

export interface Property {
  _id?: ObjectId;
  id?: string;
  ownerId: string; // ref: Users
  name: string;
  slug: string;
  type: PropertyType;
  description: string;
  images: PropertyImage[];
  location: PropertyLocation;
  amenities: string[]; // ['wifi', 'parking', 'pool', 'gym', 'restaurant', 'spa', 'bar']
  starRating: number; // 1-5
  policies: PropertyPolicies;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  status: PropertyStatus;
  averageRating?: number;
  reviewCount?: number;
  totalRooms: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomImage {
  url: string;
  caption?: string;
  order: number;
}

export interface RoomCapacity {
  adults: number;
  children: number;
  infants: number;
}

export interface BedConfiguration {
  type: BedType;
  count: number;
}

export interface RoomPricing {
  basePrice: number;
  currency: string;
  unit?: 'nightly' | 'monthly'; // Defaults to nightly
  taxRate: number; // percentage
  cleaningFee?: number;
  extraGuestFee?: number;
}

export interface RoomAvailability {
  totalRooms: number;
  minimumStay: number; // nights
  maximumStay?: number;
}

export interface Room {
  _id?: ObjectId;
  id?: string;
  propertyId: string; // ref: Properties
  name: string;
  type: RoomType;
  description: string;
  images: RoomImage[];
  capacity: RoomCapacity;
  bedConfiguration: BedConfiguration[];
  size: number; // in square meters
  amenities: string[]; // ['tv', 'minibar', 'safe', 'balcony', 'sea_view', 'bathtub']
  pricing: RoomPricing;
  availability: RoomAvailability;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
}

export interface HotelBooking {
  _id?: ObjectId;
  id?: string;
  propertyId: string; // ref: Properties
  roomId: string; // ref: Rooms
  userId: string; // ref: Users
  guestInfo: GuestInfo;
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  numberOfNights: number;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  pricing: {
    roomPrice: number;
    taxAmount: number;
    cleaningFee: number;
    extraGuestFee: number;
    totalPrice: number;
    currency: string;
  };
  paymentInfo: {
    paymentIntentId: string;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paidAt?: string;
  };
  status: HotelBookingStatus;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Helper Functions ---

export function docToProperty(doc: any): Property {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Property;
}

export function docToRoom(doc: any): Room {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Room;
}

export function docToHotelBooking(doc: any): HotelBooking {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as HotelBooking;
}

// --- Property CRUD Operations ---

export async function createProperty(propertyData: Omit<Property, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'reviewCount'>): Promise<Property> {
  const collection = await getCollection<Omit<Property, 'id'>>(PROPERTIES_COLLECTION);

  const now = new Date().toISOString();
  const docToInsert = {
    ...propertyData,
    averageRating: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  return docToProperty({ _id: result.insertedId, ...docToInsert });
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const collection = await getCollection<Property>(PROPERTIES_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return docToProperty(doc);
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const collection = await getCollection<Property>(PROPERTIES_COLLECTION);
  const doc = await collection.findOne({ slug });
  return docToProperty(doc);
}

export async function getPropertiesByOwnerId(ownerId: string): Promise<Property[]> {
  const collection = await getCollection<Property>(PROPERTIES_COLLECTION);
  const docs = await collection.find({ ownerId }).toArray();
  return docs.map(docToProperty);
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  const collection = await getCollection<Property>(PROPERTIES_COLLECTION);

  const updateDoc = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: 'after' }
  );

  return docToProperty(result);
}

export async function deleteProperty(id: string): Promise<boolean> {
  const collection = await getCollection<Property>(PROPERTIES_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// --- Room CRUD Operations ---

export async function createRoom(roomData: Omit<Room, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
  const collection = await getCollection<Omit<Room, 'id'>>(ROOMS_COLLECTION);

  const now = new Date().toISOString();
  const docToInsert = {
    ...roomData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  return docToRoom({ _id: result.insertedId, ...docToInsert });
}

export async function getRoomById(id: string): Promise<Room | null> {
  const collection = await getCollection<Room>(ROOMS_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return docToRoom(doc);
}

export async function getRoomsByPropertyId(propertyId: string): Promise<Room[]> {
  const collection = await getCollection<Room>(ROOMS_COLLECTION);
  const docs = await collection.find({ propertyId, isActive: true }).toArray();
  return docs.map(docToRoom);
}

export async function updateRoom(id: string, updates: Partial<Room>): Promise<Room | null> {
  const collection = await getCollection<Room>(ROOMS_COLLECTION);

  const updateDoc = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: 'after' }
  );

  return docToRoom(result);
}

export async function deleteRoom(id: string): Promise<boolean> {
  const collection = await getCollection<Room>(ROOMS_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// --- Hotel Booking Operations ---

export async function createHotelBooking(bookingData: Omit<HotelBooking, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<HotelBooking> {
  const collection = await getCollection<Omit<HotelBooking, 'id'>>(HOTEL_BOOKINGS_COLLECTION);

  const now = new Date().toISOString();
  const docToInsert = {
    ...bookingData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  return docToHotelBooking({ _id: result.insertedId, ...docToInsert });
}

export async function getHotelBookingById(id: string): Promise<HotelBooking | null> {
  const collection = await getCollection<HotelBooking>(HOTEL_BOOKINGS_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return docToHotelBooking(doc);
}

export async function getHotelBookingsByUserId(userId: string): Promise<HotelBooking[]> {
  const collection = await getCollection<HotelBooking>(HOTEL_BOOKINGS_COLLECTION);
  const docs = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  return docs.map(docToHotelBooking);
}

export async function getHotelBookingsByPropertyId(propertyId: string): Promise<HotelBooking[]> {
  const collection = await getCollection<HotelBooking>(HOTEL_BOOKINGS_COLLECTION);
  const docs = await collection.find({ propertyId }).sort({ createdAt: -1 }).toArray();
  return docs.map(docToHotelBooking);
}

export async function updateHotelBooking(id: string, updates: Partial<HotelBooking>): Promise<HotelBooking | null> {
  const collection = await getCollection<HotelBooking>(HOTEL_BOOKINGS_COLLECTION);

  const updateDoc = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: 'after' }
  );

  return docToHotelBooking(result);
}

// Check room availability for given dates
export async function checkRoomAvailability(
  roomId: string,
  checkInDate: string,
  checkOutDate: string
): Promise<{ available: boolean; availableRooms: number }> {
  const room = await getRoomById(roomId);
  if (!room) {
    return { available: false, availableRooms: 0 };
  }

  const bookingsCollection = await getCollection<HotelBooking>(HOTEL_BOOKINGS_COLLECTION);

  // Find overlapping bookings
  const overlappingBookings = await bookingsCollection.find({
    roomId,
    status: { $in: ['pending', 'confirmed', 'checked_in'] },
    $or: [
      {
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate }
      }
    ]
  }).toArray();

  const bookedRooms = overlappingBookings.length;
  const availableRooms = room.availability.totalRooms - bookedRooms;

  return {
    available: availableRooms > 0,
    availableRooms: Math.max(0, availableRooms)
  };
}

// Search properties with filters
export interface PropertySearchFilters {
  city?: string;
  country?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  amenities?: string[];
  minRating?: number;
  status?: PropertyStatus;
}

export async function searchProperties(filters: PropertySearchFilters): Promise<Property[]> {
  const collection = await getCollection<Property>(PROPERTIES_COLLECTION);

  const query: Filter<Property> = {};

  // Location filters
  if (filters.city) {
    query['location.city'] = new RegExp(filters.city, 'i');
  }
  if (filters.country) {
    query['location.country'] = new RegExp(filters.country, 'i');
  }

  // Property type
  if (filters.propertyType) {
    query.type = filters.propertyType;
  }

  // Rating filter
  if (filters.minRating) {
    query.averageRating = { $gte: filters.minRating };
  }

  // Amenities filter
  if (filters.amenities && filters.amenities.length > 0) {
    query.amenities = { $all: filters.amenities };
  }

  // Status filter (default to active)
  query.status = filters.status || 'active';

  const properties = await collection.find(query).toArray();

  // If date filters are provided, filter by room availability
  if (filters.checkInDate && filters.checkOutDate) {
    const availableProperties: Property[] = [];

    for (const property of properties) {
      const rooms = await getRoomsByPropertyId(property._id!.toString());

      // Check if any room is available and matches price/guest criteria
      for (const room of rooms) {
        const { available } = await checkRoomAvailability(
          room.id!,
          filters.checkInDate,
          filters.checkOutDate
        );

        if (!available) continue;

        // Price filter
        if (filters.minPrice && room.pricing.basePrice < filters.minPrice) continue;
        if (filters.maxPrice && room.pricing.basePrice > filters.maxPrice) continue;

        // Guest capacity filter
        if (filters.guests && room.capacity.adults < filters.guests) continue;

        // If we found at least one matching room, include the property
        availableProperties.push(docToProperty(property));
        break;
      }
    }

    return availableProperties;
  }

  return properties.map(docToProperty);
}

