// utils/countries.js
import countryFlagEmoji from "country-flag-emoji";

// Enhanced countries list with calling codes
export const countriesWithCallingCodes = countryFlagEmoji.list
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(country => {
    // Get calling code from country code
    const callingCode = getCallingCode(country.code);
    
    return {
      code: country.code,
      name: country.name,
      emoji: country.emoji,
      callingCode: callingCode,
    };
  });

// Helper function to get calling codes
function getCallingCode(countryCode) {
  const callingCodes = {
    'US': '+1', 'GB': '+44', 'CA': '+1', 'AU': '+61', 'DE': '+49',
    'FR': '+33', 'IT': '+39', 'ES': '+34', 'JP': '+81', 'CN': '+86',
    'IN': '+91', 'BR': '+55', 'NG': '+234', 'ZA': '+27', 'KE': '+254',
    'EG': '+20', 'MA': '+212', 'DZ': '+213', 'GH': '+233', 'ET': '+251',
    'TZ': '+255', 'UG': '+256', 'RW': '+250', 'BI': '+257',
    // European countries
    'AL': '+355', 'AD': '+376', 'AT': '+43', 'BY': '+375', 'BE': '+32',
    'BA': '+387', 'BG': '+359', 'HR': '+385', 'CY': '+357', 'CZ': '+420',
    'DK': '+45', 'EE': '+372', 'FI': '+358', 'GR': '+30', 'HU': '+36',
    'IS': '+354', 'IE': '+353', 'LV': '+371', 'LI': '+423', 'LT': '+370',
    'LU': '+352', 'MT': '+356', 'MD': '+373', 'MC': '+377', 'ME': '+382',
    'NL': '+31', 'MK': '+389', 'NO': '+47', 'PL': '+48', 'PT': '+351',
    'RO': '+40', 'RU': '+7', 'SM': '+378', 'RS': '+381', 'SK': '+421',
    'SI': '+386', 'SE': '+46', 'CH': '+41', 'UA': '+380', 'VA': '+379',
  };
  
  return callingCodes[countryCode] || '+1'; // Default to +1
}

// Also export the original sortedCountries for compatibility
export const sortedCountries = countriesWithCallingCodes;

// Helper to get country by code
export const getCountryByCode = (code) => {
  return countriesWithCallingCodes.find(c => c.code === code);
};

// Helper to get calling code by country code
export const getCallingCodeByCountryCode = (code) => {
  const country = getCountryByCode(code);
  return country?.callingCode || '+1';
};


export function extractCountryCodeFromPhone(phone) {
  if (!phone || phone.trim() === '') {
    return { callingCode: '+234', countryCode: 'NG', number: '' };
  }
  
  // Clean the phone number
  const cleanPhone = phone.trim();
  
  // Check if it's a Nigerian local number (starts with 0)
  if (cleanPhone.startsWith('0')) {
    // This is likely a Nigerian local number like 08012345678
    // Remove the leading 0 and treat it as a Nigerian number
    return {
      callingCode: '+234',
      countryCode: 'NG',
      number: cleanPhone.substring(1) // Remove the leading 0
    };
  }
  
  // Check if it's a Nigerian number without + but with 234
  if (cleanPhone.startsWith('234') && cleanPhone.length > 10) {
    return {
      callingCode: '+234',
      countryCode: 'NG',
      number: cleanPhone.substring(3) // Remove 234 prefix
    };
  }
  
  // For numbers with +, try to match country code
  if (cleanPhone.startsWith('+')) {
    // Find the longest matching country code
    let countryFound = null;
    let maxLength = 0;
    
    const countriesByCodeLength = [...countriesWithCallingCodes].sort(
      (a, b) => b.callingCode.length - a.callingCode.length
    );
    
    for (const country of countriesByCodeLength) {
      if (cleanPhone.startsWith(country.callingCode)) {
        if (country.callingCode.length > maxLength) {
          maxLength = country.callingCode.length;
          countryFound = country;
        }
      }
    }
    
    if (countryFound) {
      return {
        callingCode: countryFound.callingCode,
        countryCode: countryFound.code,
        number: cleanPhone.substring(countryFound.callingCode.length)
      };
    }
  }
  
  // If we get here, default to Nigeria
  return { callingCode: '+234', countryCode: 'NG', number: cleanPhone };
}