/**
 * Loyalty & Rewards Helper Functions
 * 
 * Helper functions for applying rewards, validating vouchers,
 * and calculating discounts during checkout.
 */

import {
  getRewardById,
  getRedemptionById,
  updateRedemption,
  type Reward,
  type RewardRedemption,
} from './loyalty-data';

export interface VoucherValidationResult {
  valid: boolean;
  error?: string;
  reward?: Reward;
  redemption?: RewardRedemption;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number; // Calculated discount amount
  };
}

/**
 * Validate a voucher code and calculate discount
 */
export async function validateVoucher(
  voucherCode: string,
  userId: string,
  bookingType: 'property' | 'vehicle' | 'tour' | 'transfer' | 'flight',
  totalAmount: number
): Promise<VoucherValidationResult> {
  try {
    // Find redemption by voucher code
    const clientPromise = (await import('@/lib/mongodb')).default;
    const client = await clientPromise;
    const db = client.db();

    const redemption = await db.collection('rewardRedemptions').findOne({
      voucherCode,
    });

    if (!redemption) {
      return {
        valid: false,
        error: 'Invalid voucher code',
      };
    }

    // Check if redemption belongs to user
    if (redemption.userId !== userId) {
      return {
        valid: false,
        error: 'This voucher does not belong to you',
      };
    }

    // Check if already used
    if (redemption.status === 'used') {
      return {
        valid: false,
        error: 'This voucher has already been used',
      };
    }

    // Check if expired
    if (redemption.expiresAt && new Date(redemption.expiresAt) < new Date()) {
      return {
        valid: false,
        error: 'This voucher has expired',
      };
    }

    // Get reward details
    const reward = await getRewardById(redemption.rewardId);
    if (!reward) {
      return {
        valid: false,
        error: 'Reward not found',
      };
    }

    // Check if reward is active
    if (!reward.active) {
      return {
        valid: false,
        error: 'This reward is no longer active',
      };
    }

    // Check if reward applies to this booking type
    if (reward.applicableTypes && reward.applicableTypes.length > 0) {
      if (!reward.applicableTypes.includes(bookingType)) {
        return {
          valid: false,
          error: `This voucher is not valid for ${bookingType} bookings`,
        };
      }
    }

    // Check minimum purchase requirement
    if (reward.minPurchase && totalAmount < reward.minPurchase) {
      return {
        valid: false,
        error: `Minimum purchase of $${reward.minPurchase} required`,
      };
    }

    // Calculate discount
    let discountAmount = 0;
    let discountType: 'percentage' | 'fixed' = 'fixed';

    if (reward.type === 'discount') {
      if (reward.discountType === 'percentage') {
        discountType = 'percentage';
        discountAmount = (totalAmount * reward.discountValue) / 100;
        
        // Apply max discount cap if exists
        if (reward.maxDiscount && discountAmount > reward.maxDiscount) {
          discountAmount = reward.maxDiscount;
        }
      } else {
        discountType = 'fixed';
        discountAmount = reward.discountValue;
      }
    } else if (reward.type === 'voucher') {
      // Voucher type rewards have a fixed value
      discountType = 'fixed';
      discountAmount = reward.value || 0;
    }

    // Ensure discount doesn't exceed total
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    return {
      valid: true,
      reward,
      redemption: {
        ...redemption,
        id: redemption._id.toString(),
      } as RewardRedemption,
      discount: {
        type: discountType,
        value: reward.discountValue || reward.value || 0,
        amount: discountAmount,
      },
    };
  } catch (error) {
    console.error('[VOUCHER] Validation error:', error);
    return {
      valid: false,
      error: 'Failed to validate voucher',
    };
  }
}

/**
 * Mark a voucher as used after successful payment
 */
export async function markVoucherAsUsed(
  voucherCode: string,
  bookingId: string
): Promise<boolean> {
  try {
    const clientPromise = (await import('@/lib/mongodb')).default;
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('rewardRedemptions').updateOne(
      { voucherCode },
      {
        $set: {
          status: 'used',
          usedAt: new Date().toISOString(),
          bookingId,
        },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('[VOUCHER] Error marking as used:', error);
    return false;
  }
}

/**
 * Calculate final price after applying discount
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  }
): {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  savings: number;
} {
  const discountAmount = Math.min(discount.amount, originalPrice);
  const finalPrice = Math.max(0, originalPrice - discountAmount);
  const savings = originalPrice - finalPrice;

  return {
    originalPrice,
    discountAmount,
    finalPrice,
    savings,
  };
}

/**
 * Format discount for display
 */
export function formatDiscount(discount: {
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}): string {
  if (discount.type === 'percentage') {
    return `${discount.value}% off (up to $${discount.amount.toFixed(2)})`;
  } else {
    return `$${discount.amount.toFixed(2)} off`;
  }
}

