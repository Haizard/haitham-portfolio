'use client';

/**
 * Currency Switcher Component
 * 
 * Dropdown to switch between supported currencies.
 * Shows currency code, symbol, name, and current selection.
 */

import React, { useState } from 'react';
import { Check, ChevronDown, DollarSign } from 'lucide-react';
import { useCurrency } from '@/contexts/currency-context';
import { getAllCurrencies, type Currency } from '@/lib/currency-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function CurrencySwitcher() {
  const { currency, setCurrency, loading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const currencies = getAllCurrencies();

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  const currentCurrency = currencies.find(c => c.code === currency);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loading}
        >
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">{currentCurrency?.code}</span>
          <span className="sm:hidden">{currentCurrency?.symbol}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {currencies.map((curr) => {
          const isSelected = curr.code === currency;

          return (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{curr.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{curr.code}</span>
                  <span className="text-xs text-muted-foreground">{curr.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{curr.symbol}</span>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

