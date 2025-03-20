// pages/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './css/Dashboard.css'; // Import the dedicated Dashboard CSS file

const Dashboard = () => {
  const recentApplications = [
    {
      id: 1,
      title: 'Networking Engineer',
      company: 'Upwork',
      logo: 'upwork-logo.png',
      location: 'Washington',
      salary: '$50k-80k/month',
      date: 'Feb 2, 2019 19:28',
      status: 'Active',
      type: 'Remote'
    },
    {
      id: 2,
      title: 'Product Designer',
      company: 'Design Studio',
      logo: 'design-logo.png',
      location: 'Dhaka',
      salary: '$50k-80k/month',
      date: 'Dec 7, 2019 23:26',
      status: 'Active',
      type: 'Full Time'
    },
    {
      id: 3,
      title: 'Junior Graphic Designer',
      company: 'Apple',
      logo: 'apple-logo.png',
      location: 'Brazil',
      salary: '$50k-80k/month',
      date: 'Feb 2, 2019 19:28',
      status: 'Active',
      type: 'Temporary'
    },
    {
      id: 4,
      title: 'Visual Designer',
      company: 'Microsoft',
      logo: 'microsoft-logo.png',
      location: 'Wisconsin',
      salary: '$50k-80k/month',
      date: 'Dec 7, 2019 23:26',
      status: 'Active',
      type: 'Contract Base'
    }
  ];

  return (
    <div className="content-area">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Hello, Esther Howard</h1>
          <p>Here is your daily activities and job alerts</p>
        </div>

        <div className="stats-container">
          <div className="stat-card blue">
            <div className="stat-info">
              <h2>589</h2>
              <p>Applied jobs</p>
            </div>
            <div className="stat-icon">
              <i className="far fa-briefcase"></i>
            </div>
          </div>

          <div className="stat-card yellow">
            <div className="stat-info">
              <h2>238</h2>
              <p>Favorite jobs</p>
            </div>
            <div className="stat-icon">
              <i className="far fa-bookmark"></i>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-info">
              <h2>574</h2>
              <p>Job Alerts</p>
            </div>
            <div className="stat-icon">
              <i className="far fa-bell"></i>
            </div>
          </div>
        </div>

        <div className="profile-alert">
          <div className="profile-alert-content">
            <div className="profile-image">
              <img src="/profile-placeholder.jpg" alt="Profile" />
            </div>
            <div className="alert-message">
              <h3>Your profile editing is not completed.</h3>
              <p>Complete your profile editing & build your custom Resume</p>
            </div>
          </div>
          <button className="edit-profile-btn">
            Edit Profile <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <div className="recent-applications">
          <div className="recent-header">
            <h3>Recently Applied</h3>
            <Link to="/applied-jobs" className="view-all">
              View all <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          <div className="applications-table">
            <div className="table-header">
              <div className="column-job">Job</div>
              <div className="column-date">Date Applied</div>
              <div className="column-status">Status</div>
              <div className="column-action">Action</div>
            </div>

            {recentApplications.map((job) => (
              <div className={`table-row ${job.id === 4 ? 'highlighted' : ''}`} key={job.id}>
                <div className="column-job">
                  <div className="job-info">
                    <div className="company-logo">
                      {job.company === 'Upwork' && <div className="logo upwork">Up</div>}
                      {job.company === 'Design Studio' && <div className="logo design">Ds</div>}
                      {job.company === 'Apple' && <div className="logo apple"><i className="fab fa-apple"></i></div>}
                      {job.company === 'Microsoft' && <div className="logo microsoft">MS</div>}
                    </div>
                    <div className="job-details">
                      <h4>{job.title} <span className={`job-type ${job.type.toLowerCase().replace(' ', '-')}`}>{job.type}</span></h4>
                      <div className="job-meta">
                        <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                        <span><i className="fas fa-dollar-sign"></i> {job.salary}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="column-date">{job.date}</div>
                <div className="column-status">
                  <span className="status-badge active">
                    <i className="fas fa-check-circle"></i> {job.status}
                  </span>
                </div>
                <div className="column-action">
                  <button className="view-details-btn">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-footer">
          <p>© 2021 Jobpilot - Job Board. All rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;