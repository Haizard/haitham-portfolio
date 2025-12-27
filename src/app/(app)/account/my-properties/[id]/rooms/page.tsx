"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, ArrowLeft, Edit, Trash, Users, Bed, Check, X as XIcon } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Room } from '@/lib/hotels-data';

export default function RoomsListPage() {
    const router = useRouter();
    const params = useParams();
    const propertyId = params.id as string;
    const { toast } = useToast();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchRooms();
    }, [propertyId]);

    const fetchRooms = async () => {
        try {
            const response = await fetch(`/api/hotels/rooms?propertyId=${propertyId}`);
            if (!response.ok) throw new Error('Failed to fetch rooms');

            const data = await response.json();
            setRooms(data.rooms || []);
        } catch (error) {
            console.error('Error loading rooms:', error);
            toast({
                title: "Error",
                description: "Failed to load rooms",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (roomId: string) => {
        setIsDeleting(roomId);
        try {
            const response = await fetch(`/api/hotels/rooms/${roomId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete room');

            toast({ title: "Success", description: "Room deleted successfully" });
            fetchRooms(); // Refresh list
        } catch (error) {
            console.error('Error deleting room:', error);
            toast({
                title: "Error",
                description: "Failed to delete room",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/account/my-properties/${propertyId}/edit`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Manage Rooms</h1>
                        <p className="text-muted-foreground">Add and manage room types for your property.</p>
                    </div>
                </div>
                <Button onClick={() => router.push(`/account/my-properties/${propertyId}/rooms/new`)}>
                    <Plus className="mr-2 h-4 w-4" /> Add New Room
                </Button>
            </div>

            {rooms.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Bed className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Rooms Added Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Create room types to start accepting bookings. You can define capacity, pricing, and amenities for each room type.
                        </p>
                        <Button onClick={() => router.push(`/account/my-properties/${propertyId}/rooms/new`)}>
                            <Plus className="mr-2 h-4 w-4" /> Create First Room
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {rooms.map(room => (
                        <Card key={room.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="w-full md:w-48 h-48 relative bg-muted">
                                    {room.images && room.images.length > 0 ? (
                                        <Image
                                            src={room.images[0].url}
                                            alt={room.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <Bed className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold">{room.name}</h3>
                                            {room.isActive ? (
                                                <Badge className="bg-green-500 text-white">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                            <Badge variant="outline" className="capitalize">{room.type}</Badge>
                                        </div>
                                        <p className="text-muted-foreground line-clamp-2">{room.description}</p>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{room.capacity.adults} Adults, {room.capacity.children} Children</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="font-semibold text-foreground">
                                                    {room.pricing.currency} {room.pricing.basePrice}
                                                </div>
                                                <span>/ night</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-semibold text-foreground">{room.availability.totalRooms}</span>
                                                <span>units available</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col gap-2 justify-center md:justify-start">
                                        <Button variant="outline" size="sm" onClick={() => router.push(`/account/my-properties/${propertyId}/rooms/${room.id}/edit`)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Room?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this room? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(room.id!)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        {isDeleting === room.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            "Delete"
                                                        )}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
