import React from 'react';
import './css/JobCategories.css';

const BrowseCategories = () => {
  const categories = [
    {
      id: 1,
      name: 'Agriculture',
      jobCount: 1254,
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 30V22C21 21.4477 20.5523 21 20 21C19.4477 21 19 21.4477 19 22V30" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 27C12 27 14.5 24 20 24C25.5 24 28 27 28 27" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M20 18C20 18 16 15.5 16 12C16 8.5 20 6 20 6C20 6 24 8.5 24 12C24 15.5 20 18 20 18Z" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 2,
      name: 'Metal Production',
      jobCount: 816,
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 20L20 15L30 25L25 30L15 20Z" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 17L24 19" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 20L10 15L15 10L20 15" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 3,
      name: 'Commerce',
      jobCount: 2082,
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 14H26L24 22H16L14 14Z" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 14L12 10H10" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 26C16 27.1046 15.1046 28 14 28C12.8954 28 12 27.1046 12 26C12 24.8954 12.8954 24 14 24C15.1046 24 16 24.8954 16 26Z" stroke="#0D9488" strokeWidth="1.5"/>
          <path d="M28 26C28 27.1046 27.1046 28 26 28C24.8954 28 24 27.1046 24 26C24 24.8954 24.8954 24 26 24C27.1046 24 28 24.8954 28 26Z" stroke="#0D9488" strokeWidth="1.5"/>
          <path d="M24 22H14C12 22 11 22.5 10 24.5" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 4,
      name: 'Construction',
      jobCount: 1520,
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 30V15C12 14.4477 12.4477 14 13 14H27C27.5523 14 28 14.4477 28 15V30" stroke="#0D9488" strokeWidth="1.5"/>
          <path d="M10 30H30" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M20 14V10H23C24.1046 10 25 10.8954 25 12V14" stroke="#0D9488" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      id: 5,
      name: 'Hotels & Tourism',
      jobCount: 1022,
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M28 28V14C28 12.8954 27.1046 12 26 12H14C12.8954 12 12 12.8954 12 14V28" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 18H12" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 22H12" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 26H12" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M28 18H30" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M28 22H30" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M28 26H30" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 28H28V30H12V28Z" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 6,
      name: 'Education',
      jobCount: 1496,
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 12L30 18L20 24L10 18L20 12Z" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M26 20.5V26" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 18.5V24.5C14 24.5 16.5 28 20 28C23.5 28 26 24.5 26 24.5V18.5" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 7,
      name: 'Financial Services',
      jobCount: 1529,
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 28C25.5228 28 30 23.5228 30 18C30 12.4772 25.5228 8 20 8C14.4772 8 10 12.4772 10 18C10 23.5228 14.4772 28 20 28Z" stroke="#0D9488" strokeWidth="1.5"/>
          <path d="M20 12V18" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M17 15H23" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M15 21H25" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 24H24" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 8,
      name: 'Transport',
      jobCount: 1244,
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="14" width="20" height="12" rx="2" stroke="#0D9488" strokeWidth="1.5"/>
          <path d="M10 20H30" stroke="#0D9488" strokeWidth="1.5"/>
          <path d="M16 26V28" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M24 26V28" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 17V17.01" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M26 17V17.01" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="browse-categories-container">
      <h1 className="browse-title">Browse by Category</h1>
      <p className="browse-description">
        At eu lobortis pretium tincidunt amet lacus ut aenean aliquet. Blandit a massa elementum id scel...
      </p>
      
      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-icon">
              {category.icon}
            </div>
            <h2 className="category-name">{category.name}</h2>
            <div className="job-count">{category.jobCount} jobs</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseCategories;