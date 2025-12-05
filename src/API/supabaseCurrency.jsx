import { supabase } from '../client';

export const supabaseCurrencyService = {
  // Get all active currency pairs (read-only)
  async getCurrencyPairs() {
    try {
      const { data, error } = await supabase
        .from('currency_pairs')
        .select('*')
        .eq('is_active', true)
        .order('pair');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching currency pairs from Supabase:', error);
      throw error;
    }
  }
};