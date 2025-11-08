"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Crown, Gem, Award } from 'lucide-react';
import type { LoyaltyAccount } from '@/lib/loyalty-data';

interface LoyaltyCardProps {
  account: LoyaltyAccount;
}

const TIER_ICONS = {
  bronze: Award,
  silver: Star,
  gold: Trophy,
  platinum: Crown,
  diamond: Gem,
};

const TIER_COLORS = {
  bronze: 'text-orange-600 bg-orange-100',
  silver: 'text-gray-600 bg-gray-100',
  gold: 'text-yellow-600 bg-yellow-100',
  platinum: 'text-purple-600 bg-purple-100',
  diamond: 'text-blue-600 bg-blue-100',
};

const TIER_GRADIENTS = {
  bronze: 'from-orange-500 to-orange-700',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-500 to-yellow-700',
  platinum: 'from-purple-500 to-purple-700',
  diamond: 'from-blue-500 to-blue-700',
};

export function LoyaltyCard({ account }: LoyaltyCardProps) {
  const TierIcon = TIER_ICONS[account.tier];
  const tierColor = TIER_COLORS[account.tier];
  const tierGradient = TIER_GRADIENTS[account.tier];

  const progressPercentage = account.nextTierThreshold
    ? (account.tierProgress / (account.nextTierThreshold - (account.lifetimePoints - account.tierProgress))) * 100
    : 100;

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${tierGradient}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${tierColor}`}>
              <TierIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl capitalize">{account.tier} Member</CardTitle>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(account.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {account.points.toLocaleString()} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Available Points</p>
            <p className="text-2xl font-bold">{account.points.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Lifetime Points</p>
            <p className="text-2xl font-bold">{account.lifetimePoints.toLocaleString()}</p>
          </div>
        </div>

        {/* Tier Progress */}
        {account.nextTier && account.nextTierThreshold && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to {account.nextTier}</span>
              <span className="font-medium">
                {account.tierProgress.toLocaleString()} / {account.nextTierThreshold.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {(account.nextTierThreshold - account.lifetimePoints).toLocaleString()} points to next tier
            </p>
          </div>
        )}

        {/* Referral Code */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Your Referral Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-background rounded border text-lg font-mono">
              {account.referralCode}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(account.referralCode);
              }}
              className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this code with friends and earn 500 points when they sign up!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

