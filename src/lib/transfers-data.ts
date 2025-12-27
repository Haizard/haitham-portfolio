import { ObjectId, WithId, Document } from 'mongodb';
import { getCollection } from './mongodb';

// Collection names
const TRANSFER_VEHICLES_COLLECTION = 'transfer_vehicles';
const TRANSFER_BOOKINGS_COLLECTION = 'transfer_bookings';

// --- Type Definitions ---

export type TransferVehicleCategory = 'sedan' | 'suv' | 'van' | 'minibus' | 'bus' | 'luxury';
export type TransferType = 'airport_to_city' | 'city_to_airport' | 'point_to_point' | 'hourly';
export type TransferVehicleStatus = 'available' | 'in_service' | 'maintenance' | 'inactive';
export type TransferBookingStatus = 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface TransferVehicle {
  id: string;
  _id?: ObjectId;
  ownerId: string;
  category: TransferVehicleCategory;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  capacity: {
    passengers: number;
    luggage: number;
  };
  features: string[]; // e.g., 'wifi', 'ac', 'child_seat', 'wheelchair_accessible', 'luxury_interior'
  images: Array<{
    url: string;
    caption?: string;
    isPrimary: boolean;
  }>;
  location: {
    city: string;
    state: string;
    country: string;
    airport?: string; // Airport code if based at airport
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  pricing: {
    basePrice: number; // Base price for standard transfer
    pricePerKm: number;
    pricePerHour: number;
    currency: string;
    airportSurcharge?: number;
    nightSurcharge?: number; // 10pm - 6am
    waitingTimeFee?: number; // Per 15 minutes
  };
  driverInfo?: {
    name: string;
    phone: string;
    licenseNumber: string;
    yearsOfExperience: number;
    languages: string[];
  };
  videoUrl?: string;
  status: TransferVehicleStatus;
  averageRating?: number;
  reviewCount?: number;
  totalTransfers: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransferBooking {
  id: string;
  _id?: ObjectId;
  vehicleId: string;
  userId: string;
  transferType: TransferType;
  pickupLocation: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    flightNumber?: string; // For airport pickups
    terminal?: string;
  };
  dropoffLocation: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  pickupDate: string; // ISO date
  pickupTime: string; // HH:mm format
  estimatedDuration: number; // Minutes
  estimatedDistance: number; // Kilometers
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    numberOfPassengers: number;
    numberOfLuggage: number;
  };
  specialRequests?: string;
  childSeatsRequired?: number;
  wheelchairAccessible?: boolean;
  pricing: {
    basePrice: number;
    distanceCharge: number;
    airportSurcharge?: number;
    nightSurcharge?: number;
    waitingTimeFee?: number;
    totalPrice: number;
    currency: string;
  };
  paymentInfo: {
    paymentIntentId: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  };
  status: TransferBookingStatus;
  driverNotes?: string;
  actualPickupTime?: string;
  actualDropoffTime?: string;
  actualDistance?: number;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Helper Functions ---

export function docToTransferVehicle(doc: WithId<Document> | null): TransferVehicle | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: _id.toString(),
    _id,
    ...rest,
  } as TransferVehicle;
}

export function docToTransferBooking(doc: WithId<Document> | null): TransferBooking | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: _id.toString(),
    _id,
    ...rest,
  } as TransferBooking;
}

// --- Transfer Vehicle Operations ---

