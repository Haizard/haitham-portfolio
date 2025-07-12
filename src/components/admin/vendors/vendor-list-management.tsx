
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, X, UserCog, ShieldCheck, ShieldX, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FreelancerProfile, VendorStatus } from '@/lib/user-profile-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';

export function VendorListManagement() {
  const [vendors, setVendors] = useState<FreelancerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vendors');
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data: FreelancerProfile[] = await response.json();
      setVendors(data);
    } catch (error: any) {
      console.error("Error fetching vendors:", error);
      toast({ title: "Error", description: error.message || "Could not load vendors.", variant: "destructive" });
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);
  
  const handleUpdateStatus = async (vendorId: string, newStatus: VendorStatus) => {
    setIsUpdatingStatus(prev => ({ ...prev, [vendorId]: true }));
    try {
        const response = await fetch(`/api/vendors/${vendorId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status');
        }
        toast({ title: "Status Updated", description: `Vendor status changed to ${newStatus}.` });
        fetchVendors(); // Refresh list
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsUpdatingStatus(prev => ({ ...prev, [vendorId]: false }));
    }
  };


  const getStatusBadgeVariant = (status: VendorStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "suspended": return "destructive";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };
  
  const getStatusIcon = (status: VendorStatus) => {
    switch (status) {
        case "approved": return <ShieldCheck className="h-4 w-4 mr-1.5 text-green-500" />;
        case "pending": return <UserCog className="h-4 w-4 mr-1.5 text-yellow-500" />;
        case "rejected": return <ShieldX className="h-4 w-4 mr-1.5 text-red-500" />;
        case "suspended": return <ShieldX className="h-4 w-4 mr-1.5 text-red-500" />;
        default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Vendor Applications & Status</CardTitle>
        <CardDescription>Review new applications and manage existing vendors.</CardDescription>
      </CardHeader>
      <CardContent>
        {vendors.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No vendors have registered yet.</p>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden md:table-cell">Avatar</TableHead>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[150px]">Store Name</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">Joined</TableHead>
                  <TableHead className="text-right min-w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map(vendor => (
                  <TableRow key={vendor.id}>
                    <TableCell className="hidden md:table-cell">
                      <Image src={vendor.avatarUrl} alt={vendor.name} width={40} height={40} className="rounded-full object-contain aspect-square"/>
                    </TableCell>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.storeName}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(vendor.vendorStatus)} className="text-xs flex items-center w-fit capitalize">
                          {getStatusIcon(vendor.vendorStatus)}
                          {vendor.vendorStatus}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{format(new Date(vendor.createdAt), "PPP")}</TableCell>
                    <TableCell className="text-right space-x-1">
                        {isUpdatingStatus[vendor.id!] ? <Loader2 className="h-5 w-5 animate-spin"/> : (
                             vendor.vendorStatus === 'pending' ? (
                                <>
                                    <Button size="sm" onClick={() => handleUpdateStatus(vendor.id!, 'approved')} className="bg-green-600 hover:bg-green-700">
                                        <UserCheck className="mr-1 h-4 w-4" /> Approve
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(vendor.id!, 'rejected')}>
                                        <UserX className="mr-1 h-4 w-4" /> Reject
                                    </Button>
                                </>
                            ) : vendor.vendorStatus === 'approved' ? (
                                <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(vendor.id!, 'suspended')}>
                                    <UserX className="mr-1 h-4 w-4" /> Suspend
                                </Button>
                            ) : (
                                <Button size="sm" onClick={() => handleUpdateStatus(vendor.id!, 'approved')}>
                                    <UserCheck className="mr-1 h-4 w-4" /> Re-approve
                                </Button>
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
