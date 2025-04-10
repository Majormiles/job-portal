


import React from 'react';
import { BookmarkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../css/RecentJobs.css';

const RecentJobs = () => {
  const jobs = [
    {
      id: 1,
      title: "Senior UI/UX Designer",
      company: "Amazon",
      date: "20 May, 2023",
      tags: ["Part time", "Senior level", "Distant"],
      workType: ["Project work"],
      salary: "$250/hr",
      location: "San Francisco, CA",
      logoText: "a",
      logoColor: "#FFF1E6",
      logoBackground: "linear-gradient(45deg, #FF9900, #FFC107)",
      bookmarked: false
    },
    {
      id: 2,
      title: "Junior UI/UX Designer",
      company: "Google",
      date: "4 Feb, 2023",
      tags: ["Full time", "Junior level", "Distant"],
      workType: ["Project work", "Flexible Schedule"],
      salary: "$150/hr",
      location: "California, CA",
      logoText: "G",
      logoColor: "#E6F7F1",
      logoBackground: "#E6F7F1",
      bookmarked: true
    },
    {
      id: 3,
      title: "Senior Motion Designer",
      company: "Dribbble",
      date: "29 Jan, 2023",
      tags: ["Part time", "Senior level", "Full Day"],
      workType: ["Shift work"],
      salary: "$260/hr",
      location: "New York, NY",
      logoText: "D",
      logoColor: "#F3E6F7",
      logoBackground: "#F3E6F7",
      bookmarked: false
    },
    {
      id: 4,
      title: "UX Designer",
      company: "Twitter",
      date: "11 Apr, 2023",
      tags: ["Full time", "Middle level", "Distant"],
      workType: ["Project work"],
      salary: "$120/hr",
      location: "California, CA",
      logoText: "t",
      logoColor: "#E6F2FF",
      logoBackground: "#E6F2FF",
      bookmarked: false
    },
    {
      id: 5,
      title: "Graphic Designer",
      company: "Airbnb",
      date: "2 Apr, 2023",
      tags: ["Part time", "Senior level"],
      workType: [],
      salary: "$300/hr",
      location: "New York, NY",
      logoText: "a",
      logoColor: "#FFE6EC",
      logoBackground: "#FFE6EC",
      bookmarked: false
    },
    {
      id: 6,
      title: "Graphic Designer",
      company: "Apple",
      date: "18 Jan, 2023",
      tags: ["Part time", "Distant"],
      workType: [],
      salary: "$140/hr",
      location: "San Francisco, CA",
      logoText: "a",
      logoColor: "#F5F5F7",
      logoBackground: "#F5F5F7",
      bookmarked: false
    }
  ];

  // Get company-specific logo and styles
  const getCompanyLogo = (company) => {
    const logos = {
      'Amazon': <span className="company-logo-text">a</span>,
      'Google': <span className="company-logo-icon">G</span>,
      'Dribbble': <span className="company-logo-icon" style={{ color: "#EA4C89" }}>●</span>,
      'Twitter': <span className="company-logo-icon" style={{ color: "#1DA1F2" }}>t</span>,
      'Airbnb': <span className="company-logo-icon" style={{ color: "#FF5A5F" }}>◎</span>,
      'Apple': <span className="company-logo-icon">♫</span>
    };

    return logos[company] || <span className="company-logo-text">{company.charAt(0)}</span>;
  };

  const getCompanyLogoBackground = (company) => {
    const backgrounds = {
      'Amazon': '#FFF1E6',
      'Google': '#E6F7F1',
      'Dribbble': '#F3E6F7',
      'Twitter': '#E6F2FF',
      'Airbnb': '#FFE6EC',
      'Apple': '#F5F5F7'
    };

    return backgrounds[company] || '#f0f0f0';
  };

  const getCompanyLogoStyle = (company) => {
    const styles = {
      'Amazon': { borderRadius: '4px' },
      'Google': { borderRadius: '50%' },
      'Dribbble': { borderRadius: '50%' },
      'Twitter': { borderRadius: '50%' },
      'Airbnb': { borderRadius: '50%' },
      'Apple': { borderRadius: '50%' }
    };

    return styles[company] || { borderRadius: '4px' };
  };

  return (
    <div className="modern-jobs-container">

      <div className="recent-jobs-header">
        <h1 className="recent-jobs-title">Latest Job Openings</h1>
        <a href="#" className="view-all-link">See All</a>
      </div>
      <p className="recent-jobs-description">Find the best job opportunities tailored to your skills and experience...</p>

      <div className="modern-jobs-grid">

        {jobs.map(job => (
          <div key={job.id} className="modern-job-card">
            {/* Date and bookmark header */}
            <div className="modern-job-header">
              <div className="job-date-pill">{job.date}</div>
              <button className="modern-bookmark-button">
                <BookmarkIcon size={20} fill={job.bookmarked ? "black" : "none"} />
              </button>
            </div>

            {/* Company and title section */}
            <div className="modern-company-section">
              <div
                className="modern-company-logo"
                style={{
                  backgroundColor: getCompanyLogoBackground(job.company),
                  ...getCompanyLogoStyle(job.company)
                }}
              >
                {getCompanyLogo(job.company)}
              </div>
              <div className="modern-company-info">
                <div className="modern-company-name">{job.company}</div>
                <h3 className="modern-job-title">{job.title}</h3>
              </div>
            </div>

            {/* Tags section */}
            <div className="modern-job-tags">
              {job.tags.map((tag, index) => (
                <span key={index} className="modern-job-tag">{tag}</span>
              ))}
              {job.workType.map((type, index) => (
                <span key={`work-${index}`} className="modern-job-tag work-type">{type}</span>
              ))}
            </div>

            {/* Salary and location footer */}
            <div className="modern-job-footer">
              <div className="modern-job-salary">{job.salary}</div>
              <div className="modern-job-location">{job.location}</div>
              <Link to="/job-detail" className="modern-details-link">
                <button className="modern-details-button">Details</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentJobs;