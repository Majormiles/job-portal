// Payment Portal Action Functions
import axios from 'axios';
import { exportReportData } from './reportUtils';

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
  // Use full timestamp with milliseconds for higher uniqueness
  const timestamp = Date.now();
  // Add more randomness with larger random number
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  // Add a unique component based on a UUID-like approach
  const uniqueId = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${timestamp}-${random}-${uniqueId}`;
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
export const exportData = async (data, format, filename) => {
  try {
    return await exportReportData(data, format, filename);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
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
    
    // Create a copy of filters to avoid modifying the original
    const apiFilters = { ...filters };
    
    // Handle exact ID matching for search queries
    if (apiFilters.exactMatch && (apiFilters.searchQuery || apiFilters.exactId)) {
      // If exactId is explicitly specified, use it directly
      if (apiFilters.exactId) {
        console.log(`Searching for exact transaction ID: ${apiFilters.exactId}`);
      }
      // Otherwise, use searchQuery as a fallback
      else if (apiFilters.searchQuery) {
        apiFilters.exactId = apiFilters.searchQuery;
        console.log(`Using search query as exact ID: ${apiFilters.exactId}`);
      }
    }
    
    // Handle payment status explicitly to ensure proper filtering
    if (apiFilters.paymentStatus && apiFilters.paymentStatus !== 'all') {
      // We're explicitly setting it to make sure it's passed correctly
      apiFilters.paymentStatus = apiFilters.paymentStatus.toLowerCase();
      console.log(`Filtering by payment status: ${apiFilters.paymentStatus}`);
    }
    
    // When debugging issues with transaction search, uncomment this line:
    console.log('API filters:', apiFilters);
    
    const response = await axios.get(`${API_URL}/payment/admin/transactions`, {
      params: { 
        ...apiFilters,
        page,
        limit
      },
      headers: {
        Authorization: adminToken ? `Bearer ${adminToken}` : ''
      }
    });
    
    if (response.data.success) {
      // Log the status distribution of returned transactions for debugging
      if (response.data.data.transactions && response.data.data.transactions.length > 0) {
        const statusCounts = response.data.data.transactions.reduce((acc, t) => {
          const status = t.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        console.log('Transaction status distribution:', statusCounts);
      }
      
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
    
    // Extract the unique parts from a transaction ID if present
    const extractIdentifiers = (transactionId) => {
      // Array to hold all possible identifiers from this ID
      const identifiers = [transactionId]; // Always include the full ID
      
      // Handle complex transaction IDs with multiple parts
      if (transactionId.includes('-')) {
        // Add each segment as a potential identifier
        const segments = transactionId.split('-').filter(Boolean);
        segments.forEach(segment => {
          if (segment.length >= 4) { // Only include meaningful segments
            identifiers.push(segment);
          }
        });
        
        // Add combinations like "TRX-REF-12345"
        if (segments.length >= 3) {
          identifiers.push(`${segments[0]}-${segments[1]}-${segments[2]}`);
        }
        
        // Add reference without TRX prefix
        if (transactionId.startsWith('TRX-')) {
          identifiers.push(transactionId.substring(4));
        }
      }
      
      // Remove duplicates and return
      return [...new Set(identifiers)];
    };
    
    // Get potential identifiers from the ID
    const identifiers = extractIdentifiers(id);
    console.log('Searching with identifiers:', identifiers);
    
    // Step 1: Try to find using the exactId parameter with all possible identifiers
    try {
      for (const identifier of identifiers) {
        const response = await axios.get(`${API_URL}/payment/admin/transactions`, {
          params: { 
            exactId: identifier,
            single: true,
            limit: 1
          },
          headers: {
            Authorization: adminToken ? `Bearer ${adminToken}` : ''
          }
        });
        
        if (response.data.success && response.data.data.transactions && response.data.data.transactions.length > 0) {
          console.log(`Found transaction using identifier: ${identifier}`);
          return response.data.data.transactions[0];
        }
      }
    } catch (directError) {
      console.log('First transaction fetch approach failed, trying alternative...', directError);
    }
    
    // Step 2: If the first approach fails, try a direct search with query parameter
    try {
      const response = await axios.get(`${API_URL}/payment/admin/transactions`, {
        params: { 
          searchQuery: id,
          limit: 10
        },
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : ''
        }
      });
      
      if (response.data.success && response.data.data.transactions && response.data.data.transactions.length > 0) {
        // Look for an exact match first
        const exactMatch = response.data.data.transactions.find(t => 
          t.id === id || t.reference === id
        );
        
        if (exactMatch) {
          return exactMatch;
        }
        
        // If no exact match, look for partial matches
        const partialMatches = response.data.data.transactions.filter(t => {
          const possibleIds = [
            t.id, 
            t.reference
          ].filter(Boolean);
          
          return possibleIds.some(pid => 
            pid.includes(id) || id.includes(pid)
          );
        });
        
        if (partialMatches.length > 0) {
          // Return the first partial match
          return partialMatches[0];
        }
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
    const transaction = transactions.find(t => {
      const possibleIds = [
        t.id, 
        t.reference, 
        t._id,
        t.transactionId
      ].filter(Boolean);
      
      // Check if any of the transaction's IDs match any of our extracted identifiers
      return possibleIds.some(possibleId => 
        identifiers.some(identifier => 
          possibleId === identifier || 
          possibleId?.includes(identifier) || 
          identifier.includes(possibleId)
        )
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