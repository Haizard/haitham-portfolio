"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarIcon, Users } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function PropertyBookingWidget() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [checkInDate, setCheckInDate] = useState<Date | undefined>(() => {
        const param = searchParams.get('checkIn');
        return param ? new Date(param) : undefined;
    });

    const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(() => {
        const param = searchParams.get('checkOut');
        return param ? new Date(param) : undefined;
    });

    const [adults, setAdults] = useState(() => {
        return parseInt(searchParams.get('adults') || '2');
    });

    const [children, setChildren] = useState(() => {
        return parseInt(searchParams.get('children') || '0');
    });

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (checkInDate) {
            params.set('checkIn', format(checkInDate, 'yyyy-MM-dd'));
        } else {
            params.delete('checkIn');
        }

        if (checkOutDate) {
            params.set('checkOut', format(checkOutDate, 'yyyy-MM-dd'));
        } else {
            params.delete('checkOut');
        }

        params.set('adults', adults.toString());
        params.set('children', children.toString());

        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Auto-select checkout if checkin is selected and checkout is invalid
    useEffect(() => {
        if (checkInDate && (!checkOutDate || checkOutDate <= checkInDate)) {
            setCheckOutDate(addDays(checkInDate, 1));
        }
    }, [checkInDate]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Card className="sticky top-20 shadow-lg border-primary/20">
            <CardHeader className="pb-4">
                <CardTitle>Check Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Check-in Date */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Check-in
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !checkInDate && 'text-muted-foreground'
                                )}
                            >
                                {checkInDate ? format(checkInDate, 'PPP') : 'Select Date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={checkInDate}
                                onSelect={setCheckInDate}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Check-out
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !checkOutDate && 'text-muted-foreground'
                                )}
                            >
                                {checkOutDate ? format(checkOutDate, 'PPP') : 'Select Date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={checkOutDate}
                                onSelect={setCheckOutDate}
                                disabled={(date) => {
                                    const minDate = checkInDate || new Date();
                                    return date <= minDate;
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Adults */}
                    <div className="space-y-2">
                        <Label htmlFor="adults" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Adults
                        </Label>
                        <Select
                            value={adults.toString()}
                            onValueChange={(value) => setAdults(parseInt(value))}
                        >
                            <SelectTrigger id="adults">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                        {num}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Children */}
                    <div className="space-y-2">
                        <Label htmlFor="children" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Children
                        </Label>
                        <Select
                            value={children.toString()}
                            onValueChange={(value) => setChildren(parseInt(value))}
                        >
                            <SelectTrigger id="children">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                        {num}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button onClick={handleSearch} className="w-full" size="lg">
                    Update Search
                </Button>
            </CardContent>
        </Card>
    );
}