export async function createTransferVehicle(
  vehicleData: Omit<TransferVehicle, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'totalTransfers' | 'averageRating' | 'reviewCount'>
): Promise<TransferVehicle> {
  const collection = await getCollection<Omit<TransferVehicle, 'id'>>(TRANSFER_VEHICLES_COLLECTION);

  const now = new Date().toISOString();
  const docToInsert = {
    ...vehicleData,
    totalTransfers: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  return docToTransferVehicle({ _id: result.insertedId, ...docToInsert })!;
}

export async function getTransferVehicleById(id: string): Promise<TransferVehicle | null> {
  const collection = await getCollection<TransferVehicle>(TRANSFER_VEHICLES_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return docToTransferVehicle(doc);
}

export async function getTransferVehiclesByOwnerId(ownerId: string): Promise<TransferVehicle[]> {
  const collection = await getCollection<TransferVehicle>(TRANSFER_VEHICLES_COLLECTION);
  const docs = await collection.find({ ownerId }).toArray();
  return docs.map(docToTransferVehicle).filter((v): v is TransferVehicle => v !== null);
}

export async function updateTransferVehicle(
  id: string,
  updates: Partial<Omit<TransferVehicle, 'id' | '_id' | 'createdAt' | 'ownerId'>>
): Promise<TransferVehicle | null> {
  const collection = await getCollection<TransferVehicle>(TRANSFER_VEHICLES_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    },
    { returnDocument: 'after' }
  );

  return docToTransferVehicle(result);
}

export async function deleteTransferVehicle(id: string): Promise<boolean> {
  const collection = await getCollection<TransferVehicle>(TRANSFER_VEHICLES_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// --- Transfer Vehicle Search ---

export interface TransferVehicleSearchFilters {
  city?: string;
  country?: string;
  category?: TransferVehicleCategory;
  minPassengers?: number;
  minLuggage?: number;
  features?: string[];
  maxPrice?: number;
  pickupDate?: string;
  pickupTime?: string;
}

export async function searchTransferVehicles(
  filters: TransferVehicleSearchFilters
): Promise<TransferVehicle[]> {
  const collection = await getCollection<TransferVehicle>(TRANSFER_VEHICLES_COLLECTION);

  const query: any = { status: 'available' };

  if (filters.city) {
    query['location.city'] = new RegExp(filters.city, 'i');
  }

  if (filters.country) {
    query['location.country'] = new RegExp(filters.country, 'i');
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.minPassengers) {
    query['capacity.passengers'] = { $gte: filters.minPassengers };
  }

  if (filters.minLuggage) {
    query['capacity.luggage'] = { $gte: filters.minLuggage };
  }

  if (filters.features && filters.features.length > 0) {
    query.features = { $all: filters.features };
  }

  if (filters.maxPrice) {
    query['pricing.basePrice'] = { $lte: filters.maxPrice };
  }

  const docs = await collection.find(query).toArray();
  let vehicles = docs.map(docToTransferVehicle).filter((v): v is TransferVehicle => v !== null);

  // Check availability if date/time provided
  if (filters.pickupDate && filters.pickupTime) {
    const availableVehicles = await Promise.all(
      vehicles.map(async (vehicle) => {
        const isAvailable = await checkTransferVehicleAvailability(
          vehicle.id,
          filters.pickupDate!,
          filters.pickupTime!
        );
        return isAvailable.available ? vehicle : null;
      })
    );
    vehicles = availableVehicles.filter((v): v is TransferVehicle => v !== null);
  }

  return vehicles;
}

// --- Transfer Booking Operations ---

export async function createTransferBooking(
  bookingData: Omit<TransferBooking, 'id' | '_id' | 'createdAt' | 'updatedAt'>
): Promise<TransferBooking> {
  const collection = await getCollection<Omit<TransferBooking, 'id'>>(TRANSFER_BOOKINGS_COLLECTION);

  const now = new Date().toISOString();
  const docToInsert = {
    ...bookingData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);

  // Increment vehicle's total transfers
  const vehiclesCollection = await getCollection<TransferVehicle>(TRANSFER_VEHICLES_COLLECTION);
  await vehiclesCollection.updateOne(
    { _id: new ObjectId(bookingData.vehicleId) },
    { $inc: { totalTransfers: 1 } }
  );

  return docToTransferBooking({ _id: result.insertedId, ...docToInsert })!;
}

export async function getTransferBookingById(id: string): Promise<TransferBooking | null> {
  const collection = await getCollection<TransferBooking>(TRANSFER_BOOKINGS_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return docToTransferBooking(doc);
}

export async function getTransferBookingsByUserId(userId: string): Promise<TransferBooking[]> {
  const collection = await getCollection<TransferBooking>(TRANSFER_BOOKINGS_COLLECTION);
  const docs = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  return docs.map(docToTransferBooking).filter((b): b is TransferBooking => b !== null);
}

export async function getTransferBookingsByVehicleId(vehicleId: string): Promise<TransferBooking[]> {
  const collection = await getCollection<TransferBooking>(TRANSFER_BOOKINGS_COLLECTION);
  const docs = await collection.find({ vehicleId }).sort({ createdAt: -1 }).toArray();
  return docs.map(docToTransferBooking).filter((b): b is TransferBooking => b !== null);
}

export async function updateTransferBooking(
  id: string,
  updates: Partial<Omit<TransferBooking, 'id' | '_id' | 'createdAt' | 'userId' | 'vehicleId'>>
): Promise<TransferBooking | null> {
  const collection = await getCollection<TransferBooking>(TRANSFER_BOOKINGS_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    },
    { returnDocument: 'after' }
  );

  return docToTransferBooking(result);
}

// Check transfer vehicle availability
export async function checkTransferVehicleAvailability(
  vehicleId: string,
  pickupDate: string,
  pickupTime: string
): Promise<{ available: boolean }> {
  const vehicle = await getTransferVehicleById(vehicleId);
  if (!vehicle || vehicle.status !== 'available') {
    return { available: false };
  }

  const bookingsCollection = await getCollection<TransferBooking>(TRANSFER_BOOKINGS_COLLECTION);

  // Create datetime for comparison (assuming 3-hour buffer for each transfer)
  const requestedDateTime = new Date(`${pickupDate}T${pickupTime}`);
  const bufferHours = 3;
  const startBuffer = new Date(requestedDateTime.getTime() - bufferHours * 60 * 60 * 1000);
  const endBuffer = new Date(requestedDateTime.getTime() + bufferHours * 60 * 60 * 1000);

  // Find overlapping bookings
  const overlappingBookings = await bookingsCollection.find({
    vehicleId,
    status: { $in: ['confirmed', 'assigned', 'in_progress'] },
    pickupDate: pickupDate,
  }).toArray();

  // Check if any booking conflicts with the requested time
  for (const booking of overlappingBookings) {
    const bookingDateTime = new Date(`${booking.pickupDate}T${booking.pickupTime}`);
    if (bookingDateTime >= startBuffer && bookingDateTime <= endBuffer) {
      return { available: false };
    }
  }

  return { available: true };
}

