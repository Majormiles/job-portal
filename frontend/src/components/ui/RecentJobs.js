import React, { useState, useEffect } from 'react';
import { BookmarkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../css/RecentJobs.css';
import { getRecentJobs, getRelatedJobs } from '../../services/jobService';
import { getCategorySuggestions } from '../../services/searchService';
import { toast } from 'react-toastify';

// Cache expiration time in milliseconds (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000;

const RecentJobs = () => {
  // State for data and loading
  const [jobs, setJobs] = useState([]);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheUsed, setCacheUsed] = useState(false);
  
  // Format location helper
  const formatLocation = (job) => {
    if (!job) return 'Remote';
    
    if (job.location?.city && (job.location.state || job.location.country)) {
      return `${job.location.city}, ${job.location.state || job.location.country}`;
    } else if (job.location?.city) {
      return job.location.city;
    } else if (typeof job.location === 'string' && job.location.trim()) {
      return job.location;
    } else if (job.remoteOption) {
      return 'Remote';
    }
    
    return 'Remote';
  };
  
  // Helper function to determine company logo for related jobs
  const determineCompanyLogo = (company) => {
    if (!company) return 'oracle';
    
    const companyLower = company.toLowerCase();
    if (companyLower.includes('amazon')) return 'amazon';
    if (companyLower.includes('microsoft')) return 'microsoft';
    if (companyLower.includes('oracle')) return 'oracle';
    if (companyLower.includes('google')) return 'microsoft';
    if (companyLower.includes('apple')) return 'amazon';
    
    // Default to a deterministic logo based on first letter
    const firstLetter = company.charAt(0).toLowerCase();
    const logos = ['oracle', 'microsoft', 'amazon'];
    const index = firstLetter.charCodeAt(0) % logos.length;
    return logos[index];
  };
  
  // Helper to determine company background color
  const determineCompanyBackground = (company) => {
    if (!company) return '#f0f0f0';
    
    const companyLower = company.toLowerCase();
    if (companyLower.includes('amazon')) return '#FFF1E6';
    if (companyLower.includes('google')) return '#E6F7F1';
    if (companyLower.includes('dribbble')) return '#F3E6F7';
    if (companyLower.includes('twitter')) return '#E6F2FF';
    if (companyLower.includes('airbnb')) return '#FFE6EC';
    if (companyLower.includes('apple')) return '#F5F5F7';
    
    // Generate a deterministic light color based on company name
    const hash = Array.from(company).reduce((acc, char) => 
      acc + char.charCodeAt(0), 0);
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 95%)`;
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recent';
    
    // For recent dates, show "X days ago" format
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return diffDays <= 1 ? 'Today' : `${diffDays} days ago`;
    }
    
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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

    return logos[company] || <span className="company-logo-text">{company.charAt(0).toUpperCase()}</span>;
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

    return backgrounds[company] || determineCompanyBackground(company);
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

  // Get company logo for related jobs
  const getRelatedJobLogo = (logo) => {
    const logoImages = {
      'oracle': <div className="related-job-logo oracle-logo">O</div>,
      'microsoft': <div className="related-job-logo microsoft-logo">
        <div className="ms-grid">
          <div className="ms-square red"></div>
          <div className="ms-square green"></div>
          <div className="ms-square blue"></div>
          <div className="ms-square yellow"></div>
        </div>
      </div>,
      'amazon': <div className="related-job-logo amazon-logo">a</div>
    };

    return logoImages[logo] || <div className="related-job-logo generic-logo">{logo.charAt(0).toUpperCase()}</div>;
  };

  // Function to clear cache and reload data
  const handleRefresh = () => {
    try {
      localStorage.removeItem('recentJobsCache');
      setCacheUsed(false);
      setLoading(true);
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };

  // Helper function to save data to localStorage with expiration
  const saveDataToCache = (jobsData, relatedJobsData, categoriesData) => {
    try {
      if (!jobsData || jobsData.length === 0) return;
      
      const cacheData = {
        jobs: jobsData,
        relatedJobs: relatedJobsData || [],
        categories: categoriesData || [],
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('recentJobsCache', JSON.stringify(cacheData));
      console.log('Saved job data to cache');
    } catch (error) {
      console.warn('Failed to save job data to cache:', error);
    }
  };
  
  // Helper function to get data from localStorage with expiration check
  const getDataFromCache = () => {
    try {
      const cachedDataString = localStorage.getItem('recentJobsCache');
      if (!cachedDataString) return null;
      
      const cachedData = JSON.parse(cachedDataString);
      const now = new Date().getTime();
      
      // Check if cache is expired
      if (now - cachedData.timestamp > CACHE_EXPIRATION) {
        console.log('Cache expired, clearing...');
        localStorage.removeItem('recentJobsCache');
        return null;
      }
      
      // Check if we have valid job data
      if (cachedData.jobs && cachedData.jobs.length > 0) {
        return cachedData;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to read job data from cache:', error);
      return null;
    }
  };
  
  // Generate similar jobs based on existing jobs as a fallback
  const generateSimilarJobs = (existingJobs, category) => {
    if (!existingJobs || existingJobs.length === 0) {
      setRelatedJobs([]);
      return [];
    }
    
    // Pick 2-3 random jobs from the existing jobs list that aren't the first one
    const randomJobs = [...existingJobs];
    if (randomJobs.length > 1) {
      // Remove the first job (to avoid showing the same job)
      randomJobs.shift();
      // Shuffle the array
      for (let i = randomJobs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomJobs[i], randomJobs[j]] = [randomJobs[j], randomJobs[i]];
      }
    }
    
    // Take the first 3 jobs or fewer if not enough
    const similarJobs = randomJobs.slice(0, Math.min(3, randomJobs.length)).map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      logo: determineCompanyLogo(job.company)
    }));
    
    console.log('Generated similar jobs locally:', similarJobs);
    setRelatedJobs(similarJobs);
    return similarJobs; // Return for potential caching
  };
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Check if we have cached data
      const cachedData = getDataFromCache();
      if (cachedData) {
        console.log('Using cached job data');
        setJobs(cachedData.jobs);
        setRelatedJobs(cachedData.relatedJobs);
        setJobCategories(cachedData.categories);
        setLoading(false);
        setCacheUsed(true);
        return; // Skip fetching from API
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch recent jobs
        console.log('Attempting to fetch recent jobs from API...');
        const jobsResponse = await getRecentJobs(6);
        console.log('Recent jobs API response:', jobsResponse);
        
        let formattedJobs = [];
        let formattedCategories = [];
        
        if (jobsResponse && jobsResponse.success && jobsResponse.data && jobsResponse.data.length > 0) {
          // Map API data to match our component's expected format
          console.log('Successfully fetched recent jobs, formatting data...');
          console.log('Raw job data:', JSON.stringify(jobsResponse.data));
          
          formattedJobs = jobsResponse.data.map(job => {
            // Format salary properly if it's an object
            let formattedSalary = 'Competitive';
            if (job.salary) {
              if (typeof job.salary === 'object') {
                // Handle salary as object with min/max/currency
                if (job.salary.min && job.salary.max) {
                  formattedSalary = `${job.salary.currency || '$'}${job.salary.min} - ${job.salary.currency || '$'}${job.salary.max}`;
                } else if (job.salary.min) {
                  formattedSalary = `${job.salary.currency || '$'}${job.salary.min}+`;
                } else if (job.salary.display) {
                  formattedSalary = job.salary.display;
                }
              } else if (typeof job.salary === 'string') {
                formattedSalary = job.salary;
              }
            }
            
            // Extract job type information more accurately
            let jobTypeTag = 'Full-time';
            if (job.jobType) {
              // Check if jobType is an object with a 'name' property
              if (typeof job.jobType === 'object' && job.jobType.name) {
                jobTypeTag = job.jobType.name;
              } else if (typeof job.jobType === 'string') {
                jobTypeTag = job.jobType;
              }
            } else if (job.employmentType) {
              jobTypeTag = job.employmentType;
            }
            
            // Extract experience level more accurately
            let experienceTag = '';
            if (job.experienceLevel) {
              // Check if experienceLevel is an object with a 'name' property
              if (typeof job.experienceLevel === 'object' && job.experienceLevel.name) {
                experienceTag = job.experienceLevel.name;
              } else if (typeof job.experienceLevel === 'string') {
                experienceTag = job.experienceLevel;
              }
            } else if (job.experience) {
              if (typeof job.experience === 'object' && job.experience.level) {
                experienceTag = job.experience.level;
              } else if (typeof job.experience === 'string') {
                experienceTag = job.experience;
              }
            }
            
            // Determine workType (remote, on-site, hybrid)
            let workTypeTag = '';
            if (job.workArrangement) {
              if (typeof job.workArrangement === 'object' && job.workArrangement.name) {
                workTypeTag = job.workArrangement.name;
              } else if (typeof job.workArrangement === 'string') {
                workTypeTag = job.workArrangement;
              }
            } else if (job.remoteOption === true) {
              workTypeTag = 'Remote';
            } else if (job.workType) {
              workTypeTag = job.workType;
            } else if (job.location?.remote === true) {
              workTypeTag = 'Remote';
            } else {
              workTypeTag = 'On-site';
            }
            
            // Collect all tags for display
            const tags = [];
            if (jobTypeTag) tags.push(jobTypeTag);
            if (experienceTag) tags.push(experienceTag);
            
            console.log('Job data mapping:', { 
              title: job.title,
              jobType: jobTypeTag,
              experience: experienceTag,
              workType: workTypeTag
            });
            
            return {
              id: job._id || job.id,
              title: job.title || 'Untitled Position',
              company: job.company?.name || job.company || 'Unknown Company',
              date: formatDate(job.createdAt || job.datePosted || new Date()),
              tags: tags.length > 0 ? tags : ['Full-time', 'Entry level'],
              workType: workTypeTag ? [workTypeTag] : ['On-site'],
              salary: formattedSalary,
              location: formatLocation(job),
              logoText: (job.company?.name || job.company || 'C').charAt(0).toUpperCase(),
              logoColor: '#FFF1E6',
              logoBackground: determineCompanyBackground(job.company?.name || job.company || ''),
              bookmarked: job.bookmarked || false
            };
          });
          
          setJobs(formattedJobs);
          console.log('Formatted jobs:', formattedJobs);
        } else {
          console.warn('No recent jobs found in the response or invalid data structure');
          console.warn('Response details:', JSON.stringify(jobsResponse));
          setJobs([]);
          
          if (jobsResponse.message) {
            toast.info(`${jobsResponse.message}`);
          } else {
            toast.info('No job listings are currently available');
          }
        }
        
        // Fetch categories
        console.log('Fetching job categories...');
        const categoriesResponse = await getCategorySuggestions();
        console.log('Categories response:', categoriesResponse);
        
        if (Array.isArray(categoriesResponse) && categoriesResponse.length > 0) {
          // Extract category names from the response
          formattedCategories = categoriesResponse.map(cat => cat.name || cat);
          setJobCategories(formattedCategories);
          console.log('Processed categories:', formattedCategories);
        } else {
          console.warn('No categories found in the response or invalid format');
          console.warn('Categories response details:', JSON.stringify(categoriesResponse));
          setJobCategories([]);
        }
        
        // Fetch related jobs based on the first job if available
        if (jobsResponse?.success && jobsResponse.data && jobsResponse.data.length > 0 && formattedJobs.length > 0) {
          const firstJob = jobsResponse.data[0];
          const firstJobId = firstJob._id || firstJob.id;
          const firstJobCategory = firstJob.category || firstJob.jobCategory || 'design';
          
          console.log('Fetching related jobs for job ID:', firstJobId, 'and category:', firstJobCategory);
          
          try {
            // Only attempt to get related jobs if we have a valid ID and category
            if (firstJobId && firstJobCategory) {
              const relatedResponse = await getRelatedJobs(firstJobId, firstJobCategory, 3);
              console.log('Related jobs response:', relatedResponse);
              
              if (relatedResponse?.success && relatedResponse.data && Array.isArray(relatedResponse.data)) {
                const formattedRelated = relatedResponse.data.map(job => {
                  // Format related job data safely
                  return {
                    id: job._id || job.id,
                    title: job.title || 'Untitled Position',
                    company: job.company?.name || job.company || 'Unknown Company',
                    logo: determineCompanyLogo(job.company?.name || job.company || '')
                  };
                });
                
                setRelatedJobs(formattedRelated);
                console.log('Formatted related jobs:', formattedRelated);
                
                // Save data to cache
                saveDataToCache(formattedJobs, formattedRelated, formattedCategories);
              } else {
                console.warn('No related jobs found or invalid response format');
                console.warn('Related jobs response details:', JSON.stringify(relatedResponse));
                // Generate similar jobs as fallback
                const similarJobs = generateSimilarJobs(formattedJobs, firstJobCategory);
                
                // Save data to cache anyway
                saveDataToCache(formattedJobs, similarJobs, formattedCategories);
              }
            } else {
              console.warn('Missing job ID or category for related jobs');
              const similarJobs = generateSimilarJobs(formattedJobs, firstJobCategory);
              
              // Save data to cache anyway
              saveDataToCache(formattedJobs, similarJobs, formattedCategories);
            }
          } catch (relatedError) {
            console.error('Failed to fetch related jobs:', relatedError);
            // If there's an auth error or other issue, generate similar jobs locally
            const similarJobs = generateSimilarJobs(formattedJobs, firstJobCategory);
            
            // Save data to cache anyway
            saveDataToCache(formattedJobs, similarJobs, formattedCategories);
          }
        } else {
          console.log('No jobs available to fetch related jobs');
          setRelatedJobs([]);
          
          // Save partial data to cache
          if (formattedJobs.length > 0) {
            saveDataToCache(formattedJobs, [], formattedCategories);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        toast.error(`Failed to load job data: ${err.message || 'Unknown error'}`);
        
        setJobs([]);
        setRelatedJobs([]);
        setJobCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Render loading indicator if data is still loading
  if (loading) {
    return (
      <div className="modern-jobs-wrapper">
        <div className="loading-indicator">Loading recent jobs...</div>
      </div>
    );
  }

  // Render error state if there's an error
  if (error) {
    return (
      <div className="modern-jobs-wrapper">
        <div className="error-message">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={handleRefresh} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render no jobs message if no jobs found
  if (jobs.length === 0) {
    return (
      <div className="modern-jobs-wrapper">
        <div className="no-jobs-message">
          <h2>No Jobs Found</h2>
          <p>
            We couldn't find any job listings to display. This might be because:
            <ul style={{ textAlign: 'left', marginTop: '10px' }}>
              <li>No jobs have been posted yet</li>
              <li>There was an issue connecting to the job database</li>
              <li>The job data format was unexpected</li>
            </ul>
          </p>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={handleRefresh} 
              className="retry-button"
              style={{ marginRight: '10px' }}
            >
              Refresh Page
            </button>
            <Link to="/jobs" className="browse-all-link">
              Browse All Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-jobs-wrapper">
      <div className="modern-jobs-layout">
        {/* Main content area */}
        <div className="modern-jobs-main-content">
          <div className="recent-jobs-header">
            <h1 className="recent-jobs-title">Latest Job Openings</h1>
            <div className="header-actions">
              {cacheUsed && (
                <button 
                  onClick={handleRefresh} 
                  className="refresh-button"
                  title="Refresh job listings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                  </svg>
                </button>
              )}
              <Link to="/jobs" className="view-all-link">See All</Link>
            </div>
          </div>
          <p className="recent-jobs-description">Find the best job opportunities tailored to your skills and experience...</p>

          <div className="modern-jobs-grid">
            {jobs.map(job => (
              <div key={job.id} className="modern-job-card" onClick={() => window.location.href = `/job-detail/${job.id}`} style={{ cursor: 'pointer' }}>
                {/* Date and bookmark header */}
                <div className="modern-job-header">
                  <div className="job-date-pill">{job.date}</div>
                  <button 
                    className="modern-bookmark-button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when bookmark is clicked
                      // Add bookmark functionality here
                    }}
                  >
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
                  {job.tags && job.tags.map((tag, index) => (
                    <span key={index} className="modern-job-tag">{tag}</span>
                  ))}
                  {job.workType && job.workType.map((type, index) => (
                    <span key={`work-${index}`} className="modern-job-tag work-type">{type}</span>
                  ))}
                </div>

                {/* Salary and location footer */}
                <div className="modern-job-footer">
                  <div className="modern-job-salary">{job.salary}</div>
                  <div className="modern-job-location">{job.location}</div>
                  <Link 
                    to={`/job-detail/${job.id}`} 
                    className="modern-details-link"
                    onClick={(e) => e.stopPropagation()} // Prevent double navigation
                  >
                    <button 
                      className="modern-details-button" 
                      style={{ backgroundColor: "#2A9D8F" }}
                    >
                      Details
                    </button>
                  </Link>
                </div>
                
              </div>
            ))}
          </div>
  
        </div>

        {/* Sidebar */}
        <div className="modern-jobs-sidebar">
          {/* How to Apply section */}
          <div className="how-to-apply-section">
            <h2 className="sidebar-title">How to Apply?</h2>
            <p className="apply-description">
              Follow these steps to apply for a job: 1) Click on a job listing to view details, 2) Review the requirements and responsibilities, 3) Click the Apply button on the job details page, 4) Complete the application form with your information.
            </p>
            <Link to="/jobs" className="apply-now-btn">Browse Jobs</Link>
          </div>

          {/* Related Jobs section */}
          <div className="related-jobs-section">
            <h2 className="sidebar-title">Related Jobs</h2>
            
            <div className="related-jobs-list">
              {relatedJobs.length > 0 ? (
                relatedJobs.map((job, index) => (
                  <div key={index} className="related-job-item">
                    {getRelatedJobLogo(job.logo)}
                    <div className="related-job-info">
                      <h3 className="related-job-title">{job.title}</h3>
                      <p className="related-job-company">{job.company}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-related-jobs">No related jobs found</div>
              )}
            </div>
          </div>

          {/* Job Categories */}
          <div className="job-categories-section">
            <h2 className="sidebar-title">Job Categories</h2>
            {jobCategories.length > 0 ? (
              <ul className="job-categories-list">
                {jobCategories.map((category, index) => (
                  <li key={index} className="job-category-item">
                    <Link to={`/jobs?category=${encodeURIComponent(category)}`} className="job-category-link">{category}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-categories">No categories available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentJobs;