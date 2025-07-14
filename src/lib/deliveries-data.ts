
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const DELIVERIES_COLLECTION = 'deliveries';

export type DeliveryStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';

// This is the main document for a delivery task
export interface Delivery {
  _id?: ObjectId;
  id?: string;
  orderId: string; // The order this delivery is for
  vendorId: string; // The vendor who needs the item picked up
  
  // These could be enriched with full address objects later
  pickupAddress: string; // Will be fetched from vendor profile
  deliveryAddress: string; // From the order's customer details

  customerName: string;

  assignedAgentId?: string | null; // The delivery_agent user who accepted the task
  status: DeliveryStatus;

  // Timestamps
  createdAt: string;
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;

  // Financials
  deliveryFee: number; // The amount the customer paid for delivery
  agentPayout: number; // The amount the delivery agent earns from the fee
}

function docToDelivery(doc: any): Delivery {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Delivery;
}

// Function to create a new delivery task when an order is placed
export async function createDelivery(
  deliveryData: Pick<Delivery, 'orderId' | 'vendorId' | 'customerName' | 'deliveryAddress'>
): Promise<Delivery> {
  const collection = await getCollection<Omit<Delivery, 'id' | '_id'>>(DELIVERIES_COLLECTION);
  
  // TODO: In a real app, fetch the vendor's actual address from their profile.
  const mockPickupAddress = "100 Vendor Way, Commerce City"; 
  const deliveryFee = 5.00; // This could be dynamic later
  const agentPayout = 4.00; // Example payout (platform takes a cut)
  
  const now = new Date().toISOString();

  const docToInsert = {
    ...deliveryData,
    pickupAddress: mockPickupAddress,
    status: 'pending' as DeliveryStatus,
    deliveryFee: deliveryFee,
    agentPayout: agentPayout,
    createdAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  
  return { id: result.insertedId.toString(), ...docToInsert };
}

// Function for a delivery agent to see available jobs
export async function getAvailableDeliveries(maxDistance?: number, location?: any): Promise<Delivery[]> {
  const collection = await getCollection<Delivery>(DELIVERIES_COLLECTION);
  // For now, just gets all pending deliveries. Later, this would incorporate location-based filtering.
  const deliveryDocs = await collection.find({ status: 'pending' }).sort({ createdAt: 1 }).toArray();
  return deliveryDocs.map(docToDelivery);
}

// Function for an agent to accept a delivery
export async function acceptDelivery(deliveryId: string, agentId: string): Promise<Delivery | null> {
    if (!ObjectId.isValid(deliveryId)) return null;

    const collection = await getCollection<Delivery>(DELIVERIES_COLLECTION);
    const result = await collection.findOneAndUpdate(
        // Ensure we only accept a delivery that is currently pending to prevent race conditions
        { _id: new ObjectId(deliveryId), status: 'pending' },
        { 
            $set: { 
                status: 'accepted',
                assignedAgentId: agentId,
                acceptedAt: new Date().toISOString(),
            } 
        },
        { returnDocument: 'after' }
    );
    
    return result ? docToDelivery(result) : null;
}

// Function to update the status of an ongoing delivery
export async function updateDeliveryStatus(deliveryId: string, status: 'in_transit' | 'delivered' | 'cancelled'): Promise<Delivery | null> {
    if (!ObjectId.isValid(deliveryId)) return null;

    const collection = await getCollection<Delivery>(DELIVERIES_COLLECTION);
    
    const updatePayload: any = { status };
    if (status === 'in_transit') updatePayload.pickedUpAt = new Date().toISOString();
    if (status === 'delivered') updatePayload.deliveredAt = new Date().toISOString();

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(deliveryId) },
        { $set: updatePayload },
        { returnDocument: 'after' }
    );
    
    return result ? docToDelivery(result) : null;
}
