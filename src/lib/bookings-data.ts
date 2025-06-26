
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import { getServiceById } from './services-data'; // Import to fetch service details

const BOOKINGS_COLLECTION = 'bookings';

export type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";

export interface Booking {
  _id?: ObjectId;
  id?: string;
  serviceId: string;
  freelancerId: string; // ID of the freelancer whose service was booked
  serviceName: string;
  clientName: string;
  clientEmail: string;
  requestedDateRaw: string; // Store as string directly from user input for now
  requestedTimeRaw: string; // Store as string directly from user input for now
  clientNotes?: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

function docToBooking(doc: any): Booking {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Booking;
}

export async function addBooking(bookingData: Omit<Booking, 'id' | '_id' | 'status' | 'createdAt' | 'updatedAt' | 'freelancerId'>): Promise<Booking> {
  const collection = await getCollection<Omit<Booking, 'id' | '_id'>>(BOOKINGS_COLLECTION);
  
  // Fetch the service to get the freelancerId
  const service = await getServiceById(bookingData.serviceId);
  if (!service) {
    throw new Error("Cannot create booking for a non-existent service.");
  }

  const now = new Date();
  const docToInsert = {
    ...bookingData,
    freelancerId: service.freelancerId, // Associate booking with the service owner
    status: "Pending" as BookingStatus,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  
  const newBooking: Booking = {
    _id: result.insertedId,
    id: result.insertedId.toString(),
    ...docToInsert
  };
  return newBooking;
}

export async function getAllBookings(freelancerId?: string): Promise<Booking[]> {
  const collection = await getCollection<Booking>(BOOKINGS_COLLECTION);
  const query: Filter<Booking> = {};
  if (freelancerId) {
    query.freelancerId = freelancerId;
  }
  const bookingDocs = await collection.find(query).sort({ createdAt: -1 }).toArray(); // Sort by newest first
  return bookingDocs.map(docToBooking);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (!ObjectId.isValid(id)) {
    console.warn(`getBookingById: Invalid ID format: ${id}`);
    return null;
  }
  const collection = await getCollection<Booking>(BOOKINGS_COLLECTION);
  const bookingDoc = await collection.findOne({ _id: new ObjectId(id) });
  return bookingDoc ? docToBooking(bookingDoc) : null;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
  if (!ObjectId.isValid(id)) {
    console.warn(`updateBookingStatus: Invalid ID format: ${id}`);
    return null;
  }
  const collection = await getCollection<Booking>(BOOKINGS_COLLECTION);
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status: status, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!result) {
    console.warn(`updateBookingStatus: Booking with ID '${id}' not found or update failed.`);
    return null;
  }
  return docToBooking(result);
}

export async function deleteBooking(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    console.warn(`deleteBooking: Invalid ID format: ${id}`);
    return false;
  }
  const collection = await getCollection<Booking>(BOOKINGS_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
