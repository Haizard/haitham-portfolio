"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Gift, RefreshCw, Award } from 'lucide-react';
import type { PointsTransaction } from '@/lib/loyalty-data';

export function PointsHistory() {
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/loyalty/transactions?limit=20');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: PointsTransaction['type']) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'redeem':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'bonus':
        return <Gift className="h-4 w-4 text-purple-600" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'expire':
        return <Award className="h-4 w-4 text-gray-600" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: PointsTransaction['type']) => {
    switch (type) {
      case 'earn':
        return 'text-green-600';
      case 'redeem':
        return 'text-red-600';
      case 'bonus':
        return 'text-purple-600';
      case 'refund':
        return 'text-blue-600';
      case 'expire':
        return 'text-gray-600';
      default:
        return 'text-foreground';
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
        <CardTitle>Points History</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your recent points transactions
        </p>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Start booking to earn points!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.reason}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize text-xs">
                        {transaction.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount.toLocaleString()}
                  </p>
                  {transaction.expiresAt && (
                    <p className="text-xs text-muted-foreground">
                      Expires {new Date(transaction.expiresAt).toLocaleDateString()}
                    </p>
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

