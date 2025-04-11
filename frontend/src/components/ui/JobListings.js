import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Bookmark, Filter, X, ChevronDown, ChevronUp, AlertCircle, Loader } from 'lucide-react';
import { getJobs, searchJobs } from '../../services/jobService';
import { getCategories } from '../../services/categoryService';
import { formatSalary, formatDate } from '../../utils/formatters';
import '../css/JobListings.css';

const JobListings = () => {
  // State for jobs data
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(6); // To maintain the design with 6 jobs per page
  
  // State for filters
  const [categories, setCategories] = useState([
    { name: "Commerce", count: 10 },
    { name: "Telecommunications", count: 10 },
    { name: "Hotels & Tourism", count: 10 },
    { name: "Education", count: 10 },
    { name: "Financial Services", count: 10 }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [salaryRange, setSalaryRange] = useState([0, 9999]);
  const [sortBy, setSortBy] = useState('latest');
  
  // Filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);
  // Sticky sidebar state
  const [isSticky, setIsSticky] = useState(false);
  
  // Job types with counts
  const jobTypes = [
    { name: "Full Time", count: 10 },
    { name: "Part Time", count: 10 },
    { name: "Freelance", count: 10 },
  ];
  
  // Tags
  const tags = ["engineering", "design", "ui/ux", "marketing", "management", "soft", "construction"];
  
  // Debounced search term (to prevent too many API calls)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Location options
  const locationOptions = [
    { value: '', label: 'Choose city' },
    { value: 'accra', label: 'Accra' },
    { value: 'kumasi', label: 'Kumasi' },
    { value: 'tamale', label: 'Tamale' },
    { value: 'remote', label: 'Remote' }
  ];
  
  // Function to fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      if (response.success && response.data) {
        // Format categories with count
        const formattedCategories = response.data.map(cat => ({
          id: cat._id,
          name: cat.name,
          count: cat.jobCount || 0
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);
  
  // Function to fetch jobs with filters
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare query parameters based on filters
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy
      };
      
      // Add search term if present
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }
      
      // Add category filter if selected
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      // Add location filter if selected
      if (location) {
        params.location = location;
      }
      
      // Add job type filters if selected
      if (selectedJobTypes.length > 0) {
        params.type = selectedJobTypes.join(',');
      }
      
      // Add salary range if modified
      if (salaryRange[0] > 0 || salaryRange[1] < 9999) {
        params.minSalary = salaryRange[0];
        params.maxSalary = salaryRange[1];
      }
      
      // Call API
      const response = await getJobs(params);
      
      if (response.success) {
        // Transform API data to match component structure
        const transformedJobs = response.data.map(job => ({
          id: job._id,
          title: job.title,
          company: job.company?.name || 'Company',
          date: formatDate(job.createdAt),
          tags: [
            job.type?.replace('-', ' ') || 'Full time',
            job.experience === 'entry' ? 'Entry level' :
            job.experience === 'mid' ? 'Mid level' :
            job.experience === 'senior' ? 'Senior level' : 'Experience',
            job.location.includes('Remote') ? 'Remote' : 'On-site'
          ],
          workType: job.type?.replace('-', ' ') || 'Full time',
          salary: formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency),
          location: job.location,
          logoText: job.company?.name?.charAt(0) || 'C',
          bookmarked: false,
          _id: job._id // Keep original ID for API operations
        }));
        
        setJobs(transformedJobs);
        
        // Set pagination data
        if (response.meta) {
          setTotalJobs(response.meta.total || 0);
          setTotalPages(response.meta.totalPages || 1);
        } else if (response.pagination) {
          setTotalJobs(response.pagination.total || 0);
          setTotalPages(response.pagination.totalPages || 1);
        } else {
          setTotalJobs(response.data.length);
          setTotalPages(1);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs');
      
      // Use sample data as fallback when API fails
      setJobs([
        {
          id: 1,
          title: "Senior UI/UX Designer",
          company: "Amazon",
          date: "20 May, 2023",
          tags: ["Part time", "Senior level", "Distant"],
          workType: "Project work",
          salary: "$250/hr",
          location: "San Francisco, CA",
          logoText: "a",
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
          logoText: "D",
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
          logoText: "t",
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
          logoText: "a",
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
          logoText: "a",
          bookmarked: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, itemsPerPage, location, selectedCategory, selectedJobTypes, salaryRange, sortBy]);
  
  // Effect to fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Effect to fetch jobs when dependencies change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  // Effect for search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, location, selectedJobTypes, salaryRange, sortBy]);
  
  // Function to toggle bookmark status
  const toggleBookmark = (id) => {
    setJobs(
      jobs.map(job => 
        job.id === id ? { ...job, bookmarked: !job.bookmarked } : job
      )
    );
    // In a real application, you would call an API here to save the bookmark status
  };
  
  // Function to get company-specific styles for logos
  const getCompanyLogoStyle = (company) => {
    const logoStyles = {
      'Amazon': { background: '#FFF1E6', color: '#000', borderRadius: '4px' },
      'Google': { background: '#E6F7F1', color: '#000', borderRadius: '50%' },
      'Dribbble': { background: '#F3E6F7', color: '#EA4C89', borderRadius: '50%' },
      'Twitter': { background: '#E6F2FF', color: '#1DA1F2', borderRadius: '50%' },
      'Airbnb': { background: '#FFE6EC', color: '#FF5A5F', borderRadius: '50%' },
      'Apple': { background: '#F5F5F7', color: '#000', borderRadius: '50%' },
      'Microsoft': { background: '#E6F2FF', color: '#00A4EF', borderRadius: '4px' },
      'Facebook': { background: '#E6F2FF', color: '#1877F2', borderRadius: '50%' }
    };
    
    // Use company name, or return default style
    return logoStyles[company] || { background: '#f0f0f0', color: '#333', borderRadius: '4px' };
  };
  
  // Function to get company logo letter
  const getCompanyLogo = (company) => {
    const logos = {
      'Google': 'G',
      'Apple': '♫',
      'Twitter': 't',
      'Dribbble': '●',
      'Amazon': 'a',
      'Airbnb': '◎',
      'Microsoft': 'M',
      'Facebook': 'f'
    };
    
    return logos[company] || company.charAt(0).toUpperCase();
  };
  
  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Handle job details button click
  const handleJobDetailsClick = () => {
    scrollToTop();
  };
  
  // Handle pagination click
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      scrollToTop();
    }
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
  
  // Handle job type selection
  const handleJobTypeChange = (e, jobType) => {
    if (e.target.checked) {
      setSelectedJobTypes([...selectedJobTypes, jobType.toLowerCase()]);
    } else {
      setSelectedJobTypes(selectedJobTypes.filter(type => type !== jobType.toLowerCase()));
    }
  };
  
  // Handle category selection
  const handleCategoryChange = (e, categoryId) => {
    setSelectedCategory(e.target.checked ? categoryId : '');
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchJobs();
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategory('');
    setLocation('');
    setSelectedJobTypes([]);
    setSalaryRange([0, 9999]);
    setSortBy('latest');
    setCurrentPage(1);
  };
  
  // Add this CSS to the component for loading state and empty state styling

  const jobCardSkeletonStyle = {
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    animation: 'pulse 1.5s infinite ease-in-out',
    height: '240px'
  };

  const skeletonItemStyle = {
    backgroundColor: '#eee',
    borderRadius: '4px',
    height: '12px',
    margin: '8px 0',
    animation: 'pulse 1.5s infinite ease-in-out'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginBottom: '20px'
  };
  
  // In the component function, add a style for hover effect
  const jobCardHoverStyle = {
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer'
  };
  
  return (
    <div className="job-listings-container">
      {/* Mobile filter toggle button */}
      <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? <><X size={16} /> Hide Filters</> : <><Filter size={16} /> Show Filters</>}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={18} color="#666" />
            </div>
          </div>
          
          {/* Location */}
          <div className="filter-section">
            <h3 className="filter-title">Location</h3>
            <div className="select-container">
              <select 
                className="location-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {locationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
                  <input 
                    type="checkbox" 
                    id={`category-${index}`} 
                    className="filter-checkbox"
                    checked={selectedCategory === category.id}
                    onChange={(e) => handleCategoryChange(e, category.id)}
                  />
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
                  <input 
                    type="checkbox" 
                    id={`jobType-${index}`} 
                    className="filter-checkbox"
                    checked={selectedJobTypes.includes(jobType.name.toLowerCase())}
                    onChange={(e) => handleJobTypeChange(e, jobType.name)}
                  />
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
              <button className="apply-btn" onClick={handleApplyFilters}>Apply</button>
            </div>
          </div>
          
          {/* Tags */}
          <div className="filter-section">
            <h3 className="filter-title">Tags</h3>
            <div className="tags-container">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="tag"
                  onClick={() => setSearchTerm(tag)}
                  style={{ cursor: 'pointer' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Reset Filters */}
          <div className="filter-section">
            <button 
              onClick={resetFilters}
              className="apply-btn"
              style={{ width: '100%' }}
            >
              Reset All Filters
            </button>
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
            <div className="results-count">
              {loading ? 'Loading...' : 
                `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalJobs)} of ${totalJobs} results`
              }
            </div>
            <div className="sort-container">
              <select 
                className="sort-select" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Sort by latest</option>
                <option value="salary-high">Sort by salary (high to low)</option>
                <option value="salary-low">Sort by salary (low to high)</option>
                <option value="relevance">Sort by relevance</option>
              </select>
            </div>
          </div>
          
          {/* Show loading indicator */}
          {loading ? (
            <div className="loading-container" style={{ textAlign: 'center', padding: '50px 0' }}>
              <Loader className="animate-spin" size={40} color="#4a90e2" />
              <p>Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="error-container" style={{ textAlign: 'center', padding: '50px 0' }}>
              <AlertCircle size={40} color="#e74c3c" />
              <p>{error}</p>
              <button 
                onClick={() => fetchJobs()}
                className="apply-btn"
                style={{ marginTop: '20px' }}
              >
                Try Again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-container" style={{ textAlign: 'center', padding: '50px 0' }}>
              <AlertCircle size={40} color="#f39c12" />
              <p>No jobs found matching your criteria.</p>
              <button 
                onClick={resetFilters}
                className="apply-btn"
                style={{ marginTop: '20px' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* REDESIGNED job cards grid */}
              <div className="job-cards-grid">
                {loading ? (
                  // Loading skeleton
                  Array(6).fill().map((_, index) => (
                    <div key={index} style={jobCardSkeletonStyle}>
                      <div style={{...skeletonItemStyle, width: '30%'}}></div>
                      <div style={{...skeletonItemStyle, width: '15%', float: 'right'}}></div>
                      <div style={{...skeletonItemStyle, width: '60%', marginTop: '25px'}}></div>
                      <div style={{...skeletonItemStyle, width: '80%'}}></div>
                      <div style={{...skeletonItemStyle, width: '40%'}}></div>
                      <div style={{...skeletonItemStyle, width: '60%', marginTop: '25px'}}></div>
                      <div style={{...skeletonItemStyle, width: '30%', marginTop: '25px'}}></div>
                    </div>
                  ))
                ) : error ? (
                  // Error state
                  <div style={emptyStateStyle} className="col-span-2">
                    <div style={{marginBottom: '15px'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>{error}</h3>
                    <p style={{marginBottom: '20px', color: '#666'}}>We couldn't load the jobs at this time.</p>
                    <button 
                      onClick={fetchJobs} 
                      className="apply-btn"
                      style={{padding: '8px 20px'}}
                    >
                      Try Again
                    </button>
                  </div>
                ) : jobs.length === 0 ? (
                  // Empty state
                  <div style={emptyStateStyle} className="col-span-2">
                    <div style={{marginBottom: '15px'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f39c12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                    </div>
                    <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>No jobs found</h3>
                    <p style={{marginBottom: '20px', color: '#666'}}>Try adjusting your search filters to find more results.</p>
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                        setLocation('');
                        setSelectedJobTypes([]);
                        setSalaryRange([0, 9999]);
                        setCurrentPage(1);
                        fetchJobs();
                      }} 
                      className="apply-btn"
                      style={{padding: '8px 20px'}}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  // Job cards
                  jobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="job-card-modern"
                      style={{
                        ...jobCardHoverStyle,
                        ':hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }
                      }}
                      onClick={() => {
                        if (job._id) {
                          window.location.href = `/job-detail/${job._id}`;
                        } else {
                          window.location.href = '/job-detail';
                        }
                        scrollToTop();
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                      }}
                    >
                      {/* Date and bookmark row */}
                      <div className="job-card-header">
                        <div className="job-date">{job.date}</div>
                        <button 
                          className="bookmark-btn-modern"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            toggleBookmark(job.id);
                          }}
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
                          {!['Google', 'Apple', 'Twitter', 'Dribbble', 'Amazon', 'Airbnb'].includes(job.company) && 
                            <span>{job.logoText}</span>
                          }
                        </div>
                        <div className="job-title-company-info">
                          {/* Remove the company name div */}
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
                        <Link 
                          to={job._id ? `/job-detail/${job._id}` : '/job-detail'} 
                          className="details-link"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the card click event when clicking on the button
                            handleJobDetailsClick();
                          }}
                        >
                          <button className="details-btn">
                            Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Pagination - only show when we have jobs and more than one page */}
              {!loading && !error && jobs.length > 0 && totalPages > 1 && (
                <div className="pagination">
                  {currentPage > 1 && (
                    <button
                      className="page-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Prev
                    </button>
                  )}
                  
                  {/* Create array of page numbers */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first, last, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          className={`page-btn ${currentPage === pageNumber ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    // Show ellipsis for page gaps
                    if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return <span key={pageNumber} className="page-ellipsis">...</span>;
                    }
                    return null;
                  })}
                  
                  {currentPage < totalPages && (
                    <button
                      className="next-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next <span className="next-icon">→</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;