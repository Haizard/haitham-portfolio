/**
 * Currency Conversion System
 * 
 * Provides currency conversion functionality with real-time exchange rates.
 * Supports 8 major currencies with automatic rate caching.
 */

export type Currency = 'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED' | 'JPY' | 'CNY' | 'INR' | 'TZS';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
  decimals: number;
}

export interface ExchangeRates {
  base: Currency;
  rates: Record<Currency, number>;
  timestamp: string;
  expiresAt: string;
}

/**
 * Supported currencies with metadata
 */
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    decimals: 2,
  },
  SAR: {
    code: 'SAR',
    symbol: 'ر.س',
    name: 'Saudi Riyal',
    flag: '🇸🇦',
    decimals: 2,
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    decimals: 0, // JPY doesn't use decimal places
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    flag: '🇨🇳',
    decimals: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    decimals: 2,
  },
  TZS: {
    code: 'TZS',
    symbol: 'TSh',
    name: 'Tanzanian Shilling',
    flag: '🇹🇿',
    decimals: 2,
  },
};

/**
 * Default currency
 */
export const DEFAULT_CURRENCY: Currency = 'USD';

/**
 * Get currency info
 */
export function getCurrencyInfo(code: Currency): CurrencyInfo {
  return CURRENCIES[code];
}

/**
 * Get all supported currencies
 */
export function getAllCurrencies(): CurrencyInfo[] {
  return Object.values(CURRENCIES);
}

/**
 * Format price with currency symbol
 */
export function formatPrice(
  amount: number,
  currency: Currency,
  locale?: string
): string {
  const currencyInfo = getCurrencyInfo(currency);
  
  try {
    return new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currencyInfo.decimals,
      maximumFractionDigits: currencyInfo.decimals,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    const formattedAmount = amount.toFixed(currencyInfo.decimals);
    return `${currencyInfo.symbol}${formattedAmount}`;
  }
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<Currency, number>
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to USD first (base currency)
  const amountInUSD = fromCurrency === 'USD' 
    ? amount 
    : amount / rates[fromCurrency];

  // Convert from USD to target currency
  const convertedAmount = toCurrency === 'USD'
    ? amountInUSD
    : amountInUSD * rates[toCurrency];

  return convertedAmount;
}

/**
 * Format converted price
 */
export function formatConvertedPrice(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<Currency, number>,
  locale?: string
): string {
  const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency, rates);
  return formatPrice(convertedAmount, toCurrency, locale);
}

/**
 * Get exchange rates from cache or API
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    // Try to get from cache first
    const cached = await getCachedRates();
    if (cached && new Date(cached.expiresAt) > new Date()) {
      return cached;
    }

    // Fetch fresh rates from API
    const fresh = await fetchExchangeRates();
    
    // Cache the fresh rates
    await cacheExchangeRates(fresh);
    
    return fresh;
  } catch (error) {
    console.error('[CURRENCY] Error getting exchange rates:', error);
    
    // Try to return cached rates even if expired
    const cached = await getCachedRates();
    if (cached) {
      console.warn('[CURRENCY] Using expired cached rates');
      return cached;
    }
    
    // Fallback to default rates (1:1)
    return getDefaultRates();
  }
}

/**
 * Fetch exchange rates from API
 */
async function fetchExchangeRates(): Promise<ExchangeRates> {
  const response = await fetch('/api/exchange-rates');
  
  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }
  
  return response.json();
}

/**
 * Get cached exchange rates
 */
async function getCachedRates(): Promise<ExchangeRates | null> {
  try {
    const cached = localStorage.getItem('exchange_rates');
    if (!cached) return null;
    
    return JSON.parse(cached);
  } catch (error) {
    return null;
  }
}

/**
 * Cache exchange rates
 */
async function cacheExchangeRates(rates: ExchangeRates): Promise<void> {
  try {
    localStorage.setItem('exchange_rates', JSON.stringify(rates));
  } catch (error) {
    console.error('[CURRENCY] Error caching rates:', error);
  }
}

/**
 * Get default exchange rates (fallback)
 */
function getDefaultRates(): ExchangeRates {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

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

/**
 * Validate currency code
 */
export function isValidCurrency(code: string): code is Currency {
  return code in CURRENCIES;
}

/**
 * Get currency from locale
 */
export function getCurrencyFromLocale(locale: string): Currency {
  const currencyMap: Record<string, Currency> = {
    'en': 'USD',
    'en-US': 'USD',
    'en-GB': 'GBP',
    'es': 'EUR',
    'fr': 'EUR',
    'de': 'EUR',
    'ar': 'SAR',
    'ar-SA': 'SAR',
    'ar-AE': 'AED',
    'ja': 'JPY',
    'zh': 'CNY',
    'hi': 'INR',
    'sw': 'TZS',
    'sw-TZ': 'TZS',
  };

  return currencyMap[locale] || DEFAULT_CURRENCY;
}

