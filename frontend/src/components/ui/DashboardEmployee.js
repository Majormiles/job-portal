// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import '.././css/Dashboard.css';
import userImage from '../../assets/images/woman.png';

// Import Font Awesome components
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faBriefcase, 
  faBookmark, 
  faBell, 
  faArrowRight, 
  faMapMarkerAlt, 
  faDollarSign, 
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Add icons to the library
library.add(
  faBriefcase, 
  faBookmark, 
  faBell, 
  faArrowRight, 
  faMapMarkerAlt, 
  faDollarSign, 
  faCheckCircle
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      appliedJobs: 0,
      favoriteJobs: 0,
      jobAlerts: 0
    },
    recentApplications: [],
    profile: {
      name: user?.name || '',
      profileImage: userImage,
      profileCompletion: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileResponse, applicationsResponse, statsResponse] = await Promise.all([
        api.get('/dashboard/me'),
        api.get('/dashboard/applications/recent'),
        api.get('/dashboard/stats')
      ]);

      setDashboardData({
        profile: profileResponse.data.data,
        recentApplications: applicationsResponse.data.data,
        stats: statsResponse.data.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle job selection
  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
  };

  // Function to handle view details click
  const handleViewDetails = (jobId) => {
    // Navigate to job details page
    window.location.href = `/job-details/${jobId}`;
  };

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
    <div className="content-area">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Hello, {dashboardData.profile.name}</h1>
          <p>Here is your daily activities and job alerts</p>
        </div>

        <div className="stats-container">
          <div className="stat-card blue">
            <div className="stat-info">
              <h2>{dashboardData.stats.appliedJobs}</h2>
              <p>Applied jobs</p>
            </div>
            <div className="stat-icon">
              <FontAwesomeIcon icon="briefcase" />
            </div>
          </div>

          <div className="stat-card yellow">
            <div className="stat-info">
              <h2>{dashboardData.stats.favoriteJobs}</h2>
              <p>Favorite jobs</p>
            </div>
            <div className="stat-icon">
              <FontAwesomeIcon icon="bookmark" />
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-info">
              <h2>{dashboardData.stats.jobAlerts}</h2>
              <p>Job Alerts</p>
            </div>
            <div className="stat-icon">
              <FontAwesomeIcon icon="bell" />
            </div>
          </div>
        </div>

        {dashboardData.profile.profileCompletion < 100 && (
          <div className="profile-alert">
            <div className="profile-alert-content">
              <div className="profile-image">
                <img src={dashboardData.profile.profileImage} alt="Profile" />
              </div>
              <div className="alert-message">
                <h3>Your profile editing is not completed.</h3>
                <p>Complete your profile editing & build your custom Resume</p>
              </div>
            </div>
            <Link to="/profile" className="edit-profile-btn">
              Edit Profile <FontAwesomeIcon icon="arrow-right" />
            </Link>
          </div>
        )}

        <div className="recent-applications">
          <div className="recent-header">
            <h3>Recently Applied</h3>
            <Link to="/applied-jobs" className="view-all">
              View all <FontAwesomeIcon icon="arrow-right" />
            </Link>
          </div>

          <div className="applications-table">
            <div className="table-header">
              <div className="column-job">Job</div>
              <div className="column-date">Date Applied</div>
              <div className="column-status">Status</div>
              <div className="column-action">Action</div>
            </div>

            {dashboardData.recentApplications.map((job) => (
              <div 
                className={`table-row ${job.id === selectedJobId ? 'highlighted' : ''}`} 
                key={job.id}
                onClick={() => handleJobSelect(job.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="column-job">
                  <div className="job-info">
                    <div className="company-logo">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.company} />
                      ) : (
                        <div className="logo default">{job.company[0]}</div>
                      )}
                    </div>
                    <div className="job-details">
                      <h4>{job.title} <span className={`job-type ${job.type.toLowerCase().replace(' ', '-')}`}>{job.type}</span></h4>
                      <div className="job-meta">
                        <span><FontAwesomeIcon icon="map-marker-alt" /> {job.location}</span>
                        <span><FontAwesomeIcon icon="dollar-sign" /> {job.salary}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="column-date">{new Date(job.appliedDate).toLocaleString()}</div>
                <div className="column-status">
                  <span className={`status-badge ${job.status.toLowerCase()}`}>
                    <FontAwesomeIcon icon="check-circle" /> {job.status}
                  </span>
                </div>
                <div className="column-action">
                  <button 
                    className="view-details-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      handleViewDetails(job.id);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-footer">
          <p>© {new Date().getFullYear()} Job Portal &copy; Major Myles. All rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;