import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../css/Dashboard.css';

const DashboardTrainee = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

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
    <div className="content-area mt-20 md:mt-5">
      <div className="dashboard-container">
        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>Welcome, <span className="text-blue-600 font-bold">{user?.name || 'Trainee'}</span>!</h1>
            {/* <h2>Trainee Dashboard</h2> */}
          </div>
        </div>

        <div className="announcement-box mt-8 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Trainee Information</h3>
          <p className="mb-4">
            Thank you for joining as a trainee. Our platform offers various courses to enhance your skills
            and help you advance in your career. Please use the contact information below for any assistance.
          </p>
          
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

export default DashboardTrainee; 