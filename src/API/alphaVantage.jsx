// Cache to store API responses to minimize calls
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Use your actual API key directly as a fallback
const DEFAULT_API_KEY = 'M7NWN5CFB00RIK5C';

// Function to get API key with better error handling
const getApiKey = () => {
  // First try to get from environment variable
  const envKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
  
  // If environment variable is set and valid, use it
  if (envKey && envKey !== 'your_alpha_vantage_api_key_here' && envKey !== 'demo') {
    return envKey;
  }
  
  // Otherwise use the hardcoded key as fallback
  console.warn('Using fallback API key. Consider setting VITE_ALPHA_VANTAGE_API_KEY in your .env file.');
  return DEFAULT_API_KEY;
};

export const alphaVantageService = {
  async getExchangeRate(fromCurrency, toCurrency) {
    const API_KEY = getApiKey();
    
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cached = responseCache.get(cacheKey);
    
    // Return cached response if available and not expired
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for API rate limit error
      if (data['Note'] && data['Note'].includes('API call frequency')) {
        throw new Error('API_RATE_LIMIT');
      }
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      // Check if we have the expected data structure
      if (!data['Realtime Currency Exchange Rate']) {
        throw new Error('Invalid API response format');
      }
      
      // Cache the successful response
      responseCache.set(cacheKey, {
        data: data['Realtime Currency Exchange Rate'],
        timestamp: Date.now()
      });
      
      return data['Realtime Currency Exchange Rate'];
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      
      // If we have a cached response, return it even if it's expired
      if (cached) {
        console.log('Using expired cached data due to API error');
        return cached.data;
      }
      
      throw error;
    }
  }
};