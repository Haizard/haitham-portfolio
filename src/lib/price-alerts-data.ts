import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PriceAlertSearchCriteria {
  // For hotels
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  // For cars
  pickupDate?: string;
  returnDate?: string;
  // For tours
  tourDate?: string;
  participants?: number;
  // For flights
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
}

export interface PriceHistory {
  price: number;
  timestamp: string;
}

export interface PriceAlert {
  _id?: ObjectId;
  id?: string;
  userId: string;
  alertType: 'property' | 'vehicle' | 'tour' | 'transfer' | 'flight';
  targetId: string; // Property ID, Vehicle ID, Tour ID, etc.
  targetName?: string; // Cached name for display
  targetPrice: number;
  currency: string;
  searchCriteria: PriceAlertSearchCriteria;
  currentPrice?: number;
  lowestPrice?: number;
  highestPrice?: number;
  priceHistory: PriceHistory[];
  alertTriggered: boolean;
  triggeredAt?: string;
  notificationsSent: number;
  isActive: boolean;
  expiresAt: string; // Auto-expire after 30 days
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PRICE ALERT OPERATIONS
// ============================================================================

/**
 * Create a new price alert
 */
export async function createPriceAlert(
  userId: string,
  alertData: {
    alertType: PriceAlert['alertType'];
    targetId: string;
    targetName?: string;
    targetPrice: number;
    currency?: string;
    searchCriteria: PriceAlertSearchCriteria;
    currentPrice?: number;
  }
): Promise<PriceAlert> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const priceAlerts = db.collection<PriceAlert>('price_alerts');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const priceHistory: PriceHistory[] = alertData.currentPrice
    ? [{ price: alertData.currentPrice, timestamp: now.toISOString() }]
    : [];

  const priceAlert: PriceAlert = {
    userId,
    alertType: alertData.alertType,
    targetId: alertData.targetId,
    targetName: alertData.targetName,
    targetPrice: alertData.targetPrice,
    currency: alertData.currency || 'USD',
    searchCriteria: alertData.searchCriteria,
    currentPrice: alertData.currentPrice,
    lowestPrice: alertData.currentPrice,
    highestPrice: alertData.currentPrice,
    priceHistory,
    alertTriggered: alertData.currentPrice
      ? alertData.currentPrice <= alertData.targetPrice
      : false,
    triggeredAt: undefined,
    notificationsSent: 0,
    isActive: true,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const result = await priceAlerts.insertOne(priceAlert);
  priceAlert._id = result.insertedId;
  priceAlert.id = result.insertedId.toString();

  return priceAlert;
}

/**
 * Get user's price alerts
 */
export async function getUserPriceAlerts(
  userId: string,
  filters: {
    alertType?: PriceAlert['alertType'];
    isActive?: boolean;
  } = {}
): Promise<PriceAlert[]> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const priceAlerts = db.collection<PriceAlert>('price_alerts');

  const query: any = { userId };
  if (filters.alertType) {
    query.alertType = filters.alertType;
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const results = await priceAlerts
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return results.map((alert) => ({
    ...alert,
    id: alert._id.toString(),
  }));
}

/**
 * Get price alert by ID
 */
export async function getPriceAlertById(
  alertId: string,
  userId?: string
): Promise<PriceAlert | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const priceAlerts = db.collection<PriceAlert>('price_alerts');

  const query: any = { _id: new ObjectId(alertId) };
  if (userId) {
    query.userId = userId;
  }

  const alert = await priceAlerts.findOne(query);
  if (!alert) return null;

  return {
    ...alert,
    id: alert._id.toString(),
  };
}

/**
 * Update price alert with new price
 */
export async function updatePriceAlertPrice(
  alertId: string,
  newPrice: number
): Promise<PriceAlert | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const priceAlerts = db.collection<PriceAlert>('price_alerts');

  const alert = await priceAlerts.findOne({ _id: new ObjectId(alertId) });
  if (!alert) return null;

  const now = new Date().toISOString();

  // Add to price history (keep last 30 entries)
  const priceHistory = [...alert.priceHistory, { price: newPrice, timestamp: now }];
  if (priceHistory.length > 30) {
    priceHistory.shift();
  }

  // Calculate lowest and highest prices
  const allPrices = priceHistory.map((p) => p.price);
  const lowestPrice = Math.min(...allPrices);
  const highestPrice = Math.max(...allPrices);

  // Check if alert should be triggered
  const alertTriggered = newPrice <= alert.targetPrice;
  const triggeredAt = alertTriggered && !alert.alertTriggered ? now : alert.triggeredAt;

  const result = await priceAlerts.findOneAndUpdate(
    { _id: new ObjectId(alertId) },
    {
      $set: {
        currentPrice: newPrice,
        lowestPrice,
        highestPrice,
        priceHistory,
        alertTriggered,
        triggeredAt,
        updatedAt: now,
      },
    },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    ...result,
    id: result._id.toString(),
  };
}

/**
 * Update price alert settings
 */
export async function updatePriceAlert(
  alertId: string,
  userId: string,
  updates: {
    targetPrice?: number;
    isActive?: boolean;
  }
): Promise<PriceAlert | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const priceAlerts = db.collection<PriceAlert>('price_alerts');

  const updateData: any = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const result = await priceAlerts.findOneAndUpdate(
    { _id: new ObjectId(alertId), userId },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    ...result,
    id: result._id.toString(),
  };
}

/**
 * Delete price alert
 */
export async function deletePriceAlert(
  alertId: string,
  userId: string
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const priceAlerts = db.collection<PriceAlert>('price_alerts');

  const result = await priceAlerts.deleteOne({
    _id: new ObjectId(alertId),
    userId,
  });

  return result.deletedCount > 0;
}

/**
 * Increment notification sent count
 */
export async function incrementNotificationsSent(
  alertId: string
): Promise<void> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const priceAlerts = db.collection<PriceAlert>('price_alerts');

  await priceAlerts.updateOne(
    { _id: new ObjectId(alertId) },
    {
      $inc: { notificationsSent: 1 },
      $set: { updatedAt: new Date().toISOString() },
    }
  );
}

/**
 * Get expired price alerts
 */
export async function getExpiredPriceAlerts(): Promise<PriceAlert[]> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const priceAlerts = db.collection<PriceAlert>('price_alerts');

  const now = new Date().toISOString();

  const results = await priceAlerts
    .find({
      expiresAt: { $lt: now },
      isActive: true,
    })
    .toArray();

  return results.map((alert) => ({
    ...alert,
    id: alert._id.toString(),
  }));
}

/**
 * Deactivate expired price alerts
 */
export async function deactivateExpiredPriceAlerts(): Promise<number> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const priceAlerts = db.collection<PriceAlert>('price_alerts');

  const now = new Date().toISOString();

  const result = await priceAlerts.updateMany(
    {
      expiresAt: { $lt: now },
      isActive: true,
    },
    {
      $set: {
        isActive: false,
        updatedAt: now,
      },
    }
  );

  return result.modifiedCount;
}

