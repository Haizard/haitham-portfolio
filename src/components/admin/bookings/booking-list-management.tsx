
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, CalendarClock, User, Mail, Info, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Booking, BookingStatus } from '@/lib/bookings-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

export function BookingListManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingToUpdate, setBookingToUpdate] = useState<{ booking: Booking; newStatus: BookingStatus } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data: Booking[] = await response.json();
      setBookings(data);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast({ title: "Error", description: error.message || "Could not load bookings.", variant: "destructive" });
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const confirmUpdateStatus = (booking: Booking, newStatus: BookingStatus) => {
    setBookingToUpdate({ booking, newStatus });
  };

  const handleUpdateStatus = async () => {
    if (!bookingToUpdate || !bookingToUpdate.booking.id) return;
    setIsUpdating(true);
    const { booking, newStatus } = bookingToUpdate;
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update booking status`);
      }
      toast({ title: `Booking Status Updated`, description: `Booking for "${booking.serviceName}" is now ${newStatus}.` });
      fetchBookings(); // Refresh the list
    } catch (error: any) {
      toast({ title: "Error", description: error.message || `Could not update booking status.`, variant: "destructive" });
    } finally {
      setIsUpdating(false);
      setBookingToUpdate(null);
    }
  };

  const getStatusBadgeVariant = (status: BookingStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "Pending": return "secondary";
      case "Confirmed": return "default"; // Primary color for confirmed
      case "Completed": return "outline"; // Outline for completed
      case "Cancelled": return "destructive";
      default: return "outline";
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
    <>
      <Card className="shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center"><CalendarClock className="mr-2 h-6 w-6 text-primary"/>All Booking Requests</CardTitle>
          <CardDescription>View and manage client service bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No booking requests found.</p>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Service</TableHead>
                    <TableHead className="min-w-[150px]">Client</TableHead>
                    <TableHead className="min-w-[180px]">Email</TableHead>
                    <TableHead className="min-w-[150px]">Requested Date</TableHead>
                    <TableHead className="min-w-[120px]">Requested Time</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="text-right min-w-[220px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map(booking => (
                    <TableRow key={booking.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{booking.serviceName}</TableCell>
                      <TableCell><div className="flex items-center gap-1 text-sm"><User className="h-4 w-4"/>{booking.clientName}</div></TableCell>
                      <TableCell><div className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3"/>{booking.clientEmail}</div></TableCell>
                      <TableCell>{format(new Date(booking.requestedDateRaw), "PPP")}</TableCell>
                      <TableCell>{booking.requestedTimeRaw}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="text-xs">
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {booking.status === "Pending" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => confirmUpdateStatus(booking, "Confirmed")} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                              <CheckCircle className="h-4 w-4 mr-1"/> Confirm
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => confirmUpdateStatus(booking, "Cancelled")} className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                              <XCircle className="h-4 w-4 mr-1"/> Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === "Confirmed" && (
                           <Button variant="outline" size="sm" onClick={() => confirmUpdateStatus(booking, "Completed")} className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700">
                              <CheckCircle className="h-4 w-4 mr-1"/> Mark Completed
                            </Button>
                        )}
                        {/* Add more actions like "View Details" or "Edit Booking" if needed */}
                         <Button variant="ghost" size="sm" onClick={() => toast({title: "Details", description: `Notes: ${booking.clientNotes || 'N/A'}`})}>
                            <Info className="h-4 w-4"/> <span className="ml-1 hidden sm:inline">Notes</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={!!bookingToUpdate} onOpenChange={(open) => !open && setBookingToUpdate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of the booking for "<strong>{bookingToUpdate?.booking.serviceName}</strong>" by {bookingToUpdate?.booking.clientName} to "<strong>{bookingToUpdate?.newStatus}</strong>"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToUpdate(null)} disabled={isUpdating}>Back</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleUpdateStatus} 
                disabled={isUpdating} 
                className={
                    bookingToUpdate?.newStatus === "Confirmed" ? "bg-green-600 hover:bg-green-700" :
                    bookingToUpdate?.newStatus === "Cancelled" ? "bg-destructive hover:bg-destructive/90" :
                    bookingToUpdate?.newStatus === "Completed" ? "bg-blue-600 hover:bg-blue-700" :
                    "bg-primary hover:bg-primary/90"
                }
            >
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm {bookingToUpdate?.newStatus}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
