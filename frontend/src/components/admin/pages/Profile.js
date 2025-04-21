import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar } from 'lucide-react';

const AdminProfile = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          throw new Error('No admin token found');
        }
        
        // Use the locally stored admin user data since there's no specific admin profile endpoint
        const adminUserData = localStorage.getItem('adminUser');
        if (adminUserData) {
          try {
            const parsedData = JSON.parse(adminUserData);
            setAdminUser(parsedData);
            return; // Exit the function since we have the data
          } catch (e) {
            console.error('Error parsing admin user data:', e);
          }
        }
        
        // If local data not available, try to fetch user profile using the token
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch admin profile');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setAdminUser(data.data);
          // Save to localStorage for future use
          localStorage.setItem('adminUser', JSON.stringify(data.data));
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminProfile();
  }, []);

  if (loading) {
    return (
      <div className="section-body flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error && !adminUser) {
    return (
      <div className="section-body">
        <div className="page-header mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Profile</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            <h2 className="text-lg font-semibold">Error Loading Profile</h2>
            <p>{error}</p>
          </div>
          <p className="text-gray-700">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-body">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Profile</h1>
        <p className="text-gray-500">View and manage your administrator account details</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4 sm:mb-0">
              <User size={48} className="text-blue-600" />
            </div>
            <div className="sm:ml-6 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-800">
                {adminUser?.name || 'Admin User'}
              </h2>
              <p className="text-gray-600 mt-1">Administrator</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-gray-800 break-all">{adminUser?.email || 'admin@example.com'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium text-gray-800">{adminUser?.phone || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-medium text-gray-800">
                  {adminUser?.createdAt 
                    ? new Date(adminUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown date'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Account Security</h3>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => alert('Password change functionality to be implemented')}
          >
            Change Password
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default AdminProfile; 