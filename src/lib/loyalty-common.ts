import type { ObjectId } from 'mongodb';

// ============================================================================
// INTERFACES
// ============================================================================

export interface LoyaltyAccount {
    _id?: ObjectId | string;
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
    _id?: ObjectId | string;
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
    _id?: ObjectId | string;
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
    _id?: ObjectId | string;
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
