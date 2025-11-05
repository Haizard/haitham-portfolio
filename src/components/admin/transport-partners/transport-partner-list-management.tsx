
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserCog, ShieldCheck, ShieldX, UserCheck, UserX, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FreelancerProfile, PartnerStatus } from '@/lib/user-profile-data';
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

export function TransportPartnerListManagement() {
  const [agents, setAgents] = useState<FreelancerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/by-role/transport_partner');
      if (!response.ok) throw new Error('Failed to fetch transport partners');
      const data: FreelancerProfile[] = await response.json();
      setAgents(data);
    } catch (error: any) {
      console.error("Error fetching transport partners:", error);
      toast({ title: "Error", description: error.message || "Could not load transport partners.", variant: "destructive" });
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);
  
  const handleUpdateStatus = async (agentId: string, newStatus: PartnerStatus) => {
    setIsUpdatingStatus(prev => ({ ...prev, [agentId]: true }));
    try {
        // NOTE: This uses the /api/vendors/.../status route which works for any partner with a `vendorStatus` field.
        const response = await fetch(`/api/vendors/${agentId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status');
        }
        toast({ title: "Status Updated", description: `Partner status changed to ${newStatus}.` });
        fetchAgents(); // Refresh list
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsUpdatingStatus(prev => ({ ...prev, [agentId]: false }));
    }
  };

  const getStatusBadgeVariant = (status: PartnerStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "suspended": return "destructive";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };
  
  const getStatusIcon = (status: PartnerStatus) => {
    switch (status) {
        case "approved": return <ShieldCheck className="h-4 w-4 mr-1.5 text-success" />;
        case "pending": return <UserCog className="h-4 w-4 mr-1.5 text-warning" />;
        case "rejected": return <ShieldX className="h-4 w-4 mr-1.5 text-destructive" />;
        case "suspended": return <ShieldX className="h-4 w-4 mr-1.5 text-destructive" />;
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
        <CardTitle>Transport Partner Applications & Status</CardTitle>
        <CardDescription>Review new applications and manage existing transport partners.</CardDescription>
      </CardHeader>
      <CardContent>
        {agents.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No transport partners have registered yet.</p>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden md:table-cell">Avatar</TableHead>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">Joined</TableHead>
                  <TableHead className="text-right min-w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map(agent => (
                  <TableRow key={agent.id}>
                    <TableCell className="hidden md:table-cell">
                      <Image src={agent.avatarUrl} alt={agent.name} width={40} height={40} className="rounded-full object-contain aspect-square"/>
                    </TableCell>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(agent.vendorStatus)} className="text-xs flex items-center w-fit capitalize">
                          {getStatusIcon(agent.vendorStatus)}
                          {agent.vendorStatus}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{format(new Date(agent.createdAt), "PPP")}</TableCell>
                    <TableCell className="text-right space-x-1">
                        {isUpdatingStatus[agent.id!] ? <Loader2 className="h-5 w-5 animate-spin"/> : (
                             agent.vendorStatus === 'pending' ? (
                                <>
                                    <Button size="sm" onClick={() => handleUpdateStatus(agent.id!, 'approved')} className="bg-success text-success-foreground hover:bg-success/90">
                                        <UserCheck className="mr-1 h-4 w-4" /> Approve
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(agent.id!, 'rejected')}>
                                        <UserX className="mr-1 h-4 w-4" /> Reject
                                    </Button>
                                </>
                            ) : agent.vendorStatus === 'approved' ? (
                                <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(agent.id!, 'suspended')}>
                                    <UserX className="mr-1 h-4 w-4" /> Suspend
                                </Button>
                            ) : (
                                <Button size="sm" onClick={() => handleUpdateStatus(agent.id!, 'approved')} className="bg-success text-success-foreground hover:bg-success/90">
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
