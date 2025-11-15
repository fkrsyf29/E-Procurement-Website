/**
 * Format date to DD-MMM-YYYY format
 * @param dateString - Date string in YYYY-MM-DD or ISO format
 * @returns Formatted date string (e.g., "10-Jan-2025")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Parse date - handle both YYYY-MM-DD and ISO string formats
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    // If invalid date, try parsing YYYY-MM-DD format
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      const monthName = months[parseInt(month, 10) - 1];
      return `${day}-${monthName}-${year}`;
    }
    return dateString; // Return original if cannot parse
  }
  
  // Format as DD-MMM-YYYY
  const day = date.getDate().toString().padStart(2, '0');
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}-${monthName}-${year}`;
}

/**
 * Parse date string for comparison
 * @param dateString - Date string in DD-MMM-YYYY or YYYY-MM-DD format
 * @returns Date object
 */
export function parseDate(dateString: string): Date {
  // If format is YYYY-MM-DD
  if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
    return new Date(dateString);
  }
  // If format is DD-MMM-YYYY
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const day = parts[0];
    const monthIndex = months.indexOf(parts[1]);
    const year = parts[2];
    return new Date(parseInt(year), monthIndex, parseInt(day));
  }
  return new Date(dateString);
}

/**
 * Format number as currency (USD)
 * @param amount - Number to format
 * @returns Formatted currency string (e.g., "$1,234")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with thousands separator (no decimal places)
 * @param value - String or number to format
 * @returns Formatted number string (e.g., "1,000,000")
 */
export function formatNumberWithSeparator(value: string | number): string {
  if (!value && value !== 0) return '';
  
  // Convert to number and remove any non-numeric characters except decimal point
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/,/g, '')) 
    : value;
  
  if (isNaN(numericValue)) return '';
  
  // Format with thousands separator (no decimal places)
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

/**
 * Parse formatted number string to raw number
 * @param formattedValue - Formatted string (e.g., "1,000,000.00")
 * @returns Raw number value
 */
export function parseFormattedNumber(formattedValue: string): number {
  if (!formattedValue) return 0;
  
  // Remove thousands separators and parse
  const cleaned = formattedValue.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format currency without commas (for Sourcing Documents)
 * Displays whole numbers only (no decimal points)
 * @param amount - Number to format
 * @returns Formatted amount string without commas (e.g., "$185000000")
 */
export function formatCurrencyNoCommas(amount: number): string {
  if (!amount && amount !== 0) return '$0';
  // Round to integer and add $ prefix without commas
  return `$${Math.round(amount)}`;
}
