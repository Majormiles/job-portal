import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Bookmark } from 'lucide-react';
import '../css/JobListings.css';

const JobListings = () => {
  // Sample job data based on the image
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Senior UI/UX Designer",
      company: "Amazon",
      date: "20 May, 2023",
      tags: ["Part time", "Senior level", "Distant"],
      workType: "Project work",
      salary: "$250/hr",
      location: "San Francisco, CA",
      logoText: "a", // Amazon logo placeholder
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
      logoText: "G", // Google logo placeholder
      bookmarked: true
    },
    {
      id: 3,
      title: "Senior Motion Designer",
      company: "Dribbble",
      date: "29 Jan, 2023",
      tags: ["Part time", "Senior level", "Full Day"],
      workType: "Shift work",
      salary: "$260/hr",
      location: "New York, NY",
      logoText: "D", // Dribbble logo placeholder
      bookmarked: false
    },
    {
      id: 4,
      title: "UX Designer",
      company: "Twitter",
      date: "11 Apr, 2023",
      tags: ["Full time", "Middle level", "Distant"],
      workType: "Project work",
      salary: "$120/hr",
      location: "California, CA",
      logoText: "t", // Twitter logo placeholder
      bookmarked: false
    },
    {
      id: 5,
      title: "Graphic Designer",
      company: "Airbnb",
      date: "2 Apr, 2023",
      tags: ["Part time", "Senior level"],
      workType: "",
      salary: "$300/hr",
      location: "New York, NY",
      logoText: "a", // Airbnb logo placeholder
      bookmarked: false
    },
    {
      id: 6,
      title: "Graphic Designer",
      company: "Apple",
      date: "18 Jan, 2023",
      tags: ["Part time", "Distant"],
      workType: "",
      salary: "$140/hr",
      location: "San Francisco, CA",
      logoText: "a", // Apple logo placeholder
      bookmarked: false
    }
  ]);

  // Get company-specific styles for logos
  const getCompanyLogoStyle = (company) => {
    const logoStyles = {
      'Amazon': { background: '#FFF1E6', color: '#000', borderRadius: '4px' },
      'Google': { background: '#E6F7F1', color: '#000', borderRadius: '50%' },
      'Dribbble': { background: '#F3E6F7', color: '#EA4C89', borderRadius: '50%' },
      'Twitter': { background: '#E6F2FF', color: '#1DA1F2', borderRadius: '50%' },
      'Airbnb': { background: '#FFE6EC', color: '#FF5A5F', borderRadius: '50%' },
      'Apple': { background: '#F5F5F7', color: '#000', borderRadius: '50%' }
    };
    
    return logoStyles[company] || { background: '#f0f0f0', color: '#333', borderRadius: '4px' };
  };

  // Function to toggle bookmark status
  const toggleBookmark = (id) => {
    setJobs(
      jobs.map(job => 
        job.id === id ? { ...job, bookmarked: !job.bookmarked } : job
      )
    );
  };

  // Rest of your existing code...
  // Filter categories with counts
  const categories = [
    { name: "Commerce", count: 10 },
    { name: "Telecommunications", count: 10 },
    { name: "Hotels & Tourism", count: 10 },
    { name: "Education", count: 10 },
    { name: "Financial Services", count: 10 }
  ];

  // Job types with counts
  const jobTypes = [
    { name: "Full Time", count: 10 },
    { name: "Part Time", count: 10 },
    { name: "Freelance", count: 10 },
  ];

  // Tags
  const tags = ["engineering", "design", "ui/ux", "marketing", "management", "soft", "construction"];

  // State for filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);

  // Current page
  const [currentPage, setCurrentPage] = useState(1);

  // State for salary range
  const [salaryRange, setSalaryRange] = useState([0, 9999]);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const [isSticky, setIsSticky] = useState(false);

  // Effect to scroll to top when page changes
  useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  // Handle job details button click
  const handleJobDetailsClick = () => {
    scrollToTop();
  };

  // Handle pagination click
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="job-listings-container">
      {/* Mobile filter toggle button */}
      <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className="job-listings-content">
        {/* Left sidebar with filters - same as before */}
        <div
          className={`filters-sidebar ${showFilters ? 'show' : ''} ${isSticky ? 'sticky' : ''}`}
          style={{
            position: isSticky ? 'sticky' : 'static',
            top: isSticky ? '25px' : 'auto',
            transition: 'all 0.3s ease',
            maxHeight: isSticky ? 'calc(100vh - 40px)' : 'none',
            overflowY: isSticky ? 'auto' : 'visible',
            scrollbarWidth: 'thin', 
            scrollbarColor: '#D3D3D3 transparent' 
          }}
        >
          {/* Filter sections remain the same */}
          {/* Search by job title */}
          <div className="filter-section">
            <h3 className="filter-title">Search by Job Title</h3>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Job title or company"
                className="search-input"
              />
              <Search className="search-icon" size={18} color="#666" />
            </div>
          </div>

          {/* Location */}
          <div className="filter-section">
            <h3 className="filter-title">Location</h3>
            <div className="select-container">
              <select className="location-select">
                <option value="">Choose city</option>
                <option value="accra">Accra</option>
                <option value="kumasi">Kumasi</option>
                <option value="tamale">Tamale</option>
              </select>
              <MapPin className="location-icon" size={18} color="#666" />
            </div>
          </div>

          {/* Category */}
          <div className="filter-section">
            <h3 className="filter-title">Category</h3>
            <div className="checkbox-list">
              {categories.map((category, index) => (
                <div key={index} className="checkbox-item">
                  <input type="checkbox" id={`category-${index}`} className="filter-checkbox" />
                  <label htmlFor={`category-${index}`}>{category.name}</label>
                  <span className="count">{category.count}</span>
                </div>
              ))}
            </div>
            <button className="show-more-btn">Show More</button>
          </div>

          {/* Job Type */}
          <div className="filter-section">
            <h3 className="filter-title">Job Type</h3>
            <div className="checkbox-list">
              {jobTypes.map((jobType, index) => (
                <div key={index} className="checkbox-item">
                  <input type="checkbox" id={`jobType-${index}`} className="filter-checkbox" />
                  <label htmlFor={`jobType-${index}`}>{jobType.name}</label>
                  <span className="count">{jobType.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div className="filter-section">
            <h3 className="filter-title">Salary</h3>
            <div className="salary-slider-container">
              <input
                type="range"
                min="0"
                max="9999"
                value={salaryRange[1]}
                onChange={(e) => setSalaryRange([salaryRange[0], parseInt(e.target.value)])}
                className="salary-slider"
              />
            </div>
            <div className="salary-range-display">
              <span>Salary: ${salaryRange[0]} - ${salaryRange[1]}</span>
              <button className="apply-btn" onClick={scrollToTop}>Apply</button>
            </div>
          </div>

          {/* Tags */}
          <div className="filter-section">
            <h3 className="filter-title">Tags</h3>
            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          {/* Job Board Ad */}
          <div className="job-board-ad">
            <h2>WE ARE HIRING</h2>
            <p>Apply Today!</p>
          </div>
        </div>

        {/* Right side job listings - REDESIGNED */}
        <div className="job-listings-results">
          {/* Results header */}
          <div className="results-header">
            <div className="results-count">Showing 6-6 of 10 results</div>
            <div className="sort-container">
              <select className="sort-select" onChange={scrollToTop}>
                <option value="latest">Sort by latest</option>
                <option value="salary-high">Sort by salary (high to low)</option>
                <option value="salary-low">Sort by salary (low to high)</option>
              </select>
            </div>
          </div>

          {/* REDESIGNED job cards grid */}
          <div className="job-cards-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card-modern">
                {/* Date and bookmark row */}
                <div className="job-card-header">
                  <div className="job-date">{job.date}</div>
                  <button 
                    className="bookmark-btn-modern"
                    onClick={() => toggleBookmark(job.id)}
                  >
                    {job.bookmarked ? 
                      <Bookmark size={18} fill="#000" color="#000" /> : 
                      <Bookmark size={18} color="#000" />
                    }
                  </button>
                </div>
                
                {/* Company and job title section */}
                <div className="job-company-info">
                  <div 
                    className="company-logo" 
                    style={getCompanyLogoStyle(job.company)}
                  >
                    {job.company === 'Google' && <span>G</span>}
                    {job.company === 'Apple' && <span>♫</span>}
                    {job.company === 'Twitter' && <span>t</span>}
                    {job.company === 'Dribbble' && <span>●</span>}
                    {job.company === 'Amazon' && <span>a</span>}
                    {job.company === 'Airbnb' && <span>◎</span>}
                  </div>
                  <div className="job-title-company-info">
                    <div className="company-name">{job.company}</div>
                    <h3 className="job-title-modern">{job.title}</h3>
                  </div>
                </div>
                
                {/* Tags section */}
                <div className="job-tags">
                  {Array.isArray(job.tags) && job.tags.map((tag, index) => (
                    <span key={index} className="job-tag">{tag}</span>
                  ))}
                  {Array.isArray(job.workType) ? 
                    job.workType.map((type, index) => (
                      <span key={`work-${index}`} className="job-tag work-type">{type}</span>
                    )) : 
                    job.workType && <span className="job-tag work-type">{job.workType}</span>
                  }
                </div>
                
                {/* Salary and location section */}
                <div className="job-footer">
                  <div className="job-salary">{job.salary}</div>
                  <div className="job-location">{job.location}</div>
                  <Link to='/job-detail' className="details-link">
                    <button className="details-btn" onClick={handleJobDetailsClick}>
                      Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className={`page-btn ${currentPage === 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
            <button
              className={`page-btn ${currentPage === 2 ? 'active' : ''}`}
              onClick={() => handlePageChange(2)}
            >
              2
            </button>
            <button className="next-btn" onClick={() => handlePageChange(currentPage + 1)}>
              Next <span className="next-icon">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListings;