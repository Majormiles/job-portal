import React from 'react';
import { BookmarkIcon, BriefcaseIcon, ClockIcon, DollarSignIcon, MapPinIcon } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import '../css/RecentJobs.css'; // We'll define this CSS file below

const RecentJobs = () => {
  const jobs = [
    {
      id: 1,
      title: 'Forward Security Director',
      company: 'Bauch, Schuppe and Schulist Co',
      industry: 'Hotels & Tourism',
      timeType: 'Full time',
      salary: '$40000-$42000',
      location: 'Eastern Region, Ghana',
      postedAgo: '10 min ago',
      logoColor: '#FF7E5F'
    },
    {
      id: 2,
      title: 'Regional Creative Facilitator',
      company: 'Wisozk - Becker Co',
      industry: 'Media',
      timeType: 'Part time',
      salary: '$28000-$32000',
      location: 'Greater Accra, Ghana',
      postedAgo: '12 min ago',
      logoColor: '#7F00FF'
    },
    {
      id: 3,
      title: 'Internal Integration Planner',
      company: 'Mraz, Quigley and Feest Inc.',
      industry: 'Construction',
      timeType: 'Full time',
      salary: '$48000-$50000',
      location: 'Northern Region, Ghana',
      postedAgo: '15 min ago',
      logoColor: '#00BFFF'
    },
    {
      id: 4,
      title: 'District Intranet Director',
      company: 'VonRueden - Weber Co',
      industry: 'Commerce',
      timeType: 'Full time',
      salary: '$42000-$48000',
      location: 'Volta Region, Ghana',
      postedAgo: '24 min ago',
      logoColor: '#FF69B4'
    },
    {
      id: 5,
      title: 'Corporate Tactics Facilitator',
      company: 'Cormier, Turner and Flatley Inc',
      industry: 'Commerce',
      timeType: 'Full time',
      salary: '$38000-$40000',
      location: 'Oti Region, Ghana',
      postedAgo: '26 min ago',
      logoColor: '#32CD32'
    }
  ];

  return (
    <div className="recent-jobs-container">
      <div className="job-list">
        <div className="recent-jobs-header">
          <h1 className="recent-jobs-title">Latest Job Openings</h1>
          <a href="#" className="view-all-link">See All</a>
        </div>
        <p className="recent-jobs-description">Find the best job opportunities tailored to your skills and experience...</p>

        {jobs.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-card-header">
              <div className="job-logo-title">
                <div className="job-logo" style={{ backgroundColor: job.logoColor }}>
                  <div className="job-logo-inner"></div>
                </div>
                <div className="job-title-container">
                  <p className="job-posted-time">{job.postedAgo}</p>
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-company">{job.company}</p>
                </div>
              </div>
              <button className="bookmark-button">
                <BookmarkIcon size={20} />
              </button>
            </div>

            <div className="job-details-grid">
              <div className="job-detail">
                <BriefcaseIcon size={18} className="job-detail-icon" />
                <span>{job.industry}</span>
              </div>
              <div className="job-detail">
                <ClockIcon size={18} className="job-detail-icon" />
                <span>{job.timeType}</span>
              </div>
              <div className="job-detail">
                <DollarSignIcon size={18} className="job-detail-icon" />
                <span>{job.salary}</span>
              </div>
              <div className="job-detail job-location">
                <MapPinIcon size={18} className="job-detail-icon" />
                <span>{job.location}</span>
              </div>
              <div className="job-button-container">
                <Link to="/job-detail"><button className="job-details-button">Job Details</button></Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentJobs;