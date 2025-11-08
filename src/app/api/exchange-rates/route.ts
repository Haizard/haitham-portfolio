/**
 * Exchange Rates API Endpoint
 * 
 * Fetches real-time exchange rates from external API
 * and caches them for 24 hours.
 * 
 * External API: https://api.exchangerate.host/latest
 * Alternative: https://api.exchangerate-api.com/v4/latest/USD
 */

import { NextResponse } from 'next/server';
import type { Currency, ExchangeRates } from '@/lib/currency-data';

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// In-memory cache (for serverless, use Redis or database in production)
let cachedRates: ExchangeRates | null = null;
let cacheTimestamp: number = 0;

export async function GET() {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('[EXCHANGE-RATES] Returning cached rates');
      return NextResponse.json(cachedRates, { status: 200 });
    }

    // Fetch fresh rates from external API
    console.log('[EXCHANGE-RATES] Fetching fresh rates from API');
    const rates = await fetchRatesFromAPI();

    // Update cache
    cachedRates = rates;
    cacheTimestamp = now;

    return NextResponse.json(rates, { status: 200 });

  } catch (error: any) {
    console.error('[EXCHANGE-RATES] Error:', error);

    // Return cached rates if available, even if expired
    if (cachedRates) {
      console.warn('[EXCHANGE-RATES] Returning expired cached rates');
      return NextResponse.json(cachedRates, { status: 200 });
    }

    // Return default rates as fallback
    const defaultRates = getDefaultRates();
    return NextResponse.json(defaultRates, { status: 200 });
  }
}

/**
 * Fetch exchange rates from external API
 */
async function fetchRatesFromAPI(): Promise<ExchangeRates> {
  const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
  
  try {
    const response = await fetch(API_URL, {
      next: { revalidate: CACHE_DURATION / 1000 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Extract rates for supported currencies
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION);

    const rates: ExchangeRates = {
      base: 'USD',
      rates: {
        USD: 1,
        EUR: data.rates.EUR || 0.92,
        GBP: data.rates.GBP || 0.79,
        SAR: data.rates.SAR || 3.75,
        AED: data.rates.AED || 3.67,
        JPY: data.rates.JPY || 149.50,
        CNY: data.rates.CNY || 7.24,
        INR: data.rates.INR || 83.12,
        TZS: data.rates.TZS || 2580.00,
      },
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return rates;

  } catch (error) {
    console.error('[EXCHANGE-RATES] API fetch failed:', error);
    throw error;
  }
}

/**
 * Get default exchange rates (fallback)
 */
function getDefaultRates(): ExchangeRates {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION);

  return {
    base: 'USD',
    rates: {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      SAR: 3.75,
      AED: 3.67,
      JPY: 149.50,
      CNY: 7.24,
      INR: 83.12,
      TZS: 2580.00,
    },
    timestamp: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

