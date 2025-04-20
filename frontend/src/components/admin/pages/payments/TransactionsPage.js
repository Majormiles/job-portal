import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Check, X, Eye, RefreshCw } from 'lucide-react';
import '../../css/payment-portal.css';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    paymentStatus: 'all',
    userType: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // Mock transaction data
  const mockTransactions = [
    {
      id: 'TRX-20230501-001',
      userId: 'USR-23145',
      userName: 'James Johnson',
      userType: 'jobSeeker',
      amount: 50,
      date: '2023-05-01T14:32:45',
      status: 'successful',
      paymentMethod: 'Card',
      reference: 'REF-2023050115'
    },
    {
      id: 'TRX-20230502-002',
      userId: 'USR-78532',
      userName: 'Emily Williams',
      userType: 'employer',
      amount: 100,
      date: '2023-05-02T09:14:22',
      status: 'successful',
      paymentMethod: 'Mobile Money',
      reference: 'REF-2023050287'
    },
    {
      id: 'TRX-20230502-003',
      userId: 'USR-45698',
      userName: 'Robert Smith',
      userType: 'trainer',
      amount: 100,
      date: '2023-05-02T11:45:10',
      status: 'successful',
      paymentMethod: 'Card',
      reference: 'REF-2023050290'
    },
    {
      id: 'TRX-20230503-004',
      userId: 'USR-12347',
      userName: 'Sarah Davis',
      userType: 'trainee',
      amount: 50,
      date: '2023-05-03T16:28:33',
      status: 'failed',
      paymentMethod: 'Mobile Money',
      reference: 'REF-2023050375'
    },
    {
      id: 'TRX-20230504-005',
      userId: 'USR-90384',
      userName: 'Michael Brown',
      userType: 'employer',
      amount: 100,
      date: '2023-05-04T08:19:57',
      status: 'pending',
      paymentMethod: 'Bank Transfer',
      reference: 'REF-2023050422'
    },
    {
      id: 'TRX-20230505-006',
      userId: 'USR-67521',
      userName: 'Jennifer White',
      userType: 'jobSeeker',
      amount: 50,
      date: '2023-05-05T13:05:41',
      status: 'successful',
      paymentMethod: 'Card',
      reference: 'REF-2023050563'
    },
    {
      id: 'TRX-20230506-007',
      userId: 'USR-34589',
      userName: 'David Miller',
      userType: 'trainee',
      amount: 50,
      date: '2023-05-06T10:37:29',
      status: 'successful',
      paymentMethod: 'Mobile Money',
      reference: 'REF-2023050618'
    },
    {
      id: 'TRX-20230507-008',
      userId: 'USR-56723',
      userName: 'Lisa Anderson',
      userType: 'trainer',
      amount: 100,
      date: '2023-05-07T15:42:16',
      status: 'successful',
      paymentMethod: 'Card',
      reference: 'REF-2023050739'
    },
    {
      id: 'TRX-20230508-009',
      userId: 'USR-23189',
      userName: 'Thomas Wilson',
      userType: 'employer',
      amount: 100,
      date: '2023-05-08T09:23:51',
      status: 'refunded',
      paymentMethod: 'Mobile Money',
      reference: 'REF-2023050811'
    },
    {
      id: 'TRX-20230509-010',
      userId: 'USR-78943',
      userName: 'Elizabeth Taylor',
      userType: 'jobSeeker',
      amount: 50,
      date: '2023-05-09T14:15:37',
      status: 'successful',
      paymentMethod: 'Card',
      reference: 'REF-2023050944'
    },
    {
      id: 'TRX-20230510-011',
      userId: 'USR-34678',
      userName: 'Richard Martin',
      userType: 'trainee',
      amount: 50,
      date: '2023-05-10T11:28:09',
      status: 'successful',
      paymentMethod: 'Bank Transfer',
      reference: 'REF-2023051027'
    },
    {
      id: 'TRX-20230511-012',
      userId: 'USR-90127',
      userName: 'Patricia Harris',
      userType: 'employer',
      amount: 100,
      date: '2023-05-11T16:37:22',
      status: 'successful',
      paymentMethod: 'Mobile Money',
      reference: 'REF-2023051155'
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call with filters
        // const response = await fetch('/api/admin/transactions?' + new URLSearchParams(filters));
        // const data = await response.json();
        
        // For now, use mock data
        setTimeout(() => {
          setTransactions(mockTransactions);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [filters]);

  // Apply filters and search to transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Search term filter
    const searchMatches = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date range filter
    let dateMatches = true;
    const transactionDate = new Date(transaction.date);
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;
    
    if (filters.dateRange === 'today') {
      dateMatches = transactionDate.toDateString() === today.toDateString();
    } else if (filters.dateRange === 'week') {
      dateMatches = (today - transactionDate) <= oneWeek;
    } else if (filters.dateRange === 'month') {
      dateMatches = (today - transactionDate) <= oneMonth;
    }
    
    // Status filter
    const statusMatches = filters.paymentStatus === 'all' || transaction.status === filters.paymentStatus;
    
    // User type filter
    const userTypeMatches = filters.userType === 'all' || transaction.userType === filters.userType;
    
    return searchMatches && dateMatches && statusMatches && userTypeMatches;
  });

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1); // Reset to first page after filter change
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      paymentStatus: 'all',
      userType: 'all',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const exportTransactions = (format) => {
    // In a real app, this would create and download the export file
    alert(`Exporting transactions in ${format} format...`);
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
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-600';
      case 'failed':
        return 'bg-red-100 text-red-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'refunded':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getUserTypeLabel = (userType) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="section-body">
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment Transactions</h1>
        <p className="text-gray-500">View and manage all payment transactions</p>
      </div>

      {/* Search and filter section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search input */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by ID, name, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter button and export dropdown */}
          <div className="flex gap-3">
            <button
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>

            <div className="relative group">
              <button
                className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                  onClick={() => exportTransactions('csv')}
                >
                  Export as CSV
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                  onClick={() => exportTransactions('excel')}
                >
                  Export as Excel
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                  onClick={() => exportTransactions('pdf')}
                >
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters expanded section */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  id="dateRange"
                  name="dateRange"
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </select>
              </div>
              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.paymentStatus}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="successful">Successful</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <select
                  id="userType"
                  name="userType"
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.userType}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Users</option>
                  <option value="jobSeeker">Job Seekers</option>
                  <option value="employer">Employers</option>
                  <option value="trainer">Trainers</option>
                  <option value="trainee">Trainees</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button 
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100 overflow-x-auto payment-table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Type
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTransactions.length > 0 ? (
              currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{transaction.userName}</div>
                    <div className="text-xs text-gray-400">{transaction.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getUserTypeLabel(transaction.userType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₵{transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {transaction.status === 'pending' && (
                        <>
                          <button className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {transaction.status === 'successful' && (
                        <button className="p-1 text-gray-400 hover:text-purple-500 transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-10 text-center text-gray-500">
                  No transactions found matching your filters. Try adjusting your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstTransaction + 1}</span> to{' '}
                <span className="font-medium">
                  {indexOfLastTransaction > filteredTransactions.length 
                    ? filteredTransactions.length 
                    : indexOfLastTransaction
                  }
                </span>{' '}
                of <span className="font-medium">{filteredTransactions.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
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
                    currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
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