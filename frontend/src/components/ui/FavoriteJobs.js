import React from 'react';
import '../css/FavoriteJobs.css';
import { FiMapPin, FiDollarSign, FiClock, FiArrowRight, FiBookmark } from 'react-icons/fi';

const FavoriteJobs = () => {
  // Sample data based on the image
  const favoriteJobs = [
    {
      id: 1,
      title: 'Technical Support Specialist',
      company: 'Google',
      logo: 'G',
      logoColor: '#4285F4',
      location: 'Idaho, USA',
      salary: '$15K-$20K',
      jobType: 'Full Time',
      status: 'Deadline Expired',
      timeRemaining: 'Job Expire',
      isExpired: true,
      isFavorite: true
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'YouTube',
      logo: 'Y',
      logoColor: '#FF0000',
      location: 'Minnesota, USA',
      salary: '$10K-$15K',
      jobType: 'Full Time',
      status: 'Apply Now',
      timeRemaining: '4 Days Remaining',
      isExpired: false,
      isFavorite: true
    },
    {
      id: 3,
      title: 'Senior UX Designer',
      company: 'Dribbble',
      logo: 'D',
      logoColor: '#EA4C89',
      location: 'United Kingdom of Great Britain',
      salary: '$30K-$35K',
      jobType: 'Full Time',
      status: 'Apply Now',
      timeRemaining: '4 Days Remaining',
      isExpired: false,
      isFavorite: true,
      isHighlighted: true
    },
    {
      id: 4,
      title: 'Junior Graphic Designer',
      company: 'Facebook',
      logo: 'F',
      logoColor: '#1877F2',
      location: 'Mymensingh, Bangladesh',
      salary: '$40K-$50K',
      jobType: 'Full Time',
      status: 'Apply Now',
      timeRemaining: '4 Days Remaining',
      isExpired: false,
      isFavorite: true
    },
    {
      id: 5,
      title: 'Technical Support Specialist',
      company: 'Google',
      logo: 'G',
      logoColor: '#4285F4',
      location: 'Idaho, USA',
      salary: '$15K-$20K',
      jobType: 'Full Time',
      status: 'Deadline Expired',
      timeRemaining: 'Job Expire',
      isExpired: true,
      isFavorite: true
    },
    {
      id: 6,
      title: 'Product Designer',
      company: 'Twitter',
      logo: 'T',
      logoColor: '#1DA1F2',
      location: 'Sivas, Turkey',
      salary: '$50K-$70K',
      jobType: 'Full Time',
      status: 'Apply Now',
      timeRemaining: '4 Days Remaining',
      isExpired: false,
      isFavorite: true
    },
    {
      id: 7,
      title: 'Project Manager',
      company: 'Upwork',
      logo: 'U',
      logoColor: '#6FDA44',
      location: 'Ohio, USA',
      salary: '$50K-$80K',
      jobType: 'Full Time',
      status: 'Apply Now',
      timeRemaining: '4 Days Remaining',
      isExpired: false,
      isFavorite: true
    },
    {
      id: 8,
      title: 'Technical Support Specialist',
      company: 'Google',
      logo: 'G',
      logoColor: '#4285F4',
      location: 'Idaho, USA',
      salary: '$15K-$20K',
      jobType: 'Full Time',
      status: 'Deadline Expired',
      timeRemaining: 'Job Expire',
      isExpired: true,
      isFavorite: true
    },
    {
      id: 9,
      title: 'Technical Support Specialist',
      company: 'Google',
      logo: 'G',
      logoColor: '#4285F4',
      location: 'Idaho, USA',
      salary: '$15K-$20K',
      jobType: 'Full Time',
      status: 'Deadline Expired',
      timeRemaining: 'Job Expire',
      isExpired: true,
      isFavorite: true
    },
    {
      id: 10,
      title: 'Marketing Manager',
      company: 'Microsoft',
      logo: 'M',
      logoColor: '#00A4EF',
      location: 'Konya, Turkey',
      salary: '$20K-$25K',
      jobType: 'Temporary',
      status: 'Apply Now',
      timeRemaining: '4 Days Remaining',
      isExpired: false,
      isFavorite: true
    },
    {
      id: 11,
      title: 'Visual Designer',
      company: 'Apple',
      logo: 'A',
      logoColor: '#000000',
      location: 'Washington, USA',
      salary: '$10K-$15K',
      jobType: 'Part Time',
      status: 'Apply Now',
      timeRemaining: '4 Days Remaining',
      isExpired: false,
      isFavorite: true
    },
    {
      id: 12,
      title: 'Interaction Designer',
      company: 'Figma',
      logo: 'F',
      logoColor: '#F24E1E',
      location: 'Penn, USA',
      salary: '$35K-$40K',
      jobType: 'Remote',
      status: 'Apply Now',
      timeRemaining: '4 Days Remaining',
      isExpired: false,
      isFavorite: true
    },
    {
      id: 13,
      title: 'Senior UX Designer',
      company: 'Upwork',
      logo: 'U',
      logoColor: '#6FDA44',
      location: 'Sylhet, Bangladesh',
      salary: '$30K-$35K',
      jobType: 'Contract Base',
      status: 'Apply Now',
      timeRemaining: '4 Days Remaining',
      isExpired: false,
      isFavorite: true
    }
  ];

  // Get company logo or first letter of company name
  const getCompanyLogo = (company, logoChar, logoColor) => {
    switch (company) {
      case 'Google':
        return (
          <div className="logo" style={{ backgroundColor: '#fff' }}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
        );
      case 'YouTube':
        return (
          <div className="logo" style={{ backgroundColor: '#FF0000' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
            </svg>
          </div>
        );
      case 'Facebook':
        return (
          <div className="logo" style={{ backgroundColor: '#1877F2' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        );
      case 'Microsoft':
        return (
          <div className="logo" style={{ backgroundColor: '#fff' }}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#F25022" d="M1 1h10v10H1z" />
              <path fill="#00A4EF" d="M1 13h10v10H1z" />
              <path fill="#7FBA00" d="M13 1h10v10H13z" />
              <path fill="#FFB900" d="M13 13h10v10H13z" />
            </svg>
          </div>
        );
      case 'Twitter':
        return (
          <div className="logo" style={{ backgroundColor: '#1DA1F2' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </div>
        );
      case 'Apple':
        return (
          <div className="logo" style={{ backgroundColor: '#000000' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
              <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2.5a4.38 4.38 0 0 0-3 1.45 4.14 4.14 0 0 0-1 3.05 3.69 3.69 0 0 0 2.94-1.81M17.46 12c0-2.86 2.37-4.21 2.47-4.29a5.57 5.57 0 0 0-4.12-2.19c-1.71-.18-3.42 1-4.31 1s-2.28-1-3.76-1a5.79 5.79 0 0 0-4.87 3c-2.1 3.63-.54 9 1.49 11.91 1 1.43 2.18 3 3.76 3s2.06-1 3.86-1 2.33 1 3.92 1 2.66-1.45 3.67-2.89a12.63 12.63 0 0 0 1.65-3.41 5.46 5.46 0 0 1-3.76-5.13Z" />
            </svg>
          </div>
        );
      case 'Figma':
        return (
          <div className="logo" style={{ backgroundColor: '#F24E1E' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
              <path d="M8.5 2C6.84 2 5.5 3.34 5.5 5C5.5 6.66 6.84 8 8.5 8H15.5C17.16 8 18.5 6.66 18.5 5C18.5 3.34 17.16 2 15.5 2H8.5Z" />
              <path d="M15.5 9C13.84 9 12.5 10.34 12.5 12C12.5 13.66 13.84 15 15.5 15C17.16 15 18.5 13.66 18.5 12C18.5 10.34 17.16 9 15.5 9Z" />
              <path d="M5.5 12C5.5 10.34 6.84 9 8.5 9H11.5V15H8.5C6.84 15 5.5 13.66 5.5 12Z" />
              <path d="M8.5 16C6.84 16 5.5 17.34 5.5 19C5.5 20.66 6.84 22 8.5 22C10.16 22 11.5 20.66 11.5 19V16H8.5Z" />
            </svg>
          </div>
        );
      case 'Upwork':
        return (
          <div className="logo" style={{ backgroundColor: '#6FDA44' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
              <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z" />
            </svg>
          </div>
        );
      case 'Dribbble':
        return (
          <div className="logo" style={{ backgroundColor: '#EA4C89' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
              <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308a10.28 10.28 0 0 0 4.392-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4a10.161 10.161 0 0 0 6.29 2.166c1.42 0 2.77-.29 4.006-.814zm-7.734-1.42c.156-.27 2.093-3.442 5.708-4.615.09-.03.18-.056.27-.08a38.5 38.5 0 0 0-1.153-2.415c-3.532 1.057-6.965 1.018-7.3 1.01l-.003.208c0 1.83.664 3.502 1.758 4.795l.72.077zM2.04 10.67c.05.005 2.92.022 5.97-.787-1.075-1.905-2.222-3.524-2.395-3.78-1.805.85-3.16 2.46-3.58 4.56l.005.007zm5.97-6.757c.183.266 1.347 1.882 2.413 3.872 2.32-.874 3.298-2.204 3.412-2.37-.574-.525-1.334-.912-2.176-1.11-.85-.195-1.7-.19-2.497-.084-1.11.147-1.152-.307-1.152-.307zM16.41 5.6c-.14.19-1.24 1.61-3.67 2.61.15.316.3.64.435.966.047.11.094.22.14.336 2.1-.26 4.188.176 4.39.224-.013-1.488-.548-2.858-1.297-3.945l.002-.19z" />
            </svg>
          </div>
        );
      default:
        return <div className="logo" style={{ backgroundColor: logoColor }}>{logoChar}</div>;
    }
  };

  // Function to get job type class
  const getJobTypeClass = (jobType) => {
    switch (jobType) {
      case 'Full Time':
        return 'full-time';
      case 'Part Time':
        return 'part-time';
      case 'Remote':
        return 'remote';
      case 'Contract Base':
        return 'contract-base';
      case 'Temporary':
        return 'temporary';
      default:
        return '';
    }
  };

  return (
    <div className="content-area">
    <div className="favorite-jobs-container">
      <div className="favorite-jobs-header">
        <h2>Favorite Jobs <span className="job-count">({favoriteJobs.length})</span></h2>
      </div>

      <div className="favorite-jobs-list">
        {favoriteJobs.map((job) => (
          <div 
            key={job.id} 
            className={`job-card ${job.isHighlighted ? 'highlighted' : ''}`}
          >
            <div className="job-card-left">
              <div className="company-logo">
                {getCompanyLogo(job.company, job.logo)}
              </div>
              
              <div className="job-details">
                <h3 className="job-title">{job.title}</h3>
                <div className="job-meta">
                  <div className="job-type-tag">
                    <span className={`job-type ${getJobTypeClass(job.jobType)}`}>{job.jobType}</span>
                  </div>
                  
                  <div className="job-location">
                    <FiMapPin size={14} />
                    <span>{job.location}</span>
                  </div>
                  
                  <div className="job-salary">
                    <FiDollarSign size={14} />
                    <span>{job.salary}</span>
                  </div>
                  
                  <div className={`job-time ${job.isExpired ? 'expired' : ''}`}>
                    <FiClock size={14} />
                    <span>{job.timeRemaining}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="job-card-right">
              <button className="favorite-btn active">
                <FiBookmark size={18} />
              </button>
              
              {job.isExpired ? (
                <button className="status-btn expired" disabled>
                  Deadline Expired
                </button>
              ) : (
                <button className="status-btn apply">
                  Apply Now <FiArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="pagination">
        <button className="pagination-arrow prev">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button className="pagination-number active">01</button>
        <button className="pagination-number">02</button>
        <button className="pagination-number">03</button>
        <button className="pagination-number">04</button>
        <button className="pagination-number">05</button>
        
        <button className="pagination-arrow next">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="footer-credit">
        © 2021 Jobpilot - Job Board. All rights Reserved
      </div>
    </div>
    </div>
  );
};

export default FavoriteJobs;