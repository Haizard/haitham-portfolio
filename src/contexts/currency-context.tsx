'use client';

/**
 * Currency Context Provider
 * 
 * Provides currency state and conversion functionality to all components.
 * Automatically fetches and caches exchange rates.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Currency, ExchangeRates } from '@/lib/currency-data';
import { 
  DEFAULT_CURRENCY, 
  getExchangeRates, 
  convertCurrency, 
  formatPrice,
  getCurrencyInfo,
} from '@/lib/currency-data';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: Record<Currency, number> | null;
  loading: boolean;
  error: string | null;
  convert: (amount: number, fromCurrency?: Currency) => number;
  format: (amount: number, fromCurrency?: Currency) => string;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

interface CurrencyProviderProps {
  children: React.ReactNode;
  defaultCurrency?: Currency;
}

export function CurrencyProvider({ children, defaultCurrency }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency || DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<Currency, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency');
    if (savedCurrency && savedCurrency !== currency) {
      setCurrencyState(savedCurrency as Currency);
    }
  }, []);

  // Fetch exchange rates on mount
  useEffect(() => {
    fetchRates();
  }, []);

  // Fetch exchange rates
  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExchangeRates();
      setRates(data.rates);
    } catch (err: any) {
      console.error('[CURRENCY] Error fetching rates:', err);
      setError(err.message || 'Failed to fetch exchange rates');
    } finally {
      setLoading(false);
    }
  };

  // Refresh rates manually
  const refreshRates = useCallback(async () => {
    await fetchRates();
  }, []);

  // Set currency and save to localStorage
  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  }, []);

  // Convert amount from one currency to another
  const convert = useCallback((amount: number, fromCurrency: Currency = 'USD'): number => {
    if (!rates) return amount;
    return convertCurrency(amount, fromCurrency, currency, rates);
  }, [currency, rates]);

  // Format amount with currency symbol
  const format = useCallback((amount: number, fromCurrency: Currency = 'USD'): string => {
    if (!rates) {
      return formatPrice(amount, fromCurrency);
    }
    const converted = convertCurrency(amount, fromCurrency, currency, rates);
    return formatPrice(converted, currency);
  }, [currency, rates]);

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    rates,
    loading,
    error,
    convert,
    format,
    refreshRates,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook to use currency context
 */
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

/**
 * Hook to format prices with currency conversion
 */
export function useFormatPrice() {
  const { format } = useCurrency();
  return format;
}

/**
 * Hook to convert prices
 */
export function useConvertPrice() {
  const { convert } = useCurrency();
  return convert;
}

/**
 * Hook to get current currency info
 */
export function useCurrencyInfo() {
  const { currency } = useCurrency();
  return getCurrencyInfo(currency);
}

