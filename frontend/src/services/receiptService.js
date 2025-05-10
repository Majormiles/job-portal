import axios from 'axios';

/**
 * Fetch receipts for a specific user
 * @param {string} userId - The user's ID
 * @returns {Promise} - The receipts data
 */
export const fetchUserReceipts = async (userId) => {
  try {
    const response = await axios.get(`/api/receipts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user receipts:', error);
    throw error;
  }
};

/**
 * Generate receipt for a payment
 * @param {Object} paymentData - Payment information
 * @returns {Promise} - The generated receipt
 */
export const generateReceipt = async (paymentData) => {
  try {
    const response = await axios.post('/api/receipts/generate', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
};

/**
 * Get a single receipt by ID
 * @param {string} receiptId - Receipt ID
 * @returns {Promise} - The receipt data
 */
export const getReceiptById = async (receiptId) => {
  try {
    const response = await axios.get(`/api/receipts/${receiptId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching receipt:', error);
    throw error;
  }
};

/**
 * Download receipt as PDF
 * @param {string} receiptId - Receipt ID
 * @returns {Promise} - The PDF download response
 */
export const downloadReceipt = async (receiptId) => {
  try {
    const response = await axios.get(`/api/receipts/${receiptId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading receipt:', error);
    throw error;
  }
};

/**
 * Create a receipt automatically from a payment
 * This is used by the payment system to automatically generate a receipt
 * @param {Object} paymentData - Complete payment information
 * @returns {Promise} - The created receipt
 */
export const createReceiptFromPayment = async (paymentData) => {
  try {
    const receiptData = {
      userId: paymentData.userId,
      userName: paymentData.userName,
      email: paymentData.email,
      phoneNumber: paymentData.phoneNumber,
      accountType: paymentData.userRole,
      userRole: paymentData.userRole,
      amount: paymentData.amount,
      transactionId: paymentData.transactionId,
      referenceNumber: paymentData.reference,
      paymentMethod: paymentData.paymentMethod,
      date: paymentData.date || new Date().toISOString(),
      location: paymentData.location || 'Ghana'
    };
    
    return await generateReceipt(receiptData);
  } catch (error) {
    console.error('Error creating receipt from payment:', error);
    throw error;
  }
};

// For admin functions
/**
 * Fetch all receipts (admin only)
 * @param {Object} filters - Optional filters
 * @returns {Promise} - The receipts data
 */
export const fetchAllReceipts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.userRole) queryParams.append('userRole', filters.userRole);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.minAmount) queryParams.append('minAmount', filters.minAmount);
    if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount);
    if (filters.searchTerm) queryParams.append('search', filters.searchTerm);
    
    const response = await axios.get(`/api/admin/receipts?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all receipts:', error);
    throw error;
  }
};

/**
 * Export receipts as CSV or PDF (admin only)
 * @param {Object} filters - Filters for receipts to export
 * @param {string} format - Export format ('csv' or 'pdf')
 * @returns {Promise} - The export response
 */
export const exportReceipts = async (filters = {}, format = 'csv') => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.userRole) queryParams.append('userRole', filters.userRole);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.minAmount) queryParams.append('minAmount', filters.minAmount);
    if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount);
    
    // Add format parameter
    queryParams.append('format', format);
    
    const response = await axios.get(`/api/admin/receipts/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error exporting receipts as ${format}:`, error);
    throw error;
  }
};

/**
 * Get receipt analytics (admin only)
 * @param {Object} params - Parameters for analytics
 * @returns {Promise} - The analytics data
 */
export const getReceiptAnalytics = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.period) queryParams.append('period', params.period);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const response = await axios.get(`/api/admin/receipts/analytics?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching receipt analytics:', error);
    throw error;
  }
}; 