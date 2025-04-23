import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaMoneyBillWave, FaHistory, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Make sure we're using the correct API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PaymentSettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    jobSeeker: 50,
    employer: 100,
    trainer: 100,
    trainee: 50,
    currency: 'GHS'
  });
  const [originalSettings, setOriginalSettings] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Check localStorage and admin token
  useEffect(() => {
    // Check admin token in localStorage
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      toast.error('Please login as admin to access this page');
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch payment settings on component mount
  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  // Helper function to get admin role
  const getAdminRole = () => {
    // First try to get from localStorage directly
    const storedRole = localStorage.getItem('adminRole');
    if (storedRole) {
      return storedRole;
    }
    
    // Fallback to parsing from adminUser object
    try {
      const adminUserJson = localStorage.getItem('adminUser');
      if (adminUserJson) {
        const adminUser = JSON.parse(adminUserJson);
        const role = adminUser.roleName || adminUser.role;
        if (role) {
          // Store for future use
          localStorage.setItem('adminRole', role);
          return role;
        }
      }
    } catch (error) {
      console.error('Error getting admin role:', error);
    }
    return null;
  };

  // Helper function to format fee type for display
  const formatFeeType = (roleType) => {
    switch(roleType) {
      case 'jobSeeker': return 'Job Seeker';
      case 'employer': return 'Employer';
      case 'trainer': return 'Trainer';
      case 'trainee': return 'Trainee';
      default: return roleType;
    }
  };

  // Helper function to check if user has sufficient permissions
  const hasEditPermission = () => {
    const role = getAdminRole();
    return role === 'super-admin' || role === 'admin';
  };

  const fetchPaymentSettings = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      const adminRole = getAdminRole();
      
      if (!adminToken) {
        toast.error('Authentication required');
        navigate('/admin/login');
        return;
      }
      
      // Use axios with timeout and detailed error handling
      const response = await axios.get(`${API_URL}/payment/settings`, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Admin-Role': adminRole || 'unknown', // Ensure we send a value even if null
          'X-Admin-Type': 'super-admin' // Add this header for compatibility with older backend code
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data.success) {
        const fetchedSettings = response.data.data.settings;
        setSettings(fetchedSettings);
        setOriginalSettings(fetchedSettings);
      } else {
        console.error('API returned success: false', response.data);
        toast.error('Failed to load payment settings: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        if (error.response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          // Clear invalid token and redirect
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        } else if (error.response.status === 403) {
          toast.error('You do not have permission to access payment settings.');
        } else if (error.response.status === 404) {
          toast.error('Payment settings endpoint not found. API may be misconfigured.');
        } else if (error.response.status === 500) {
          // Check if it's a permission error disguised as a 500 error
          if (error.response.data && error.response.data.message && error.response.data.message.includes('permission')) {
            toast.error('Permission denied: ' + error.response.data.message);
            console.error('Admin permissions issue. Current role:', getAdminRole());
          } else {
            toast.error('Server error: ' + (error.response.data?.message || error.message));
          }
        } else {
          toast.error('Server error: ' + (error.response.data?.message || error.message));
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('Network error: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        toast.error('Failed to send request: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Ensure value is a valid number and not negative
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else if (value === '') {
      // Allow empty field during typing
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    // Check permission first to prevent unnecessary API calls
    if (!hasEditPermission()) {
      toast.error('You do not have permission to update payment settings. Required role: admin or super-admin');
      return;
    }
    
    // Validate inputs
    const validationErrors = [];
    
    if (typeof settings.jobSeeker !== 'number' || settings.jobSeeker < 0) {
      validationErrors.push('Job Seeker fee must be a positive number');
    }
    if (typeof settings.employer !== 'number' || settings.employer < 0) {
      validationErrors.push('Employer fee must be a positive number');
    }
    if (typeof settings.trainer !== 'number' || settings.trainer < 0) {
      validationErrors.push('Trainer fee must be a positive number');
    }
    if (typeof settings.trainee !== 'number' || settings.trainee < 0) {
      validationErrors.push('Trainee fee must be a positive number');
    }
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    // Check if there are actual changes
    if (JSON.stringify({
      jobSeeker: settings.jobSeeker,
      employer: settings.employer,
      trainer: settings.trainer,
      trainee: settings.trainee
    }) === JSON.stringify({
      jobSeeker: originalSettings.jobSeeker,
      employer: originalSettings.employer,
      trainer: originalSettings.trainer,
      trainee: originalSettings.trainee
    })) {
      toast('No changes to save');
      return;
    }
    
    // Confirm before saving
    if (!window.confirm('Are you sure you want to update the payment fees? This will affect all new registrations.')) {
      return;
    }
    
    try {
      setSaving(true);
      const adminToken = localStorage.getItem('adminToken');
      const adminRole = getAdminRole();
      
      if (!adminToken) {
        toast.error('Authentication required');
        navigate('/admin/login');
        return;
      }
      
      // Update debug info
      console.log('Sending payment settings update with role:', adminRole);
      console.log('Update payload:', {
        jobSeeker: settings.jobSeeker,
        employer: settings.employer,
        trainer: settings.trainer,
        trainee: settings.trainee
      });
      console.log('Headers being sent:', {
        'Authorization': 'Bearer [TOKEN]', // Don't log the actual token
        'Content-Type': 'application/json',
        'X-Admin-Role': adminRole || 'unknown',
        'X-Admin-Type': 'super-admin'
      });
      
      const response = await axios.put(
        `${API_URL}/payment/settings`,
        {
          jobSeeker: settings.jobSeeker,
          employer: settings.employer,
          trainer: settings.trainer,
          trainee: settings.trainee
        },
        {
          headers: { 
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
            'X-Admin-Role': adminRole || 'unknown', // Ensure we always send a value
            'X-Admin-Type': 'super-admin' // Add this header for compatibility with older backend code
          }
        }
      );

      if (response.data.success) {
        toast.success('Payment settings updated successfully');
        // Update the original settings to match the new settings
        setOriginalSettings(response.data.data.settings);
      } else {
        toast.error('Failed to update payment settings: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      
      // Detailed error handling
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        if (error.response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        } else if (error.response.status === 403 || 
                  (error.response.status === 500 && 
                   error.response.data?.message?.includes('permission'))) {
          // Handle both explicit 403 errors and 500 errors that are actually permission issues
          toast.error('Permission denied: You do not have the required admin role to update payment settings.');
          
          // Show more details about permissions issue in console
          console.error('Admin permissions issue. Current role:', getAdminRole());
          
          // Suggest user to log out and log back in
          if (!getAdminRole()) {
            toast.error('Your admin role could not be detected. Try logging out and logging back in.');
          }
        } else if (error.response.status === 500) {
          toast.error('Server error. Please try again later or contact support.');
        } else {
          const errorMessage = error.response.data?.message || error.message;
          toast.error('Failed to update settings: ' + errorMessage);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        console.error('Request setup error:', error.message);
        toast.error('Error setting up request: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    toast('Changes discarded');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-sm text-gray-500">Loading payment settings...</div>
      </div>
    );
  }

  // Get current permission status for UI rendering
  const canEdit = hasEditPermission();

  return (
    <div className="section-body">
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      {/* Admin role warning */}
      {!canEdit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <strong>Warning:</strong> You need admin or super-admin role to update payment settings. 
          <div className="mt-2">
            <strong>Your current role:</strong> {getAdminRole() || 'Not detected'}
            <div className="flex mt-2 space-x-2">
              <button 
                onClick={() => navigate('/admin/login')}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-xs hover:bg-red-200"
              >
                Log out and log in again
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payment Configuration</h2>
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            setCurrentPage(1); // Reset to first page when toggling view
          }}
          className="flex items-center text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg transition-colors"
        >
          <FaHistory className="mr-2" />
          {showHistory ? 'Hide History' : 'View Change History'}
        </button>
      </div>
      
      {!showHistory ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <FaMoneyBillWave className="text-green-500 text-xl mr-2" />
                <h3 className="text-lg font-semibold">Registration Fees</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Configure the registration fees for different user types. These fees will be applied to all new registrations.
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Important Notes</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Fee changes apply to new registrations only</li>
                <li>• All fees are in {settings.currency}</li>
                <li>• Fee changes are logged for audit purposes</li>
                <li>• Zero fees are allowed if you want to offer free registration</li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-gray-700 font-medium mb-2">Job Seeker Fee ({settings.currency})</label>
              <input
                type="number"
                name="jobSeeker"
                value={settings.jobSeeker}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                readOnly={!canEdit}
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !canEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <p className="text-gray-500 text-sm mt-1">Fee for job seekers registering on the platform</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-gray-700 font-medium mb-2">Employer Fee ({settings.currency})</label>
              <input
                type="number"
                name="employer"
                value={settings.employer}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                readOnly={!canEdit}
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !canEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <p className="text-gray-500 text-sm mt-1">Fee for employers registering on the platform</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-gray-700 font-medium mb-2">Trainer Fee ({settings.currency})</label>
              <input
                type="number"
                name="trainer"
                value={settings.trainer}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                readOnly={!canEdit}
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !canEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <p className="text-gray-500 text-sm mt-1">Fee for trainers registering on the platform</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-gray-700 font-medium mb-2">Trainee Fee ({settings.currency})</label>
              <input
                type="number"
                name="trainee"
                value={settings.trainee}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                readOnly={!canEdit}
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !canEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <p className="text-gray-500 text-sm mt-1">Fee for trainees registering on the platform</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <FaTimes className="mr-2" />
              Discard Changes
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving || !canEdit}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                saving || !canEdit ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              title={!canEdit ? 'Only admin or super-admin can save changes' : ''}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Fee Change History</h3>
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
            <p>This history shows changes made to registration fees. The <strong>Fee Type</strong> column indicates which user registration fee was changed (Job Seeker, Employer, etc.).</p>
            <p className="mt-1">All changes are made by users with admin privileges.</p>
          </div>
          
          {settings.changeHistory && settings.changeHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {settings.changeHistory
                    .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((change, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(change.changedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {change.adminName} ({change.adminEmail})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {formatFeeType(change.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {change.previousAmount} {settings.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {change.newAmount} {settings.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination controls */}
              {settings.changeHistory.length > itemsPerPage && (
                <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => 
                        Math.min(prev + 1, Math.ceil(settings.changeHistory.length / itemsPerPage))
                      )}
                      disabled={currentPage >= Math.ceil(settings.changeHistory.length / itemsPerPage)}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage >= Math.ceil(settings.changeHistory.length / itemsPerPage)
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
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, settings.changeHistory.length)}
                        </span>{' '}
                        of <span className="font-medium">{settings.changeHistory.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          &larr;
                        </button>
                        {Array.from({ length: Math.min(5, Math.ceil(settings.changeHistory.length / itemsPerPage)) }, (_, i) => {
                          // Calculate page numbers to show (show 5 pages max)
                          const totalPages = Math.ceil(settings.changeHistory.length / itemsPerPage);
                          let pageNum;
                          
                          if (totalPages <= 5) {
                            // If 5 or fewer pages, show all page numbers
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            // Near the start
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // Near the end
                            pageNum = totalPages - 4 + i;
                          } else {
                            // In the middle
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(prev => 
                            Math.min(prev + 1, Math.ceil(settings.changeHistory.length / itemsPerPage))
                          )}
                          disabled={currentPage >= Math.ceil(settings.changeHistory.length / itemsPerPage)}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                            currentPage >= Math.ceil(settings.changeHistory.length / itemsPerPage)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              No change history available
            </div>
          )}
          
          <button
            onClick={() => setShowHistory(false)}
            className="mt-6 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            <FaTimes className="mr-2" />
            Close History
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default PaymentSettingsPage; 