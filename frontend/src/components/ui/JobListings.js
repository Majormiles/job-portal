import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import '../css/JobListings.css';


const JobListings = () => {
  // Sample job data based on the image
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Forward Security Director",
      company: "Bauch, Schuppe and Schulist Co",
      category: "Hotels & Tourism",
      jobType: "Full time",
      salary: "$40000-$42000",
      location: "Northern Region, Ghana",
      postedAgo: "10 min ago",
      logo: "logo-placeholder-1.png"
    },
    {
      id: 2,
      title: "Regional Creative Facilitator",
      company: "Wisozk - Becker Co",
      category: "Media",
      jobType: "Part time",
      salary: "$28000-$32000",
      location: "Greater Accra, Ghana",
      postedAgo: "12 min ago",
      logo: "logo-placeholder-2.png"
    },
    {
      id: 3,
      title: "Internal Integration Planner",
      company: "Mraz, Quigley and Feast Inc.",
      category: "Construction",
      jobType: "Full time",
      salary: "$48000-$50000",
      location: "Volta Region, Ghana",
      postedAgo: "15 min ago",
      logo: "logo-placeholder-3.png"
    },
    {
      id: 4,
      title: "District Intranet Director",
      company: "VonRueden - Weber Co",
      category: "Commerce",
      jobType: "Full time",
      salary: "$42000-$48000",
      location: "Ashanti Region, Ghana",
      postedAgo: "24 min ago",
      logo: "logo-placeholder-4.png"
    },
    {
      id: 5,
      title: "Corporate Tactics Facilitator",
      company: "Cormier, Turner and Flatley Inc",
      category: "Commerce",
      jobType: "Full time",
      salary: "$38000-$40000",
      location: "Greater Accra, Ghana",
      postedAgo: "26 min ago",
      logo: "logo-placeholder-5.png"
    },
    {
      id: 6,
      title: "Forward Accounts Consultant",
      company: "Miller Group",
      category: "Financial services",
      jobType: "Full time",
      salary: "$45000-$48000",
      location: "Greater Accra, Ghana",
      postedAgo: "30 min ago",
      logo: "logo-placeholder-6.png"
    }
  ]);

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
    // You can add navigation logic here if needed
    // For example: navigate(`/job-details/${jobId}`);

    // Scroll to top
    scrollToTop();
  };

  // Handle pagination click
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // The useEffect above will handle scrolling to the top
  };

  // Handle sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100); // Start sticking after scrolling 100px
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
        {/* Left sidebar with filters */}
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

        {/* Right side job listings */}
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

          {/* Job listings */}
          <div className="jobs-container">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-card-left">
                  <div className="job-posted-time">{job.postedAgo}</div>
                  <div className="job-header">
                    <div className="job-logo">
                      <div className="logo-placeholder"></div>
                    </div>
                    <div className="job-title-company">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="company-name">{job.company}</p>
                    </div>
                  </div>
                  <div className="job-details">
                    <div className="job-detail-item">
                      <span className="detail-icon">🏢</span>
                      <span className="detail-text">{job.category}</span>
                    </div>
                    <div className="job-detail-item">
                      <span className="detail-icon">⏱️</span>
                      <span className="detail-text">{job.jobType}</span>
                    </div>
                    <div className="job-detail-item">
                      <span className="detail-icon">💰</span>
                      <span className="detail-text">{job.salary}</span>
                    </div>
                    <div className="job-detail-item">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{job.location}</span>
                    </div>
                  </div>
                </div>
                <div className="job-card-right">
                  <button className="bookmark-btn">🔖</button>

                  <Link to='/job-detail'><button className="job-details-btn" onClick={handleJobDetailsClick}>Job Details</button></Link>
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