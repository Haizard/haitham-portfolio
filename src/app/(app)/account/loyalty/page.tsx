"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoyaltyCard } from '@/components/loyalty/loyalty-card';
import { TierBenefitsCard } from '@/components/loyalty/tier-benefits-card';
import { PointsHistory } from '@/components/loyalty/points-history';
import { RewardsCatalog } from '@/components/loyalty/rewards-catalog';
import { MyRedemptions } from '@/components/loyalty/my-redemptions';
import type { LoyaltyAccount } from '@/lib/loyalty-data';

export default function LoyaltyPage() {
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const response = await fetch('/api/loyalty/account');
      if (response.ok) {
        const data = await response.json();
        setAccount(data);
      }
    } catch (error) {
      console.error('Error fetching loyalty account:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load loyalty account</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Loyalty & Rewards</h1>
        <p className="text-muted-foreground">
          Earn points on every booking and redeem them for exclusive rewards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <LoyaltyCard account={account} />
        </div>
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border">
            <h3 className="font-semibold mb-4">How to Earn Points</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Book hotels: 10 points per $1</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Book tours: 12 points per $1</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Rent cars: 8 points per $1</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Book transfers: 6 points per $1</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Book flights: 5 points per $1</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Leave a review: 50 points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Refer a friend: 500 points</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="redemptions">My Redemptions</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
          <TabsTrigger value="benefits">Tier Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-6">
          <RewardsCatalog account={account} onRedemption={fetchAccount} />
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-6">
          <MyRedemptions />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <PointsHistory />
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <TierBenefitsCard currentTier={account.tier} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

