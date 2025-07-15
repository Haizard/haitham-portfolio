

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, X, Banknote, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Payout, PayoutStatus } from '@/lib/payouts-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FreelancerProfile } from '@/lib/user-profile-data';

interface EnrichedPayout extends Payout {
  vendorName?: string;
  vendorPhone?: string; // Add vendor phone number
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function PayoutListManagement() {
  const [payouts, setPayouts] = useState<EnrichedPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  const fetchPayouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payouts'); // Admin fetch (no vendorId)
      if (!response.ok) throw new Error('Failed to fetch payout requests');
      const data: EnrichedPayout[] = await response.json();
      setPayouts(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleUpdateStatus = async (payoutId: string, newStatus: 'completed' | 'failed') => {
    setIsUpdating(prev => ({...prev, [payoutId]: true}));
    try {
      const response = await fetch(`/api/payouts/${payoutId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update payout status.');
      toast({ title: "Status Updated", description: `Payout has been marked as ${newStatus}.` });
      fetchPayouts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsUpdating(prev => ({...prev, [payoutId]: false}));
    }
  };
  
  const getStatusBadgeVariant = (status: PayoutStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "pending": return "secondary";
      case "completed": return "default";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>All Payout Requests</CardTitle>
        <CardDescription>Review and process vendor withdrawal requests.</CardDescription>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No payout requests found.</p>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Payout Phone</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map(payout => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">{payout.vendorName}</TableCell>
                    <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5"/>
                            {payout.vendorPhone || 'Not set'}
                        </div>
                    </TableCell>
                    <TableCell className="text-xs">{format(new Date(payout.requestedAt), "PPP")}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(payout.amount)}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(payout.status)} className="capitalize text-xs">{payout.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      {isUpdating[payout.id!] ? <Loader2 className="h-5 w-5 animate-spin"/> : (
                         payout.status === 'pending' ? (
                            <>
                                <Button size="sm" onClick={() => handleUpdateStatus(payout.id!, 'completed')} className="bg-success text-success-foreground hover:bg-success/90"><Check className="mr-1 h-4 w-4" /> Approve</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(payout.id!, 'failed')}><X className="mr-1 h-4 w-4" /> Reject</Button>
                            </>
                         ) : (
                            <span className="text-xs text-muted-foreground">Processed on {payout.completedAt ? format(new Date(payout.completedAt), "PPP") : 'N/A'}</span>
                         )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
