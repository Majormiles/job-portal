import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../css/Dashboard.css';

const DashboardEmployer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

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

        <div className="announcement-box mt-8 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Contact Admin</h3>
          <p className="mb-4">For any assistance or inquiries regarding recruitment and management of your company profile, please use the contact information below to reach our admin team.</p>
          
          <div className="contact-info mt-4 p-4 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">Contact Information:</h4>
            <p><strong>Email:</strong> admin@jobportal.com</p>
            <p><strong>Phone:</strong> +233 24 746 6205</p>
            <p><strong>Support Hours:</strong> Monday - Friday, 9am - 5pm</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmployer; 