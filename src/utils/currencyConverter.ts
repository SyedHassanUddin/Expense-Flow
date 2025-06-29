// Real-time currency conversion utility
export interface ExchangeRates {
  [key: string]: number;
}

export interface CurrencyInfo {
  symbol: string;
  name: string;
  code: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  '₹': { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  '$': { symbol: '$', name: 'US Dollar', code: 'USD' },
  '€': { symbol: '€', name: 'Euro', code: 'EUR' },
  '£': { symbol: '£', name: 'British Pound', code: 'GBP' }
};

// Cache for exchange rates (valid for 1 hour)
let exchangeRatesCache: {
  rates: ExchangeRates;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Fallback exchange rates (updated as of January 2024)
const FALLBACK_RATES: ExchangeRates = {
  'USD': 1.0,      // Base currency
  'INR': 83.25,    // 1 USD = 83.25 INR
  'EUR': 0.92,     // 1 USD = 0.92 EUR
  'GBP': 0.79      // 1 USD = 0.79 GBP
};

export async function getExchangeRates(): Promise<ExchangeRates> {
  // Check cache first
  if (exchangeRatesCache && 
      Date.now() - exchangeRatesCache.timestamp < CACHE_DURATION) {
    return exchangeRatesCache.rates;
  }

  try {
    // Try to fetch real-time rates from a free API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    const rates: ExchangeRates = {
      'USD': 1.0,
      'INR': data.rates.INR || FALLBACK_RATES.INR,
      'EUR': data.rates.EUR || FALLBACK_RATES.EUR,
      'GBP': data.rates.GBP || FALLBACK_RATES.GBP
    };

    // Update cache
    exchangeRatesCache = {
      rates,
      timestamp: Date.now()
    };

    return rates;
  } catch (error) {
    console.warn('Failed to fetch real-time exchange rates, using fallback:', error);
    
    // Use fallback rates and cache them
    exchangeRatesCache = {
      rates: FALLBACK_RATES,
      timestamp: Date.now()
    };

    return FALLBACK_RATES;
  }
}

export function getCurrencyCode(symbol: string): string {
  return SUPPORTED_CURRENCIES[symbol]?.code || 'USD';
}

export async function convertCurrency(
  amount: number, 
  fromSymbol: string, 
  toSymbol: string
): Promise<number> {
  if (fromSymbol === toSymbol) {
    return amount;
  }

  const rates = await getExchangeRates();
  const fromCode = getCurrencyCode(fromSymbol);
  const toCode = getCurrencyCode(toSymbol);

  // Convert to USD first, then to target currency
  const usdAmount = amount / rates[fromCode];
  const convertedAmount = usdAmount * rates[toCode];

  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

export async function convertExpenseAmount(
  originalAmount: number,
  originalCurrency: string,
  targetCurrency: string
): Promise<number> {
  return await convertCurrency(originalAmount, originalCurrency, targetCurrency);
}

// Get currency display info
export function getCurrencyInfo(symbol: string): CurrencyInfo {
  return SUPPORTED_CURRENCIES[symbol] || SUPPORTED_CURRENCIES['$'];
}

// Format amount with proper currency symbol and locale
export function formatCurrencyAmount(amount: number, currencySymbol: string): string {
  const currencyInfo = getCurrencyInfo(currencySymbol);
  
  // Use appropriate locale formatting
  const locale = currencyInfo.code === 'INR' ? 'en-IN' : 
                 currencyInfo.code === 'EUR' ? 'de-DE' : 
                 currencyInfo.code === 'GBP' ? 'en-GB' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyInfo.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}