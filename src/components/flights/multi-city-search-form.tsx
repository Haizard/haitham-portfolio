"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AirportAutocomplete } from './airport-autocomplete';
import { Label } from '@/components/ui/label';

const flightSegmentSchema = z.object({
  origin: z.string().length(3, 'Select origin airport'),
  destination: z.string().length(3, 'Select destination airport'),
  departureDate: z.date({ required_error: 'Departure date is required' }),
});

const multiCitySearchSchema = z.object({
  segments: z.array(flightSegmentSchema).min(2, 'At least 2 segments required').max(6, 'Maximum 6 segments allowed'),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(9),
  infants: z.number().int().min(0).max(9),
  class: z.enum(['economy', 'premium_economy', 'business', 'first']),
  useAmadeus: z.boolean().default(false),
});

type MultiCitySearchFormData = z.infer<typeof multiCitySearchSchema>;

interface MultiCitySearchFormProps {
  useAmadeus?: boolean;
}

export function MultiCitySearchForm({ useAmadeus = false }: MultiCitySearchFormProps) {
  const router = useRouter();
  const [showPassengers, setShowPassengers] = useState(false);

  const form = useForm<MultiCitySearchFormData>({
    resolver: zodResolver(multiCitySearchSchema),
    defaultValues: {
      segments: [
        { origin: '', destination: '', departureDate: undefined },
        { origin: '', destination: '', departureDate: undefined },
      ],
      adults: 1,
      children: 0,
      infants: 0,
      class: 'economy',
      useAmadeus,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'segments',
  });

  const onSubmit = (data: MultiCitySearchFormData) => {
    // Build search params for multi-city search
    const params = new URLSearchParams({
      type: 'multi-city',
      adults: data.adults.toString(),
      children: data.children.toString(),
      infants: data.infants.toString(),
      class: data.class,
      useAmadeus: data.useAmadeus.toString(),
    });

    // Add segments
    data.segments.forEach((segment, index) => {
      params.append(`segment${index + 1}_origin`, segment.origin);
      params.append(`segment${index + 1}_destination`, segment.destination);
      params.append(`segment${index + 1}_date`, format(segment.departureDate, 'yyyy-MM-dd'));
    });

    router.push(`/flights/search?${params.toString()}`);
  };

  const addSegment = () => {
    if (fields.length < 6) {
      // Pre-fill with last destination as next origin
      const lastSegment = form.getValues(`segments.${fields.length - 1}`);
      append({
        origin: lastSegment?.destination || '',
        destination: '',
        departureDate: undefined,
      });
    }
  };

  const removeSegment = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const totalPassengers = form.watch('adults') + form.watch('children') + form.watch('infants');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Multi-City Flight Search</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Flight Segments */}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`segments.${index}.origin`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>From</FormLabel>
                                <FormControl>
                                  <AirportAutocomplete
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select origin"
                                    useAmadeus={useAmadeus}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`segments.${index}.destination`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>To</FormLabel>
                                <FormControl>
                                  <AirportAutocomplete
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select destination"
                                    useAmadeus={useAmadeus}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`segments.${index}.departureDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Departure Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full md:w-64 pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'PPP')
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => {
                                      // Disable dates before previous segment's departure
                                      if (index > 0) {
                                        const prevDate = form.getValues(`segments.${index - 1}.departureDate`);
                                        return date < (prevDate || new Date());
                                      }
                                      return date < new Date();
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {fields.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSegment(index)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {fields.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSegment}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Flight
                </Button>
              )}
            </div>

            {/* Passengers and Class */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Passengers Selector */}
              <div className="space-y-2">
                <Label>Passengers</Label>
                <Popover open={showPassengers} onOpenChange={setShowPassengers}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      {totalPassengers} {totalPassengers === 1 ? 'Passenger' : 'Passengers'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="adults"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Adults</div>
                              <div className="text-sm text-muted-foreground">12+ years</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => field.onChange(Math.max(1, field.value - 1))}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{field.value}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => field.onChange(Math.min(9, field.value + 1))}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Class Selector */}
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="premium_economy">Premium Economy</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="first">First Class</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg">
              <Search className="mr-2 h-5 w-5" />
              Search Multi-City Flights
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

