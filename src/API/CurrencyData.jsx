import { useState, useEffect } from 'react';
import { supabaseCurrencyService } from './supabaseCurrency';

export const CurrencyData = (refreshInterval = 300000) => {
  const [majorPairs, setMajorPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrencyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the currency pairs list from Supabase
      const supabaseData = await supabaseCurrencyService.getCurrencyPairs();
      
      const rates = [];
      let hasApiError = false;

      for (const pairData of supabaseData) {
        try {
          const data = await alphaVantageService.getExchangeRate(
            pairData.base_currency, 
            pairData.quote_currency
          );
          
          // Extract and format data from API response
          const exchangeRate = parseFloat(data['5. Exchange Rate']) || 0;
          const previousClose = parseFloat(data['8. Previous Close']) || exchangeRate;
          const change = exchangeRate - previousClose;
          const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
          
          rates.push({
            pair: pairData.pair,
            price: exchangeRate > 0 ? exchangeRate.toFixed(4) : 'N/A',
            change: change.toFixed(4),
            changePercent: changePercent.toFixed(2),
            volume: pairData.volume
          });

          // Add delay between API calls to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (apiError) {
          console.error(`Failed to fetch real data for ${pairData.pair}:`, apiError);
          hasApiError = true;
          
          // Use Supabase data as fallback for this pair
          rates.push({
            pair: pairData.pair,
            price: parseFloat(pairData.price).toFixed(4),
            change: parseFloat(pairData.change).toFixed(4),
            changePercent: parseFloat(pairData.change_percent).toFixed(2),
            volume: pairData.volume
          });
        }
      }

      setMajorPairs(rates);
      
      if (hasApiError) {
        setError('Some currency rates failed to load from live API. Using stored data.');
      }
      
    } catch (err) {
      console.error('Error in fetchCurrencyData:', err);
      setError('Failed to load currency data. Please try again later.');
      setMajorPairs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencyData();
    
    const intervalId = setInterval(fetchCurrencyData, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  return { 
    majorPairs, 
    loading, 
    error,
    refreshData: fetchCurrencyData 
  };
};