import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const VEHICLES_COLLECTION = 'vehicles';
const CAR_RENTALS_COLLECTION = 'car_rentals';

// --- Type Definitions ---

export type VehicleCategory = 'economy' | 'compact' | 'midsize' | 'fullsize' | 'suv' | 'luxury' | 'van';
export type TransmissionType = 'automatic' | 'manual';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'inactive';
export type CarRentalStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface VehicleImage {
  url: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
}

export interface VehicleLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  pickupInstructions?: string;
}

export interface VehiclePricing {
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  currency: string;
  deposit: number;
  mileageLimit?: number; // km per day
  extraMileageFee?: number; // per km
  insuranceFee?: number; // per day
}

export interface Vehicle {
  _id?: ObjectId;
  id?: string;
  ownerId: string; // ref: Users
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: TransmissionType;
  fuelType: FuelType;
  seats: number;
  doors: number;
  luggage: number; // Number of large bags
  color: string;
  licensePlate: string;
  vin?: string;
  images: VehicleImage[];
  features: string[]; // ['gps', 'bluetooth', 'backup_camera', 'sunroof', 'child_seat']
  location: VehicleLocation;
  pricing: VehiclePricing;
  status: VehicleStatus;
  averageRating?: number;
  reviewCount?: number;
  totalRentals: number;
  createdAt: string;
  updatedAt: string;
}

export interface DriverInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  dateOfBirth: string;
}

export interface CarRental {
  _id?: ObjectId;
  id?: string;
  vehicleId: string; // ref: Vehicles
  userId: string; // ref: Users
  driverInfo: DriverInfo;
  pickupDate: string; // ISO date string
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  numberOfDays: number;
  pickupLocation: string; // Can be different from vehicle's default location
  returnLocation: string;
  pricing: {
    dailyRate: number;
    totalDays: number;
    subtotal: number;
    insuranceFee: number;
    deposit: number;
    totalPrice: number;
    currency: string;
  };
  paymentInfo: {
    paymentIntentId: string;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paidAt?: string;
    depositRefunded?: boolean;
    depositRefundedAt?: string;
  };
  status: CarRentalStatus;
  additionalDrivers?: DriverInfo[];
  specialRequests?: string;
  mileageStart?: number;
  mileageEnd?: number;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Helper Functions ---

function docToVehicle(doc: any): Vehicle {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Vehicle;
}

function docToCarRental(doc: any): CarRental {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as CarRental;
}

// --- Vehicle CRUD Operations ---

export async function createVehicle(vehicleData: Omit<Vehicle, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'reviewCount' | 'totalRentals'>): Promise<Vehicle> {
  const collection = await getCollection<Omit<Vehicle, 'id'>>(VEHICLES_COLLECTION);
  
  const now = new Date().toISOString();
  const docToInsert = {
    ...vehicleData,
    averageRating: 0,
    reviewCount: 0,
    totalRentals: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  return docToVehicle({ _id: result.insertedId, ...docToInsert });
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const collection = await getCollection<Vehicle>(VEHICLES_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return docToVehicle(doc);
}

export async function getVehiclesByOwnerId(ownerId: string): Promise<Vehicle[]> {
  const collection = await getCollection<Vehicle>(VEHICLES_COLLECTION);
  const docs = await collection.find({ ownerId }).toArray();
  return docs.map(docToVehicle);
}

export async function updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
  const collection = await getCollection<Vehicle>(VEHICLES_COLLECTION);
  
  const updateDoc = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: 'after' }
  );

  return docToVehicle(result);
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const collection = await getCollection<Vehicle>(VEHICLES_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// --- Car Rental Operations ---

export async function createCarRental(rentalData: Omit<CarRental, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<CarRental> {
  const collection = await getCollection<Omit<CarRental, 'id'>>(CAR_RENTALS_COLLECTION);
  
  const now = new Date().toISOString();
  const docToInsert = {
    ...rentalData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  return docToCarRental({ _id: result.insertedId, ...docToInsert });
}

export async function getCarRentalById(id: string): Promise<CarRental | null> {
  const collection = await getCollection<CarRental>(CAR_RENTALS_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return docToCarRental(doc);
}

export async function getCarRentalsByUserId(userId: string): Promise<CarRental[]> {
  const collection = await getCollection<CarRental>(CAR_RENTALS_COLLECTION);
  const docs = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  return docs.map(docToCarRental);
}

export async function getCarRentalsByVehicleId(vehicleId: string): Promise<CarRental[]> {
  const collection = await getCollection<CarRental>(CAR_RENTALS_COLLECTION);
  const docs = await collection.find({ vehicleId }).sort({ createdAt: -1 }).toArray();
  return docs.map(docToCarRental);
}

export async function updateCarRental(id: string, updates: Partial<CarRental>): Promise<CarRental | null> {
  const collection = await getCollection<CarRental>(CAR_RENTALS_COLLECTION);
  
  const updateDoc = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: 'after' }
  );

  return docToCarRental(result);
}

// Check vehicle availability for given dates
export async function checkVehicleAvailability(
  vehicleId: string,
  pickupDate: string,
  returnDate: string
): Promise<{ available: boolean }> {
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle || vehicle.status !== 'available') {
    return { available: false };
  }

  const rentalsCollection = await getCollection<CarRental>(CAR_RENTALS_COLLECTION);
  
  // Find overlapping rentals
  const overlappingRentals = await rentalsCollection.find({
    vehicleId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      {
        pickupDate: { $lt: returnDate },
        returnDate: { $gt: pickupDate }
      }
    ]
  }).toArray();

  return { available: overlappingRentals.length === 0 };
}

// Search vehicles with filters
export interface VehicleSearchFilters {
  city?: string;
  country?: string;
  pickupDate?: string;
  returnDate?: string;
  category?: VehicleCategory;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  minSeats?: number;
  features?: string[];
  minPrice?: number;
  maxPrice?: number;
  status?: VehicleStatus;
}

export async function searchVehicles(filters: VehicleSearchFilters): Promise<Vehicle[]> {
  const collection = await getCollection<Vehicle>(VEHICLES_COLLECTION);
  
  const query: Filter<Vehicle> = {};

  // Location filters
  if (filters.city) {
    query['location.city'] = new RegExp(filters.city, 'i');
  }
  if (filters.country) {
    query['location.country'] = new RegExp(filters.country, 'i');
  }

  // Vehicle specs
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.transmission) {
    query.transmission = filters.transmission;
  }
  if (filters.fuelType) {
    query.fuelType = filters.fuelType;
  }
  if (filters.minSeats) {
    query.seats = { $gte: filters.minSeats };
  }

  // Features filter
  if (filters.features && filters.features.length > 0) {
    query.features = { $all: filters.features };
  }

  // Price filter
  if (filters.minPrice) {
    query['pricing.dailyRate'] = { $gte: filters.minPrice };
  }
  if (filters.maxPrice) {
    query['pricing.dailyRate'] = { ...query['pricing.dailyRate'], $lte: filters.maxPrice };
  }

  // Status filter (default to available)
  query.status = filters.status || 'available';

  const vehicles = await collection.find(query).toArray();
  
  // If date filters are provided, filter by availability
  if (filters.pickupDate && filters.returnDate) {
    const availableVehicles: Vehicle[] = [];
    
    for (const vehicle of vehicles) {
      const { available } = await checkVehicleAvailability(
        vehicle._id!.toString(),
        filters.pickupDate,
        filters.returnDate
      );

      if (available) {
        availableVehicles.push(docToVehicle(vehicle));
      }
    }
    
    return availableVehicles;
  }

  return vehicles.map(docToVehicle);
}

