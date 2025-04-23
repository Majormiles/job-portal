import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Check, X, Eye, RefreshCw } from 'lucide-react';
import { formatDate, getStatusColorClasses, fetchTransactions, exportData } from './actions';
import { toast } from 'react-hot-toast';
import '../../css/payment-portal.css';
import { Link } from 'react-router-dom';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    paymentStatus: 'all',
    userType: 'all',
    searchQuery: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const transactionsPerPage = 10;

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      
      const apiFilters = {...filters};
      
      // If searchTerm is an exact ID match (e.g., TRX-XXXXX, REF-XXXXX format), prioritize it
      if (searchTerm.trim()) {
        apiFilters.searchQuery = searchTerm.trim();
        
        // Enhanced pattern matching to catch all transaction ID formats
        // This pattern now properly handles combined prefixes like "TRX-REF-1745402"
        if (searchTerm.trim().includes('TRX-') || searchTerm.trim().includes('REF-') || 
            /^[A-Za-z0-9\-]+$/.test(searchTerm.trim())) {
          apiFilters.exactMatch = true;
          // For exact ID searches, we want to pass the raw ID without modifications
          apiFilters.exactId = searchTerm.trim();
        }
      }
      
      const result = await fetchTransactions(apiFilters, currentPage, transactionsPerPage);
      
      // Process transactions to avoid duplicates by using a Map with reference or id as key
      const transactionsMap = new Map();
      
      result.transactions.forEach(transaction => {
        const key = transaction.reference || transaction.id || transaction._id;
        if (key && !transactionsMap.has(key)) {
          transactionsMap.set(key, transaction);
        }
      });
      
      // Convert Map back to array
      const uniqueTransactions = Array.from(transactionsMap.values());
      
      setTransactions(uniqueTransactions);
      setTotalTransactions(result.pagination.total);
      setTotalPages(result.pagination.pages);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filters, currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only reload if the search term has changed
      if (searchTerm.trim() !== filters.searchQuery) {
        setCurrentPage(1); // Reset to first page on new search
        setFilters(prev => ({
          ...prev,
          searchQuery: searchTerm.trim()
        }));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      paymentStatus: 'all',
      userType: 'all',
      searchQuery: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const applyFilters = () => {
    loadTransactions();
    setShowFilters(false);
  };

  const handleExport = async (format) => {
    try {
      setIsLoading(true);
      toast.loading('Preparing export...');
      
      const result = await exportData(transactions, format, `payment-transactions-${Date.now()}.${format}`);
      
      toast.dismiss();
      toast.success(result.message);
      setIsLoading(false);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export data');
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'successful':
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'awaiting':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'declined':
      case 'cancelled':
      case 'canceled':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'refunded':
      case 'reversed':
      case 'chargeback':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    
    // Make first letter uppercase and rest lowercase
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    // Map similar statuses to consistent display names
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'Successful';
      case 'cancelled':
        return 'Canceled';
      case 'awaiting':
        return 'Pending';
      case 'reversed':
      case 'chargeback':
        return 'Refunded';
      default:
        return formattedStatus;
    }
  };

  const getUserTypeLabel = (userType) => {
    if (!userType) return 'Unknown';
    
    switch (userType) {
      case 'jobSeeker':
        return 'Job Seeker';
      case 'employer':
        return 'Employer';
      case 'trainer':
        return 'Trainer';
      case 'trainee':
        return 'Trainee';
      default:
        return userType;
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Add this helper function to format transaction IDs for display
  const formatTransactionId = (id) => {
    // If the ID is very long, truncate it for display purposes
    if (id && id.length > 20) {
      return `${id.substring(0, 20)}...`;
    }
    return id || "N/A";
  };

  return (
    <div className="section-body">
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Transactions</h1>
          <p className="text-gray-500">View and manage all payment transactions</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button 
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    name="dateRange"
                    value={filters.dateRange}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={filters.paymentStatus}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="successful">Successful</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    name="userType"
                    value={filters.userType}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm"
                  >
                    <option value="all">All Users</option>
                    <option value="jobSeeker">Job Seekers</option>
                    <option value="employer">Employers</option>
                    <option value="trainer">Trainers</option>
                    <option value="trainee">Trainees</option>
                  </select>
                </div>
                
                <div className="flex justify-end">
                  <button
                    className="text-sm text-gray-500 hover:text-gray-700 mr-3"
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                  <button
                    className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-blue-700"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative group">
            <button className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden group-hover:block">
              <ul className="py-1">
                <li>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleExport('csv')}
                  >
                    Export as CSV
                  </button>
                </li>
                <li>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleExport('pdf')}
                  >
                    Export as PDF
                  </button>
                </li>
                <li>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleExport('excel')}
                  >
                    Export as Excel
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <button 
            className="bg-white border border-gray-300 rounded-lg p-2 text-gray-600 hover:bg-gray-50"
            onClick={() => loadTransactions()}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by reference, name, email or ID..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              loadTransactions();
            }
          }}
        />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Reference
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  // Generate a reliable key based on transaction ID or reference
                  const transactionKey = transaction.id || transaction._id || transaction.reference;
                  
                  return (
                    <tr key={transactionKey} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatTransactionId(transaction.id)}</div>
                        <div className="text-xs text-gray-500">{transaction.reference || "No reference"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.userName || "Unknown user"}</div>
                        <div className="text-xs text-gray-500">{getUserTypeLabel(transaction.userType)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₵{transaction.amount ? transaction.amount.toFixed(2) : "0.00"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.date ? formatDate(transaction.date) : "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {formatStatus(transaction.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.paymentMethod || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/admin/payments/transactions/${transaction.id || transaction._id || transaction.reference}`} className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min(1 + (currentPage - 1) * transactionsPerPage, totalTransactions)}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * transactionsPerPage, totalTransactions)}</span> of{' '}
                <span className="font-medium">{totalTransactions}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === number + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default TransactionsPage; 