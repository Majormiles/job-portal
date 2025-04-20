// Payment Portal Action Functions

/**
 * Format currency values for display
 * @param {number} amount - The amount to format
 * @param {string} currencySymbol - The currency symbol (default: ₵)
 * @return {string} Formatted currency string
 */
export const formatCurrency = (amount, currencySymbol = '₵') => {
  return `${currencySymbol}${parseFloat(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Get color classes for transaction status badges
 * @param {string} status - The transaction status
 * @return {string} CSS classes for the status
 */
export const getStatusColorClasses = (status) => {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
    case 'SUCCESS':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'REFUNDED':
      return 'bg-purple-100 text-purple-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Format date for display
 * @param {string} dateString - The date string to format
 * @param {object} options - Formatting options
 * @return {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

/**
 * Generate a unique transaction reference
 * @param {string} prefix - Optional prefix for the reference
 * @return {string} Unique transaction reference
 */
export const generateTransactionReference = (prefix = 'TXN') => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Calculate transaction fee based on amount and user type
 * @param {number} amount - Transaction amount
 * @param {string} userType - Type of user
 * @return {number} Calculated fee
 */
export const calculateTransactionFee = (amount, userType) => {
  const feeRates = {
    jobSeeker: 0.025, // 2.5%
    employer: 0.035,  // 3.5%
    trainer: 0.03,    // 3%
    trainee: 0.02     // 2%
  };
  
  const rate = feeRates[userType] || 0.03; // Default fee rate
  return parseFloat((amount * rate).toFixed(2));
};

/**
 * Export data to different formats
 * @param {array} data - Data to export
 * @param {string} format - Export format (csv, pdf, excel, etc)
 * @param {string} filename - Name for the exported file
 */
export const exportData = (data, format, filename) => {
  // Mock implementation for file export
  console.log(`Exporting ${data.length} records to ${format} format as ${filename}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: `Successfully exported to ${format}` });
    }, 800);
  });
}; 