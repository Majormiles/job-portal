import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, FileText, Download, Calendar, User, DollarSign,
  RefreshCw, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchAllReceipts, exportReceipts } from '../../../services/receiptService';
import '../css/admin-dashboard.css';

const ReceiptManagement = () => {
  // State for receipts and filters
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    userRole: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Fetch receipts on component mount and when filters change
  useEffect(() => {
    const loadReceipts = async () => {
      try {
        setLoading(true);
        
        // For now, let's create some mock data
        // In production, this would be:
        // const response = await fetchAllReceipts({ 
        //   ...filters, 
        //   page: currentPage, 
        //   sortField, 
        //   sortDirection,
        //   searchTerm
        // });
        // setReceipts(response.data);
        // setTotalPages(response.pagination.totalPages);

        // Mock data
        const mockReceipts = [
          {
            id: 'rcpt-1',
            referenceNumber: 'INV-10045',
            userName: 'John Doe',
            userRole: 'jobSeeker',
            email: 'johndoe@example.com',
            phoneNumber: '+233 24 123 4567',
            amount: 50,
            date: new Date(2023, 9, 15).toISOString(),
            transactionId: 'TXN-67890',
            paymentMethod: 'Card Payment'
          },
          {
            id: 'rcpt-2',
            referenceNumber: 'INV-10046',
            userName: 'Jane Smith',
            userRole: 'employer',
            email: 'janesmith@company.com',
            phoneNumber: '+233 24 987 6543',
            amount: 100,
            date: new Date(2023, 9, 16).toISOString(),
            transactionId: 'TXN-12345',
            paymentMethod: 'Mobile Money'
          },
          {
            id: 'rcpt-3',
            referenceNumber: 'INV-10047',
            userName: 'David Wilson',
            userRole: 'trainer',
            email: 'david@training.com',
            phoneNumber: '+233 24 555 7777',
            amount: 100,
            date: new Date(2023, 9, 17).toISOString(),
            transactionId: 'TXN-24680',
            paymentMethod: 'Bank Transfer'
          },
          {
            id: 'rcpt-4',
            referenceNumber: 'INV-10048',
            userName: 'Sarah Johnson',
            userRole: 'trainee',
            email: 'sarah@example.com',
            phoneNumber: '+233 24 888 9999',
            amount: 50,
            date: new Date(2023, 9, 18).toISOString(),
            transactionId: 'TXN-13579',
            paymentMethod: 'Card Payment'
          }
        ];

        // Apply filters to mock data
        let filteredReceipts = [...mockReceipts];
        
        // Apply role filter
        if (filters.userRole) {
          filteredReceipts = filteredReceipts.filter(receipt => 
            receipt.userRole === filters.userRole
          );
        }
        
        // Apply date filters
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          filteredReceipts = filteredReceipts.filter(receipt => 
            new Date(receipt.date) >= startDate
          );
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59); // End of day
          filteredReceipts = filteredReceipts.filter(receipt => 
            new Date(receipt.date) <= endDate
          );
        }
        
        // Apply amount filters
        if (filters.minAmount) {
          filteredReceipts = filteredReceipts.filter(receipt => 
            receipt.amount >= parseFloat(filters.minAmount)
          );
        }
        
        if (filters.maxAmount) {
          filteredReceipts = filteredReceipts.filter(receipt => 
            receipt.amount <= parseFloat(filters.maxAmount)
          );
        }
        
        // Apply search
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredReceipts = filteredReceipts.filter(receipt => 
            receipt.userName.toLowerCase().includes(searchLower) ||
            receipt.email.toLowerCase().includes(searchLower) ||
            receipt.referenceNumber.toLowerCase().includes(searchLower) ||
            receipt.transactionId.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply sorting
        filteredReceipts.sort((a, b) => {
          let comparison = 0;
          
          if (sortField === 'date') {
            comparison = new Date(a.date) - new Date(b.date);
          } else if (sortField === 'amount') {
            comparison = a.amount - b.amount;
          } else if (sortField === 'userName') {
            comparison = a.userName.localeCompare(b.userName);
          } else if (sortField === 'referenceNumber') {
            comparison = a.referenceNumber.localeCompare(b.referenceNumber);
          }
          
          return sortDirection === 'asc' ? comparison : -comparison;
        });
        
        setReceipts(filteredReceipts);
        setTotalPages(Math.ceil(filteredReceipts.length / 10) || 1);
        
      } catch (error) {
        console.error('Error fetching receipts:', error);
        toast.error('Failed to load receipts');
      } finally {
        setLoading(false);
      }
    };

    loadReceipts();
  }, [filters, currentPage, sortField, sortDirection, searchTerm]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already applied in the useEffect
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      userRole: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      toast.loading(`Exporting receipts as ${format.toUpperCase()}...`);
      
      // In production, this would be:
      // const blob = await exportReceipts(filters, format);
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `receipt-export-${new Date().toISOString().split('T')[0]}.${format}`;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.dismiss();
      toast.success(`Receipts exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Error exporting receipts as ${format}:`, error);
      toast.dismiss();
      toast.error(`Failed to export receipts: ${error.message || ''}`);
    }
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Format functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₵${parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatUserRole = (role) => {
    const roleMap = {
      'jobSeeker': 'Job Seeker',
      'employer': 'Employer',
      'trainer': 'Trainer',
      'trainee': 'Trainee'
    };
    return roleMap[role] || role;
  };

  // Pagination
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <FileText className="h-6 w-6 text-blue-600 mr-2" />
          <h1>Receipt Management</h1>
        </div>
        <div className="admin-page-actions">
          <button 
            onClick={() => handleExport('csv')}
            className="action-btn"
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            className="action-btn primary"
          >
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="admin-page-toolbar">
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search by name, email, transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
        
        <div className="filter-section">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="filter-toggle-btn"
          >
            <Filter className="h-4 w-4 mr-1" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {showFilters && (
            <div className="filters-container">
              <div className="filter-row">
                <div className="filter-group">
                  <label>User Role</label>
                  <select
                    name="userRole"
                    value={filters.userRole}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="">All Roles</option>
                    <option value="jobSeeker">Job Seeker</option>
                    <option value="employer">Employer</option>
                    <option value="trainer">Trainer</option>
                    <option value="trainee">Trainee</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="filter-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="filter-input"
                  />
                </div>
              </div>
              
              <div className="filter-row">
                <div className="filter-group">
                  <label>Min Amount (₵)</label>
                  <input
                    type="number"
                    name="minAmount"
                    value={filters.minAmount}
                    onChange={handleFilterChange}
                    className="filter-input"
                    min="0"
                    step="1"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Max Amount (₵)</label>
                  <input
                    type="number"
                    name="maxAmount"
                    value={filters.maxAmount}
                    onChange={handleFilterChange}
                    className="filter-input"
                    min="0"
                    step="1"
                  />
                </div>
                
                <div className="filter-actions">
                  <button
                    onClick={handleClearFilters}
                    className="clear-filters-btn"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="admin-data-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading receipts...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="empty-state">
            <FileText className="h-12 w-12 text-gray-400 mb-2" />
            <h3>No Receipts Found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th 
                      onClick={() => handleSort('referenceNumber')}
                      className="sortable-header"
                    >
                      <div className="header-content">
                        <span>Receipt #</span>
                        {sortField === 'referenceNumber' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="sort-icon" /> : 
                            <ChevronDown className="sort-icon" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('userName')}
                      className="sortable-header"
                    >
                      <div className="header-content">
                        <span>User</span>
                        {sortField === 'userName' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="sort-icon" /> : 
                            <ChevronDown className="sort-icon" />
                        )}
                      </div>
                    </th>
                    <th>Role</th>
                    <th>Email</th>
                    <th 
                      onClick={() => handleSort('date')}
                      className="sortable-header"
                    >
                      <div className="header-content">
                        <span>Date</span>
                        {sortField === 'date' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="sort-icon" /> : 
                            <ChevronDown className="sort-icon" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('amount')}
                      className="sortable-header"
                    >
                      <div className="header-content">
                        <span>Amount</span>
                        {sortField === 'amount' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="sort-icon" /> : 
                            <ChevronDown className="sort-icon" />
                        )}
                      </div>
                    </th>
                    <th>Payment Method</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map(receipt => (
                    <tr key={receipt.id}>
                      <td>{receipt.referenceNumber}</td>
                      <td>{receipt.userName}</td>
                      <td>
                        <span className={`role-badge ${receipt.userRole}`}>
                          {formatUserRole(receipt.userRole)}
                        </span>
                      </td>
                      <td>{receipt.email}</td>
                      <td>{formatDate(receipt.date)}</td>
                      <td className="amount-cell">{formatCurrency(receipt.amount)}</td>
                      <td>{receipt.paymentMethod}</td>
                      <td className="actions-cell">
                        <button 
                          className="icon-btn primary"
                          title="View Receipt"
                          onClick={() => window.open(`/admin/receipts/${receipt.id}`, '_blank')}
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button 
                          className="icon-btn"
                          title="Download Receipt"
                          onClick={() => handleExport('pdf')}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pagination-controls">
              <div className="pagination-info">
                Showing {receipts.length} of {receipts.length} receipts
              </div>
              <div className="pagination-buttons">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-current">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiptManagement; 