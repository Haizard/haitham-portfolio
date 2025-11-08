'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Airport {
  iataCode: string;
  name: string;
  city: string;
  country: string;
}

interface AirportAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  useAmadeus?: boolean;
}

export function AirportAutocomplete({
  value,
  onValueChange,
  placeholder = 'Select airport...',
  disabled = false,
  useAmadeus = false,
}: AirportAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Find selected airport
  const selectedAirport = airports.find((airport) => airport.iataCode === value);

  // Fetch airports based on search query
  const fetchAirports = async (query: string) => {
    if (!query || query.length < 2) {
      setAirports([]);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        search: query,
        limit: '10',
      });

      if (useAmadeus) {
        params.append('useAmadeus', 'true');
      }

      const response = await fetch(`/api/flights/airports?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setAirports(data.airports || []);
      }
    } catch (error) {
      console.error('Error fetching airports:', error);
      setAirports([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchAirports(searchQuery);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Load popular airports on mount
  useEffect(() => {
    if (!searchQuery && airports.length === 0) {
      fetchAirports('');
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedAirport ? (
            <span className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{selectedAirport.iataCode}</span>
              <span className="text-muted-foreground">
                {selectedAirport.city}, {selectedAirport.country}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search airports..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching airports...
              </div>
            ) : airports.length === 0 ? (
              <CommandEmpty>
                {searchQuery.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No airports found'}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {airports.map((airport) => (
                  <CommandItem
                    key={airport.iataCode}
                    value={airport.iataCode}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? '' : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === airport.iataCode ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{airport.iataCode}</span>
                        <span className="text-sm text-muted-foreground">
                          {airport.name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {airport.city}, {airport.country}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

