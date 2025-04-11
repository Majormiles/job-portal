/**
 * Utility functions for formatting data in the UI
 */

/**
 * Format a date to a readable string
 * @param {string} dateString - ISO date string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Default options
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format salary with currency
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @returns {string} Formatted salary range
 */
export const formatSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return 'Not specified';
  
  // Currency formatting options
  const formatOptions = {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  };
  
  // Format the values
  try {
    const formatter = new Intl.NumberFormat('en-US', formatOptions);
    
    if (min && max) {
      // If both min and max are provided, show a range
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      // If only min is provided
      return `From ${formatter.format(min)}`;
    } else if (max) {
      // If only max is provided
      return `Up to ${formatter.format(max)}`;
    }
  } catch (error) {
    console.error('Error formatting salary:', error);
    return `${min || 0} - ${max || 0} ${currency}`;
  }
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size with unit
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};

/**
 * Capitalize the first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format a number with thousands separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US').format(number);
}; 