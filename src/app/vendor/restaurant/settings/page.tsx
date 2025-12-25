"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Utensils, MapPin, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

const restaurantSchema = z.object({
    name: z.string().min(1, "Restaurant name is required."),
    logoUrl: z.string().url("A valid logo URL is required."),
    location: z.string().min(1, "Location is required."),
    cuisineTypes: z.array(z.string()).min(1, "At least one cuisine type is required."),
    status: z.enum(["Open", "Closed"]),
    specialDeals: z.string().optional(),
});

type RestaurantFormValues = z.infer<typeof restaurantSchema>;

const CUISINE_OPTIONS = [
    "Italian", "Chinese", "Indian", "Japanese", "French", "Mexican", "Thai", "American", "Mediterranean", "Veggies"
];

export default function RestaurantSettingsPage() {
    const { user, isLoading: isUserLoading } = useUser();
    const { toast } = useToast();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<RestaurantFormValues>({
        resolver: zodResolver(restaurantSchema),
        defaultValues: {
            name: '',
            logoUrl: '',
            location: '',
            cuisineTypes: [],
            status: 'Open',
            specialDeals: '',
        }
    });

    useEffect(() => {
        if (!isUserLoading && user) {
            fetchRestaurant();
        }
    }, [user, isUserLoading]);

    const fetchRestaurant = async () => {
        if (!user) return;
        try {
            const response = await fetch(`/api/restaurants/by-owner/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setRestaurant(data);
                form.reset({
                    name: data.name || '',
                    logoUrl: data.logoUrl || '',
                    location: data.location || '',
                    cuisineTypes: data.cuisineTypes || [],
                    status: data.status || 'Open',
                    specialDeals: data.specialDeals || '',
                });
            }
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            toast({
                title: "Error",
                description: "Failed to load restaurant profile.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (values: RestaurantFormValues) => {
        if (!restaurant?.id) return;
        setIsSaving(true);
        try {
            const response = await fetch(`/api/restaurants/${restaurant.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Restaurant profile updated successfully.",
                });
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Error updating restaurant:', error);
            toast({
                title: "Error",
                description: "Failed to update restaurant profile.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || isUserLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg">
                    <Utensils className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Restaurant Settings</h1>
                    <p className="text-muted-foreground">Manage your restaurant details and presence on the platform.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="uppercase tracking-tighter text-xl flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>Primary details displayed to your customers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Restaurant Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Gourmet Heaven" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="logoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Logo Image URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormDescription>Link to your restaurant logo image.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Location (City/Address)
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="New York, NY" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Open">Open</SelectItem>
                                                <SelectItem value="Closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="uppercase tracking-tighter text-xl flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-rose-500" />
                                Cuisine & Deals
                            </CardTitle>
                            <CardDescription>Specify what you serve and any active promotions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="cuisineTypes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cuisine Types (Select multiple)</FormLabel>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {CUISINE_OPTIONS.map((option) => (
                                                <Button
                                                    key={option}
                                                    type="button"
                                                    variant={field.value.includes(option) ? "default" : "outline"}
                                                    size="sm"
                                                    className="rounded-full"
                                                    onClick={() => {
                                                        const newValue = field.value.includes(option)
                                                            ? field.value.filter(v => v !== option)
                                                            : [...field.value, option];
                                                        field.onChange(newValue);
                                                    }}
                                                >
                                                    {option}
                                                </Button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="specialDeals"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Active Special Deals</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="e.g. 20% off on all pizzas every Tuesday!"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>This will be highlighted to users discovery your restaurant.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
                            <Button type="submit" size="lg" disabled={isSaving} className="rounded-full px-8 shadow-lg shadow-primary/20">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Settings
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
