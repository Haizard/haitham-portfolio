
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { Order } from './orders-data'; // Import Order type

const PAYOUTS_COLLECTION = 'payouts';

export type PayoutStatus = 'pending' | 'completed' | 'failed';

export interface Payout {
  _id?: ObjectId;
  id?: string;
  vendorId: string;
  amount: number;
  status: PayoutStatus;
  requestedAt: Date;
  completedAt?: Date;
}

export interface VendorFinanceSummary {
  totalEarnings: number;
  totalPaidOut: number;
  pendingPayouts: number;
  availableBalance: number;
}


function docToPayout(doc: any): Payout {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Payout;
}

export async function getVendorFinanceSummary(vendorId: string): Promise<VendorFinanceSummary> {
  const ordersCollection = await getCollection<Order>(ORDERS_COLLECTION);
  const payoutsCollection = await getCollection<Payout>(PAYOUTS_COLLECTION);

  // Calculate total earnings from delivered items for a specific vendor
  const earningsPipeline = [
    { $match: { vendorId: vendorId } },
    { $unwind: "$lineItems" },
    { $match: { "lineItems.status": "Delivered" } },
    { $group: { _id: "$vendorId", totalEarnings: { $sum: "$lineItems.vendorEarnings" } } }
  ];
  const earningsResult = await ordersCollection.aggregate(earningsPipeline).toArray();
  const totalEarnings = earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;

  // Calculate total paid out and pending amounts from payouts for that vendor
  const payoutsPipeline = [
    { $match: { vendorId: vendorId } },
    { $group: { _id: "$status", totalAmount: { $sum: "$amount" } } }
  ];
  const payoutsResult = await payoutsCollection.aggregate(payoutsPipeline).toArray();
  const totalPaidOut = payoutsResult.find(p => p._id === 'completed')?.totalAmount || 0;
  const pendingPayouts = payoutsResult.find(p => p._id === 'pending')?.totalAmount || 0;

  const availableBalance = totalEarnings - totalPaidOut - pendingPayouts;

  return { 
    totalEarnings, 
    totalPaidOut, 
    pendingPayouts, 
    availableBalance: Math.max(0, availableBalance) // Ensure balance is not negative
  };
}

export async function getPayoutsForVendor(vendorId: string): Promise<Payout[]> {
  const collection = await getCollection<Payout>(PAYOUTS_COLLECTION);
  const payoutDocs = await collection.find({ vendorId }).sort({ requestedAt: -1 }).toArray();
  return payoutDocs.map(docToPayout);
}

export async function createPayoutRequest(vendorId: string, amount: number): Promise<Payout> {
  // Validate that the requested amount is valid
  if (amount <= 0) {
    throw new Error("Payout amount must be positive.");
  }

  const { availableBalance } = await getVendorFinanceSummary(vendorId);
  if (amount > availableBalance) {
    throw new Error(`Requested amount of $${amount.toFixed(2)} exceeds your available balance of $${availableBalance.toFixed(2)}.`);
  }

  const collection = await getCollection<Omit<Payout, 'id' | '_id'>>(PAYOUTS_COLLECTION);
  
  const docToInsert = {
    vendorId,
    amount,
    status: "pending" as PayoutStatus,
    requestedAt: new Date(),
  };

  const result = await collection.insertOne(docToInsert as any);
  return { _id: result.insertedId, id: result.insertedId.toString(), ...docToInsert };
}
