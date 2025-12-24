"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { TIER_BENEFITS, TIER_THRESHOLDS } from '@/lib/loyalty-common';
import type { LoyaltyAccount } from '@/lib/loyalty-common';

interface TierBenefitsCardProps {
  currentTier: LoyaltyAccount['tier'];
}

const TIERS: Array<LoyaltyAccount['tier']> = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

export function TierBenefitsCard({ currentTier }: TierBenefitsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tier Benefits</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare benefits across all membership tiers
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">Benefit</th>
                {TIERS.map((tier) => (
                  <th key={tier} className="text-center py-3 px-2">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-medium capitalize">{tier}</span>
                      {tier === currentTier && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {TIER_THRESHOLDS[tier].toLocaleString()}+ pts
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-2">Points Multiplier</td>
                {TIERS.map((tier) => (
                  <td key={tier} className="text-center py-3 px-2">
                    <span className="font-medium">
                      {TIER_BENEFITS[tier].pointsMultiplier}x
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2">Welcome Bonus</td>
                {TIERS.map((tier) => (
                  <td key={tier} className="text-center py-3 px-2">
                    <span className="font-medium">
                      {TIER_BENEFITS[tier].bonusPoints.toLocaleString()} pts
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2">Priority Support</td>
                {TIERS.map((tier) => (
                  <td key={tier} className="text-center py-3 px-2">
                    {TIER_BENEFITS[tier].prioritySupport ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2">Free Upgrades</td>
                {TIERS.map((tier) => (
                  <td key={tier} className="text-center py-3 px-2">
                    {TIER_BENEFITS[tier].freeUpgrades ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-2">Early Access to Deals</td>
                {TIERS.map((tier) => (
                  <td key={tier} className="text-center py-3 px-2">
                    {TIER_BENEFITS[tier].earlyAccess ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

