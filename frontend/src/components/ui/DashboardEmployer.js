import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../css/Dashboard.css';
import ReceiptList from './ReceiptList';

const DashboardEmployer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Get company name or user name as fallback
  const companyName = user?.companyName || user?.name || 'Your Company';

  if (loading) {
    return (
      <div className="content-area">
        <div className="dashboard-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area mt-20">
      <div className="dashboard-container">
        <div className="welcome-banner employer">
          <div className="welcome-text">
            <h1>Welcome, <span className="text-blue-600 font-bold">{user?.name || 'Employer'}</span>!</h1>
            {/* <h2>Employer Dashboard</h2> */}
            <p>{companyName}</p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="dashboard-tabs mt-8">
          <nav className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payments
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content mt-6">
          {activeTab === 'overview' && (
            <div className="announcement-box p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Contact Admin</h3>
              <p className="mb-4">For any assistance or inquiries regarding recruitment and management of your company profile, please use the contact information below to reach our admin team.</p>
              
              <div className="contact-info mt-4 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">Contact Information:</h4>
                <p><strong>Email:</strong> admin@jobportal.com</p>
                <p><strong>Phone:</strong> +233 24 746 6205</p>
                <p><strong>Support Hours:</strong> Monday - Friday, 9am - 5pm</p>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <ReceiptList />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardEmployer; 