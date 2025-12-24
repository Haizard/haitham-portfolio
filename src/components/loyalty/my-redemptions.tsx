"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gift, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { RewardRedemption } from '@/lib/loyalty-common';

export function MyRedemptions() {
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const response = await fetch('/api/loyalty/redemptions');
      if (response.ok) {
        const data = await response.json();
        setRedemptions(data);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: 'Code Copied!',
      description: 'Voucher code copied to clipboard',
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusColor = (status: RewardRedemption['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
    <Card>
      <CardHeader>
        <CardTitle>My Redemptions</CardTitle>
        <p className="text-sm text-muted-foreground">
          View and manage your redeemed rewards
        </p>
      </CardHeader>
      <CardContent>
        {redemptions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No redemptions yet</p>
            <p className="text-sm">Redeem rewards from the catalog!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {redemptions.map((redemption) => (
              <div
                key={redemption.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(redemption.status)}>
                        {redemption.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(redemption.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reward ID: {redemption.rewardId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      -{redemption.pointsSpent.toLocaleString()} pts
                    </p>
                  </div>
                </div>

                {redemption.voucherCode && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Voucher Code</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-background rounded border font-mono text-sm">
                        {redemption.voucherCode}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyVoucherCode(redemption.voucherCode!)}
                      >
                        {copiedCode === redemption.voucherCode ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Expires: {new Date(redemption.expiresAt).toLocaleDateString()}
                  </span>
                  {redemption.usedAt && (
                    <span>
                      Used: {new Date(redemption.usedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

