import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

// ============================================================================
// INTERFACES
// ============================================================================

export interface LoyaltyAccount {
  _id?: ObjectId;
  id?: string;
  userId: string;
  points: number;
  lifetimePoints: number; // Total points earned ever
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  tierProgress: number; // Points towards next tier
  nextTier?: 'silver' | 'gold' | 'platinum' | 'diamond';
  nextTierThreshold?: number;
  referralCode: string; // Unique code for referring others
  referredBy?: string; // User ID who referred this user
  createdAt: string;
  updatedAt: string;
}

export interface PointsTransaction {
  _id?: ObjectId;
  id?: string;
  userId: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus' | 'refund';
  amount: number; // Positive for earn, negative for redeem
  reason: string;
  relatedBookingId?: string;
  relatedRewardId?: string;
  expiresAt?: string; // Points expire after 12 months
  createdAt: string;
}

export interface Reward {
  _id?: ObjectId;
  id?: string;
  name: string;
  description: string;
  pointsCost: number;
  rewardType: 'discount' | 'upgrade' | 'freebie' | 'voucher';
  discountType?: 'percentage' | 'fixed'; // For discount rewards
  discountValue?: number; // 10 for 10% or $10
  applicableTo: Array<'property' | 'vehicle' | 'tour' | 'transfer' | 'flight'>;
  minBookingValue?: number; // Minimum booking value to use reward
  maxRedemptions?: number; // Limit per user
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  termsAndConditions?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RewardRedemption {
  _id?: ObjectId;
  id?: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'active' | 'used' | 'expired' | 'cancelled';
  voucherCode?: string; // Generated code for voucher rewards
  usedAt?: string;
  usedInBookingId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
  diamond: 50000,
};

export const TIER_BENEFITS = {
  bronze: {
    pointsMultiplier: 1,
    bonusPoints: 0,
    prioritySupport: false,
    freeUpgrades: false,
    earlyAccess: false,
  },
  silver: {
    pointsMultiplier: 1.25,
    bonusPoints: 500,
    prioritySupport: false,
    freeUpgrades: false,
    earlyAccess: false,
  },
  gold: {
    pointsMultiplier: 1.5,
    bonusPoints: 1000,
    prioritySupport: true,
    freeUpgrades: true,
    earlyAccess: false,
  },
  platinum: {
    pointsMultiplier: 1.75,
    bonusPoints: 2500,
    prioritySupport: true,
    freeUpgrades: true,
    earlyAccess: true,
  },
  diamond: {
    pointsMultiplier: 2,
    bonusPoints: 5000,
    prioritySupport: true,
    freeUpgrades: true,
    earlyAccess: true,
  },
};

// ============================================================================
// POINTS EARNING RULES
// ============================================================================

export const POINTS_EARNING_RULES = {
  property: 10, // 10 points per $1 spent
  vehicle: 8, // 8 points per $1 spent
  tour: 12, // 12 points per $1 spent
  transfer: 6, // 6 points per $1 spent
  flight: 5, // 5 points per $1 spent
  referral: 500, // Bonus for referring a friend
  signup: 100, // Welcome bonus
  firstBooking: 200, // First booking bonus
  review: 50, // Points for leaving a review
  birthday: 100, // Birthday bonus
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateTier(lifetimePoints: number): {
  tier: LoyaltyAccount['tier'];
  tierProgress: number;
  nextTier?: LoyaltyAccount['nextTier'];
  nextTierThreshold?: number;
} {
  if (lifetimePoints >= TIER_THRESHOLDS.diamond) {
    return {
      tier: 'diamond',
      tierProgress: lifetimePoints - TIER_THRESHOLDS.diamond,
      nextTier: undefined,
      nextTierThreshold: undefined,
    };
  } else if (lifetimePoints >= TIER_THRESHOLDS.platinum) {
    return {
      tier: 'platinum',
      tierProgress: lifetimePoints - TIER_THRESHOLDS.platinum,
      nextTier: 'diamond',
      nextTierThreshold: TIER_THRESHOLDS.diamond,
    };
  } else if (lifetimePoints >= TIER_THRESHOLDS.gold) {
    return {
      tier: 'gold',
      tierProgress: lifetimePoints - TIER_THRESHOLDS.gold,
      nextTier: 'platinum',
      nextTierThreshold: TIER_THRESHOLDS.platinum,
    };
  } else if (lifetimePoints >= TIER_THRESHOLDS.silver) {
    return {
      tier: 'silver',
      tierProgress: lifetimePoints - TIER_THRESHOLDS.silver,
      nextTier: 'gold',
      nextTierThreshold: TIER_THRESHOLDS.gold,
    };
  } else {
    return {
      tier: 'bronze',
      tierProgress: lifetimePoints,
      nextTier: 'silver',
      nextTierThreshold: TIER_THRESHOLDS.silver,
    };
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REWARD-';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================================================
// LOYALTY ACCOUNT OPERATIONS
// ============================================================================

export async function getLoyaltyAccount(userId: string): Promise<LoyaltyAccount | null> {
  const client = await clientPromise;
  const db = client.db();
  
  const account = await db.collection('loyaltyAccounts').findOne({ userId });
  
  if (!account) return null;
  
  return {
    ...account,
    id: account._id.toString(),
  } as LoyaltyAccount;
}

export async function createLoyaltyAccount(
  userId: string,
  referredBy?: string
): Promise<LoyaltyAccount> {
  const client = await clientPromise;
  const db = client.db();
  
  const referralCode = generateReferralCode();
  const now = new Date().toISOString();
  
  const account: Omit<LoyaltyAccount, 'id'> = {
    userId,
    points: POINTS_EARNING_RULES.signup,
    lifetimePoints: POINTS_EARNING_RULES.signup,
    tier: 'bronze',
    tierProgress: POINTS_EARNING_RULES.signup,
    nextTier: 'silver',
    nextTierThreshold: TIER_THRESHOLDS.silver,
    referralCode,
    referredBy,
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await db.collection('loyaltyAccounts').insertOne(account);
  
  // Create signup bonus transaction
  await addPointsTransaction({
    userId,
    type: 'earn',
    amount: POINTS_EARNING_RULES.signup,
    reason: 'Welcome bonus',
  });
  
  // If referred, give bonus to referrer
  if (referredBy) {
    await addPointsTransaction({
      userId: referredBy,
      type: 'bonus',
      amount: POINTS_EARNING_RULES.referral,
      reason: 'Referral bonus',
    });
  }
  
  return {
    ...account,
    id: result.insertedId.toString(),
  };
}

export async function updateLoyaltyPoints(
  userId: string,
  pointsChange: number
): Promise<LoyaltyAccount> {
  const client = await clientPromise;
  const db = client.db();
  
  const account = await getLoyaltyAccount(userId);
  if (!account) {
    throw new Error('Loyalty account not found');
  }
  
  const newPoints = account.points + pointsChange;
  const newLifetimePoints = pointsChange > 0 
    ? account.lifetimePoints + pointsChange 
    : account.lifetimePoints;
  
  const tierInfo = calculateTier(newLifetimePoints);
  
  await db.collection('loyaltyAccounts').updateOne(
    { userId },
    {
      $set: {
        points: newPoints,
        lifetimePoints: newLifetimePoints,
        tier: tierInfo.tier,
        tierProgress: tierInfo.tierProgress,
        nextTier: tierInfo.nextTier,
        nextTierThreshold: tierInfo.nextTierThreshold,
        updatedAt: new Date().toISOString(),
      },
    }
  );
  
  return {
    ...account,
    points: newPoints,
    lifetimePoints: newLifetimePoints,
    tier: tierInfo.tier,
    tierProgress: tierInfo.tierProgress,
    nextTier: tierInfo.nextTier,
    nextTierThreshold: tierInfo.nextTierThreshold,
  };
}

// ============================================================================
// POINTS TRANSACTION OPERATIONS
// ============================================================================

export async function addPointsTransaction(data: {
  userId: string;
  type: PointsTransaction['type'];
  amount: number;
  reason: string;
  relatedBookingId?: string;
  relatedRewardId?: string;
}): Promise<PointsTransaction> {
  const client = await clientPromise;
  const db = client.db();

  const now = new Date().toISOString();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 12); // Points expire in 12 months

  const transaction: Omit<PointsTransaction, 'id'> = {
    ...data,
    expiresAt: expiresAt.toISOString(),
    createdAt: now,
  };

  const result = await db.collection('pointsTransactions').insertOne(transaction);

  // Update loyalty account points
  await updateLoyaltyPoints(data.userId, data.amount);

  return {
    ...transaction,
    id: result.insertedId.toString(),
  };
}

export async function getPointsTransactions(
  userId: string,
  filters?: {
    type?: PointsTransaction['type'];
    limit?: number;
  }
): Promise<PointsTransaction[]> {
  const client = await clientPromise;
  const db = client.db();

  const query: any = { userId };
  if (filters?.type) {
    query.type = filters.type;
  }

  const transactions = await db
    .collection('pointsTransactions')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(filters?.limit || 50)
    .toArray();

  return transactions.map((t) => ({
    ...t,
    id: t._id.toString(),
  })) as PointsTransaction[];
}

// ============================================================================
// REWARD OPERATIONS
// ============================================================================

export async function getRewards(filters?: {
  isActive?: boolean;
  applicableTo?: string;
}): Promise<Reward[]> {
  const client = await clientPromise;
  const db = client.db();

  const query: any = {};
  if (filters?.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  if (filters?.applicableTo) {
    query.applicableTo = filters.applicableTo;
  }

  const now = new Date().toISOString();
  query.validFrom = { $lte: now };
  query.validUntil = { $gte: now };

  const rewards = await db
    .collection('rewards')
    .find(query)
    .sort({ pointsCost: 1 })
    .toArray();

  return rewards.map((r) => ({
    ...r,
    id: r._id.toString(),
  })) as Reward[];
}

export async function getRewardById(rewardId: string): Promise<Reward | null> {
  const client = await clientPromise;
  const db = client.db();

  const reward = await db.collection('rewards').findOne({ _id: new ObjectId(rewardId) });

  if (!reward) return null;

  return {
    ...reward,
    id: reward._id.toString(),
  } as Reward;
}

export async function createReward(data: Omit<Reward, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reward> {
  const client = await clientPromise;
  const db = client.db();

  const now = new Date().toISOString();

  const reward: Omit<Reward, 'id'> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('rewards').insertOne(reward);

  return {
    ...reward,
    id: result.insertedId.toString(),
  };
}

// ============================================================================
// REWARD REDEMPTION OPERATIONS
// ============================================================================

export async function redeemReward(
  userId: string,
  rewardId: string
): Promise<RewardRedemption> {
  const client = await clientPromise;
  const db = client.db();

  // Get reward details
  const reward = await getRewardById(rewardId);
  if (!reward) {
    throw new Error('Reward not found');
  }

  if (!reward.isActive) {
    throw new Error('Reward is not active');
  }

  // Check if user has enough points
  const account = await getLoyaltyAccount(userId);
  if (!account) {
    throw new Error('Loyalty account not found');
  }

  if (account.points < reward.pointsCost) {
    throw new Error('Insufficient points');
  }

  // Check max redemptions
  if (reward.maxRedemptions) {
    const existingRedemptions = await db
      .collection('rewardRedemptions')
      .countDocuments({ userId, rewardId, status: { $in: ['active', 'used'] } });

    if (existingRedemptions >= reward.maxRedemptions) {
      throw new Error('Maximum redemptions reached for this reward');
    }
  }

  const now = new Date().toISOString();
  const expiresAt = new Date(reward.validUntil);

  const redemption: Omit<RewardRedemption, 'id'> = {
    userId,
    rewardId,
    pointsSpent: reward.pointsCost,
    status: 'active',
    voucherCode: reward.rewardType === 'voucher' ? generateVoucherCode() : undefined,
    expiresAt: expiresAt.toISOString(),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('rewardRedemptions').insertOne(redemption);

  // Deduct points
  await addPointsTransaction({
    userId,
    type: 'redeem',
    amount: -reward.pointsCost,
    reason: `Redeemed: ${reward.name}`,
    relatedRewardId: rewardId,
  });

  return {
    ...redemption,
    id: result.insertedId.toString(),
  };
}

export async function getUserRedemptions(
  userId: string,
  filters?: {
    status?: RewardRedemption['status'];
  }
): Promise<RewardRedemption[]> {
  const client = await clientPromise;
  const db = client.db();

  const query: any = { userId };
  if (filters?.status) {
    query.status = filters.status;
  }

  const redemptions = await db
    .collection('rewardRedemptions')
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return redemptions.map((r) => ({
    ...r,
    id: r._id.toString(),
  })) as RewardRedemption[];
}

export async function useRedemption(
  redemptionId: string,
  bookingId: string
): Promise<RewardRedemption> {
  const client = await clientPromise;
  const db = client.db();

  const now = new Date().toISOString();

  await db.collection('rewardRedemptions').updateOne(
    { _id: new ObjectId(redemptionId) },
    {
      $set: {
        status: 'used',
        usedAt: now,
        usedInBookingId: bookingId,
        updatedAt: now,
      },
    }
  );

  const redemption = await db.collection('rewardRedemptions').findOne({ _id: new ObjectId(redemptionId) });

  return {
    ...redemption,
    id: redemption!._id.toString(),
  } as RewardRedemption;
}

