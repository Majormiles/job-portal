import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Bookmark, Filter, X, ChevronDown, ChevronUp, AlertCircle, Loader } from 'lucide-react';
import { getJobs, getFeaturedJobs } from '../../services/jobService';
import { getCategories } from '../../services/categoryService';
import { searchJobs, getCategorySuggestions, getLocationSuggestions } from '../../services/searchService';
import { formatSalary, formatDate } from '../../utils/formatters';
import '../css/JobListings.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};


const JobListings = () => {
  const locationHook = useLocation();
  const navigate = useNavigate();
  
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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [salaryRange, setSalaryRange] = useState([0, 9999]);
  const [sortBy, setSortBy] = useState('latest');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  
  // Job type data with counts (will be dynamically updated)
  const [jobTypes, setJobTypes] = useState([
    { name: "Full Time", count: 0 },
    { name: "Part Time", count: 0 },
    { name: "Freelance", count: 0 },
  ]);
  
  // Tags state (will be dynamically generated)
  const [tags, setTags] = useState([]);
  
  // Filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);
  // Sticky sidebar state
  const [isSticky, setIsSticky] = useState(false);
  
  // Debounced search term (to prevent too many API calls)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Location options - dynamic options will be populated based on available locations
  const [locationOptions, setLocationOptions] = useState([
    { value: '', label: 'Choose city' }
  ]);
  
  // Add a state variable to track when filtering is active
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Parse search parameters from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    console.log('Processing URL search params:', Object.fromEntries(params.entries()));
    
    // Get query parameter (from Header-one search)
    const queryParam = params.get('query');
    if (queryParam) {
      console.log('Found query param:', queryParam);
      setSearchTerm(queryParam);
      setDebouncedSearchTerm(queryParam);
    }
    
    // Get location parameter
    const locationParam = params.get('location');
    if (locationParam) {
      console.log('Found location param:', locationParam);
      setLocation(locationParam);
    }
    
    // Get category parameter
    const categoryParam = params.get('category');
    if (categoryParam) {
      console.log('Found category param:', categoryParam);
      setSelectedCategory(categoryParam);
    }

    // Check for active filters
    if (queryParam || locationParam || categoryParam) {
      setHasActiveFilters(true);
    }

    // If any search parameters are present, we should update URL with consistent parameter names
    if (queryParam || locationParam || categoryParam) {
      // Build consistent URL parameters
      const urlParams = new URLSearchParams();
      if (queryParam) urlParams.set('query', queryParam);
      if (locationParam) urlParams.set('location', locationParam);
      if (categoryParam) urlParams.set('category', categoryParam);
      
      // Check if current URL params differ from our standardized ones
      if (urlParams.toString() !== params.toString()) {
        console.log('Normalizing URL parameters for consistency');
        navigate({
          pathname: locationHook.pathname,
          search: urlParams.toString()
        }, { replace: true });
      }
    }
  }, [locationHook.search, navigate, locationHook.pathname]);
  
  // Function to fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      // Get categories with job counts
      const categorySuggestions = await getCategorySuggestions();
      
      if (categorySuggestions && categorySuggestions.length > 0) {
        // Format categories with count (initializing counts to 0)
        const formattedCategories = categorySuggestions.map(cat => ({
          id: cat.id,
          name: cat.name,
          count: 0
        }));
        
        console.log('Categories loaded:', formattedCategories);
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);
  
  // Add a function to update category counts after job fetch
  const updateCategoryCounts = useCallback((jobsData) => {
    // Create a map to count jobs by category
    const categoryCounts = {};
    
    // Count jobs by category ID
    jobsData.forEach(job => {
      if (job.category) {
        const categoryId = typeof job.category === 'object' ? job.category._id : job.category;
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      }
    });
    
    // Update existing categories with new counts
    setCategories(prevCategories => {
      return prevCategories.map(cat => ({
        ...cat,
        count: categoryCounts[cat.id] || 0
      }));
    });
    
    console.log('Updated category counts:', categoryCounts);
  }, []);
  
  // Function to generate job type counts
  const updateJobTypeCounts = useCallback((jobsData) => {
    // Initialize counts
    const typeCounts = {
      'full-time': 0,
      'part-time': 0,
      'freelance': 0,
      // Add other job types as needed
    };
    
    // Count jobs by type
    jobsData.forEach(job => {
      const jobType = (job.type || '').toLowerCase();
      if (typeCounts.hasOwnProperty(jobType)) {
        typeCounts[jobType]++;
      }
    });
    
    // Update job types state with counts
    setJobTypes([
      { name: "Full Time", count: typeCounts['full-time'] || 0 },
      { name: "Part Time", count: typeCounts['part-time'] || 0 },
      { name: "Freelance", count: typeCounts['freelance'] || 0 },
    ]);
  }, []);
  
  // Function to extract unique locations
  const extractLocations = useCallback(async () => {
    try {
      const locationSuggestions = await getLocationSuggestions();
      
      if (locationSuggestions && locationSuggestions.length > 0) {
        // Add default option if not present
        if (!locationSuggestions.some(loc => loc.value === '')) {
          locationSuggestions.unshift({ value: '', label: 'Choose city' });
        }
        
        setLocationOptions(locationSuggestions);
      }
    } catch (error) {
      console.error('Error extracting locations:', error);
    }
  }, []);
  
  // Function to extract tags from jobs
  const extractTags = useCallback((jobsData) => {
    const tagSet = new Set();
    
    // Extract tags from job titles, skills, and other relevant fields
    jobsData.forEach(job => {
      // Extract from title
      const titleWords = job.title?.toLowerCase().split(/\s+/) || [];
      titleWords.forEach(word => {
        if (word.length > 3) tagSet.add(word);
      });
      
      // Extract from skills
      if (Array.isArray(job.skills)) {
        job.skills.forEach(skill => {
          tagSet.add(skill.toLowerCase());
        });
      }
      
      // Add job type as tag
      if (job.type) {
        tagSet.add(job.type.replace('-', ' '));
      }
      
      // Add experience level as tag
      if (job.experience) {
        const expLevel = job.experience === 'entry' ? 'entry level' :
                         job.experience === 'mid' ? 'mid level' :
                         job.experience === 'senior' ? 'senior level' : '';
        if (expLevel) tagSet.add(expLevel);
      }
    });
    
    // Get most common tags (up to 10)
    const filteredTags = Array.from(tagSet)
      .filter(tag => tag.length > 3 && tag.length < 15)
      .slice(0, 10);
    
    setTags(filteredTags);
  }, []);
  
  // Function to fetch jobs with filters using the search service
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsFiltering(true);
    
    try {
      // Construct search parameters object with standardized naming for consistency with searchService.js
      const searchParams = {
        query: debouncedSearchTerm,  // Consistent with searchService.js parameter naming
        location: location,          // Fixed: no more 'location_'
        category: selectedCategory,
        jobTypes: selectedJobTypes,
        salaryRange: salaryRange,
        sortBy: sortBy,
        page: currentPage,
        limit: itemsPerPage
      };
      
      console.log('Searching jobs with standardized params:', searchParams);
      
      // Use the searchJobs function from searchService
      const response = await searchJobs(searchParams);
      
      if (response.success) {
        console.log(`Search returned ${response.data.length} jobs`);

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
          salary: formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency) || 
                 formatSalary(job.minSalary, job.maxSalary),
          location: job.location,
          logoText: job.company?.name?.charAt(0) || 'C',
          bookmarked: false, // In a real app, this would be determined by user data
          _id: job._id // Keep original ID for API operations
        }));
        
        setJobs(transformedJobs);

        // Update job type counts and category counts based on results
        updateJobTypeCounts(response.data);
        updateCategoryCounts(response.data);
        
        // Extract tag suggestions from results
        extractTags(response.data);
        
        // Set pagination data from response meta
        if (response.meta) {
          setTotalJobs(response.meta.total || 0);
          setTotalPages(response.meta.totalPages || 1);
          console.log(`Pagination info: page ${response.meta.page} of ${response.meta.totalPages}, total: ${response.meta.total} jobs`);
        } else {
          setTotalJobs(response.data.length);
          setTotalPages(1);
          console.log(`No pagination info, showing all ${response.data.length} jobs`);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs');
      setJobs([]);
      setTotalJobs(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      // Set isFiltering to false after a short delay to allow for animations
      setTimeout(() => {
        setIsFiltering(false);
      }, 300);
    }
  }, [currentPage, debouncedSearchTerm, itemsPerPage, location, selectedCategory, 
      selectedJobTypes, salaryRange, sortBy, updateJobTypeCounts, updateCategoryCounts, extractTags]);
  
  // Initial setup - fetch categories and locations
  useEffect(() => {
    // Fetch categories initially
    fetchCategories();
    
    // Fetch location options
    extractLocations();
    
    // Set up interval to periodically refresh category data
    const intervalId = setInterval(() => {
      fetchCategories();
    }, 60000); // Refresh every minute
    
    // Clean up
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchCategories, extractLocations]);
  
  // Effect to fetch jobs when dependencies change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  // Effect for search debouncing - update to be more responsive
  useEffect(() => {
    // For empty search, clear the debounced term and fetch all jobs
    if (searchTerm === '') {
      setDebouncedSearchTerm('');
      return () => {};
    }
    
    // Even for very short search terms (1-2 chars), we still want to search
    // but after a slightly longer delay to prevent too many API calls
    const delayTime = searchTerm.length <= 2 ? 800 : 400;
    
    console.log(`Setting search debounce timer for ${delayTime}ms with term: "${searchTerm}"`);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delayTime);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, location, selectedJobTypes, salaryRange, sortBy]);
  
  // Function to toggle bookmark status - would be connected to user data in a real app
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
  
  // Handle job type selection
  const handleJobTypeChange = (e, jobType) => {
    const formattedType = jobType.toLowerCase().replace(' ', '-');
    if (e.target.checked) {
      setSelectedJobTypes([...selectedJobTypes, formattedType]);
    } else {
      setSelectedJobTypes(selectedJobTypes.filter(type => type !== formattedType));
    }
  };
  
  // Handle category selection
  const handleCategoryChange = (e, categoryId) => {
    setSelectedCategory(e.target.checked ? categoryId : '');
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
      // Set as sticky when scrolled past 100px
      setIsSticky(offset > 100);
    };
    
    // Call handleScroll right away to check initial position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Apply filters
  const handleApplyFilters = () => {
    console.log('Applying filters:', {
      query: searchTerm,
      category: selectedCategory,
      location: location,
      jobTypes: selectedJobTypes,
      salaryRange,
      sortBy
    });
    setCurrentPage(1);
    
    // Update URL with search parameters - using consistent naming
    const params = new URLSearchParams();
    if (searchTerm) params.set('query', searchTerm);
    if (location) params.set('location', location);
    if (selectedCategory) params.set('category', selectedCategory);
    
    // Update browser URL to reflect filters
    navigate({
      pathname: locationHook.pathname,
      search: params.toString()
    }, { replace: true });
    
    // Update debounced search term
    setDebouncedSearchTerm(searchTerm);
    
    // Execute search
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
    
    // Clear URL parameters
    navigate(locationHook.pathname, { replace: true });
    
    // Reset page
    setCurrentPage(1);
    
    // Execute search with reset filters
    setTimeout(() => fetchJobs(), 0);
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
    <>
      <ScrollToTop />

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
            scrollbarWidth: 'thin', 
            scrollbarColor: '#D3D3D3 transparent'
          }}
        >
          {/* Search by job title */}
          <div className="filter-section">
            <h3 className="filter-title">Search Jobs</h3>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Type even a single letter to search..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  // Submit search on Enter key
                  if (e.key === 'Enter') {
                    setDebouncedSearchTerm(searchTerm);
                    fetchJobs();
                  }
                }}
              />
              {searchTerm ? (
                <X 
                  className="search-icon-clear" 
                  size={18} 
                  color="#666"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSearchTerm('');
                    setDebouncedSearchTerm('');
                    setTimeout(() => fetchJobs(), 0);
                  }}
                />
              ) : (
                <Search 
                  className="search-icon" 
                  size={18} 
                  color="#666"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setDebouncedSearchTerm(searchTerm);
                    fetchJobs();
                  }}
                />
              )}
            </div>
            {debouncedSearchTerm && (
              <div className="active-search">
                <div className="active-search-term">
                  Searching: <strong>{debouncedSearchTerm}</strong>
                  {loading && (
                    <span className="search-loading">
                      <Loader size={12} className="animate-spin" />
                    </span>
                  )}
                </div>
              </div>
            )}
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
              {categories.length === 0 ? (
                <div className="loading-categories">Loading categories...</div>
              ) : (
                categories.map((category, index) => (
                  <div key={category.id || index} className="checkbox-item">
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
                ))
              )}
            </div>
            {categories.length > 5 && <button className="show-more-btn">Show More</button>}
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
                    checked={selectedJobTypes.includes(jobType.name.toLowerCase().replace(' ', '-'))}
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
              <input
                type="range"
                min="0"
                max="9999"
                value={salaryRange[0]}
                onChange={(e) => setSalaryRange([parseInt(e.target.value), salaryRange[1]])}
                className="salary-slider"
                style={{ marginTop: '10px' }}
              />
            </div>
            <div className="salary-range-display">
              <span>From: ${salaryRange[0]} - To: ${salaryRange[1]}</span>
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
              <div className={`job-cards-grid ${isFiltering ? 'filtering' : ''}`}>
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
                      key={job.id || job._id} 
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
                        } else if (job.id) {
                          window.location.href = `/job-detail/${job.id}`;
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
                            toggleBookmark(job.id || job._id);
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
                          {/* Show company logo or first letter */}
                          {job.company === 'Google' && <span>G</span>}
                          {job.company === 'Apple' && <span>♫</span>}
                          {job.company === 'Twitter' && <span>t</span>}
                          {job.company === 'Dribbble' && <span>●</span>}
                          {job.company === 'Amazon' && <span>a</span>}
                          {job.company === 'Airbnb' && <span>◎</span>}
                          {!['Google', 'Apple', 'Twitter', 'Dribbble', 'Amazon', 'Airbnb'].includes(job.company) && 
                            <span>{job.logoText || job.company?.charAt(0) || 'C'}</span>
                          }
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
                        <Link 
                          to={job._id ? `/job-detail/${job._id}` : job.id ? `/job-detail/${job.id}` : '/job-detail'} 
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

    </>
  );
};

export default JobListings;