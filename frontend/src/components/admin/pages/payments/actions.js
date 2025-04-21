// Payment Portal Action Functions
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    case 'SUCCESSFUL':
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

/**
 * Fetch payment dashboard stats from API
 * @param {string} timeFilter - Time filter for stats (daily, weekly, monthly, yearly)
 * @return {Promise} Promise resolving to payment stats 
 */
export const fetchPaymentStats = async (timeFilter = 'monthly') => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    
    const response = await axios.get(`${API_URL}/payment/admin/stats`, {
      params: { timeFilter },
      headers: {
        Authorization: adminToken ? `Bearer ${adminToken}` : ''
      }
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch payment stats');
    }
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw error;
  }
};

/**
 * Fetch transactions from API
 * @param {object} filters - Filter criteria
 * @param {number} page - Page number for pagination
 * @param {number} limit - Results per page
 * @return {Promise} Promise resolving to transactions data
 */
export const fetchTransactions = async (filters = {}, page = 1, limit = 10) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    
    const response = await axios.get(`${API_URL}/payment/admin/transactions`, {
      params: { 
        ...filters,
        page,
        limit
      },
      headers: {
        Authorization: adminToken ? `Bearer ${adminToken}` : ''
      }
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch transactions');
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Fetch payment analytics data from API
 * @param {string} timeRange - Time range for analytics
 * @param {boolean} comparisonMode - Whether to include comparison data
 * @return {Promise} Promise resolving to analytics data
 */
export const fetchPaymentAnalytics = async (timeRange = 'monthly', comparisonMode = false) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    
    const response = await axios.get(`${API_URL}/payment/admin/analytics`, {
      params: { 
        timeRange,
        comparison: comparisonMode 
      },
      headers: {
        Authorization: adminToken ? `Bearer ${adminToken}` : ''
      }
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch payment analytics');
    }
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    throw error;
  }
};

/**
 * Generate payment reports from API
 * @param {object} reportOptions - Report configuration options
 * @return {Promise} Promise resolving to report data
 */
export const generatePaymentReport = async (reportOptions = {}) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    
    const response = await axios.get(`${API_URL}/payment/admin/reports`, {
      params: reportOptions,
      headers: {
        Authorization: adminToken ? `Bearer ${adminToken}` : ''
      }
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to generate payment report');
    }
  } catch (error) {
    console.error('Error generating payment report:', error);
    throw error;
  }
};

/**
 * Fetch a single transaction by ID
 * @param {string} id - Transaction ID
 * @return {Promise} Promise resolving to transaction data
 */
export const fetchTransactionById = async (id) => {
  try {
    if (!id) {
      throw new Error('Transaction ID is required');
    }
    
    const adminToken = localStorage.getItem('adminToken');
    
    // Step 1: Instead of using a direct path parameter, use query parameters which are more flexible
    // This API approach is less likely to have routing issues with special characters in IDs
    try {
      const response = await axios.get(`${API_URL}/payment/admin/transactions`, {
        params: { 
          id,
          reference: id, // Try to match by both id and reference
          single: true,  // Flag to return a single result
          limit: 1
        },
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : ''
        }
      });
      
      if (response.data.success && response.data.data.transactions && response.data.data.transactions.length > 0) {
        return response.data.data.transactions[0];
      }
    } catch (directError) {
      console.log('First transaction fetch approach failed, trying alternative...', directError);
    }
    
    // Step 2: If the first approach fails, try a different endpoint structure
    try {
      const response = await axios.get(`${API_URL}/payment/transactions/find`, {
        params: { 
          identifier: id  // Generic identifier field
        },
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : ''
        }
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (error) {
      console.log('Second transaction fetch approach failed, trying final approach...', error);
    }
    
    // Step 3: Final approach - get all transactions and filter client-side
    const allTransactionsResponse = await axios.get(`${API_URL}/payment/admin/transactions`, {
      params: { limit: 100 }, // Get more transactions to increase chances of finding the one we want
      headers: {
        Authorization: adminToken ? `Bearer ${adminToken}` : ''
      }
    });
    
    if (!allTransactionsResponse.data.success) {
      throw new Error(allTransactionsResponse.data.message || 'Failed to fetch transactions');
    }
    
    const transactions = allTransactionsResponse.data.data.transactions || [];
    
    // Find transaction by ID, reference, or any other possible identifier
    // We're doing this comprehensive check to handle various ID formats
    const transaction = transactions.find(t => {
      const possibleIds = [
        t._id, 
        t.id, 
        t.reference, 
        t.transactionId,
        t.txnId,
        t.paymentId,
        t.orderId
      ].filter(Boolean); // Remove any null/undefined values
      
      // Check if any of the transaction's IDs match the requested ID
      return possibleIds.some(possibleId => 
        // Exact match
        possibleId === id || 
        // Case-insensitive match
        possibleId?.toLowerCase() === id?.toLowerCase() ||
        // Contains match (for partial IDs)
        possibleId?.includes(id) ||
        id?.includes(possibleId)
      );
    });
    
    if (transaction) {
      return transaction;
    }
    
    throw new Error(`Transaction with identifier "${id}" not found`);
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    throw error;
  }
}; 