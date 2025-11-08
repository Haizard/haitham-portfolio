"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gift, Percent, TrendingUp, Ticket, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Reward, LoyaltyAccount } from '@/lib/loyalty-data';

interface RewardsCatalogProps {
  account: LoyaltyAccount;
  onRedemption?: () => void;
}

const REWARD_TYPE_ICONS = {
  discount: Percent,
  upgrade: TrendingUp,
  freebie: Gift,
  voucher: Ticket,
};

const REWARD_TYPE_COLORS = {
  discount: 'text-green-600 bg-green-100',
  upgrade: 'text-blue-600 bg-blue-100',
  freebie: 'text-purple-600 bg-purple-100',
  voucher: 'text-orange-600 bg-orange-100',
};

export function RewardsCatalog({ account, onRedemption }: RewardsCatalogProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/loyalty/rewards');
      if (response.ok) {
        const data = await response.json();
        setRewards(data);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string, pointsCost: number) => {
    if (account.points < pointsCost) {
      toast({
        title: 'Insufficient Points',
        description: `You need ${pointsCost.toLocaleString()} points to redeem this reward.`,
        variant: 'destructive',
      });
      return;
    }

    setRedeeming(rewardId);

    try {
      const response = await fetch('/api/loyalty/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      });

      if (response.ok) {
        toast({
          title: 'Reward Redeemed!',
          description: 'Check your redemptions to view your reward.',
        });
        onRedemption?.();
      } else {
        const error = await response.json();
        toast({
          title: 'Redemption Failed',
          description: error.error || 'Failed to redeem reward',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while redeeming the reward',
        variant: 'destructive',
      });
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rewards Catalog</h2>
          <p className="text-muted-foreground">
            Redeem your points for exclusive rewards
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Available Points</p>
          <p className="text-2xl font-bold">{account.points.toLocaleString()}</p>
        </div>
      </div>

      {rewards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No rewards available at the moment</p>
            <p className="text-sm text-muted-foreground">Check back soon for new rewards!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const RewardIcon = REWARD_TYPE_ICONS[reward.rewardType];
            const iconColor = REWARD_TYPE_COLORS[reward.rewardType];
            const canAfford = account.points >= reward.pointsCost;

            return (
              <Card key={reward.id} className={!canAfford ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-full ${iconColor}`}>
                      <RewardIcon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {reward.pointsCost.toLocaleString()} pts
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{reward.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {reward.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {reward.applicableTo.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs capitalize">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  {reward.discountType && reward.discountValue && (
                    <div className="mt-3 p-2 bg-muted rounded text-center">
                      <p className="text-2xl font-bold text-primary">
                        {reward.discountType === 'percentage' ? `${reward.discountValue}%` : `$${reward.discountValue}`}
                      </p>
                      <p className="text-xs text-muted-foreground">Discount</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={!canAfford || redeeming === reward.id}
                    onClick={() => handleRedeem(reward.id!, reward.pointsCost)}
                  >
                    {redeeming === reward.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redeeming...
                      </>
                    ) : canAfford ? (
                      'Redeem Now'
                    ) : (
                      `Need ${(reward.pointsCost - account.points).toLocaleString()} more points`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

