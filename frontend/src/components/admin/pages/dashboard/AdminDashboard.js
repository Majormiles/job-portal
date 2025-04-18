import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, PieChart, Users, Briefcase, FileText, Calendar, Settings, Bell } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  // Verify admin token on component mount
  useEffect(() => {
    const verifyAdminAccess = async () => {
      const token = localStorage.getItem('adminToken');
      const userJson = localStorage.getItem('adminUser');
      
      if (!token) {
        console.error('No admin token found, redirecting to login');
        navigate('/admin/login');
        return;
      }

      try {
        // Set admin user from localStorage
        if (userJson) {
          const parsedUser = JSON.parse(userJson);
          setAdminUser(parsedUser);
        }
        
        // Verify token is valid (silent check)
        try {
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };
          
          // Attempt to fetch stats or user info to verify token
          const response = await axios.get(`${API_URL}/admin/stats`, config);
          
          // If successful, update stats
          if (response.data && response.data.success) {
            setStats(response.data.data || {});
          }
        } catch (verifyError) {
          console.warn('Token verification failed:', verifyError.message);
          // We won't redirect yet, since we have the admin token
          // The user might still be able to view the dashboard in development mode
          
          // In production, we would redirect to login
          if (process.env.NODE_ENV === 'production') {
            toast.error('Admin session expired. Please log in again.');
            navigate('/admin/login');
          } else {
            toast.warning('Using development access mode. Some features may be limited.');
          }
        }
      } catch (error) {
        console.error('Error verifying admin access:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAccess();
  }, [navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats data
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          return;
        }
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Try to get dashboard data from endpoints
        try {
          const endpoints = [
            `${API_URL}/admin/stats`,
            `${API_URL}/admin/dashboard`,
            `${API_URL}/stats`
          ];
          
          for (const endpoint of endpoints) {
            try {
              const response = await axios.get(endpoint, config);
              if (response.data && response.data.success) {
                setStats(response.data.data || {});
                break;
              }
            } catch (err) {
              // Try next endpoint
              console.log(`Failed to fetch data from ${endpoint}`);
            }
          }
        } catch (dataError) {
          console.warn('Failed to fetch dashboard data:', dataError.message);
          
          // Use demo data when in development
          if (process.env.NODE_ENV === 'development') {
            setStats({
              totalUsers: 120,
              totalJobs: 45,
              activeJobs: 32,
              totalApplications: 230,
              pendingApplications: 56,
              totalCategories: 12
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <Bell size={20} className="text-gray-600" />
          </button>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <Settings size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-medium">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{adminUser?.name || 'Admin User'}</p>
              <button 
                onClick={handleLogout}
                className="text-xs text-teal-600 hover:text-teal-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Jobs</p>
              <p className="text-2xl font-semibold">{stats.activeJobs || 0} / {stats.totalJobs || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Applications</p>
              <p className="text-2xl font-semibold">{stats.pendingApplications || 0} pending</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full text-blue-500 mr-3">
                <Users size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full text-green-500 mr-3">
                <Briefcase size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">New job posted</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-full text-purple-500 mr-3">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">New application submitted</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition flex flex-col items-center justify-center"
            >
              <Users size={24} className="text-blue-500 mb-2" />
              <span className="text-sm">Manage Users</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/jobs')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition flex flex-col items-center justify-center"
            >
              <Briefcase size={24} className="text-green-500 mb-2" />
              <span className="text-sm">Manage Jobs</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/applications')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition flex flex-col items-center justify-center"
            >
              <FileText size={24} className="text-purple-500 mb-2" />
              <span className="text-sm">Manage Applications</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/schedule')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition flex flex-col items-center justify-center"
            >
              <Calendar size={24} className="text-orange-500 mb-2" />
              <span className="text-sm">Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 