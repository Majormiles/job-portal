import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import '../css/Header_one.css';
import { toast } from 'react-toastify';
import { searchJobs, getCategorySuggestions, getLocationSuggestions, getSearchSuggestions } from '../../services/searchService';
import { getPortalStats } from '../../services/statsService';

const JobPortal = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loading, checkOnboardingStatus } = useAuth();
  const { isComplete, loading: onboardingLoading } = useOnboardingStatus();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroAnimation, setHeroAnimation] = useState(false);
  const [logoAnimation, setLogoAnimation] = useState(false);
  
  // Add search-related state
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [locationOptions, setLocationOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add stats-related state
  const [stats, setStats] = useState({
    jobs: 0,
    candidates: 0,
    companies: 0
  });
  const [statsLoaded, setStatsLoaded] = useState(false);
  
  // Refs for counter animation
  const jobsCounterRef = useRef(null);
  const candidatesCounterRef = useRef(null);
  const companiesCounterRef = useRef(null);

  // Handle scroll effects and animations
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Start animations after component mount
    setTimeout(() => {
      setLogoAnimation(true);
      setHeroAnimation(true);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch portal statistics data
  useEffect(() => {
    console.log('Starting stats fetch...');
    
    const fetchStats = async () => {
      try {
        console.log('Fetching stats data...');
        const response = await getPortalStats();
        console.log('Stats API response:', response);
        
        if (response.success) {
          console.log('Setting stats data:', response.data);
          // Check if we have real data (not all zeros)
          const hasRealData = 
            response.data.jobs > 0 || 
            response.data.candidates > 0 || 
            response.data.companies > 0;
          
          if (hasRealData) {
            console.log('REAL DATA FOUND IN DATABASE:', response.data);
          } else {
            toast.info('No portal statistics found in database.');
          }
          
          // Log the refs to see if they're properly initialized
          console.log('Refs status:', {
            jobsRef: !!jobsCounterRef.current,
            candidatesRef: !!candidatesCounterRef.current, 
            companiesRef: !!companiesCounterRef.current
          });
          
          setStats(response.data);
          setStatsLoaded(true);
          
          // Initialize data-count attributes on counter elements after stats are loaded
          if (jobsCounterRef.current) {
            console.log('Setting jobs count:', response.data.jobs);
            jobsCounterRef.current.setAttribute('data-count', response.data.jobs || 0);
            jobsCounterRef.current.textContent = response.data.jobs || 0;
          } else {
            console.warn('Jobs counter ref is null');
          }
          
          if (candidatesCounterRef.current) {
            console.log('Setting candidates count:', response.data.candidates);
            candidatesCounterRef.current.setAttribute('data-count', response.data.candidates || 0);
            candidatesCounterRef.current.textContent = response.data.candidates || 0;
          } else {
            console.warn('Candidates counter ref is null');
          }
          
          if (companiesCounterRef.current) {
            console.log('Setting companies count:', response.data.companies);
            companiesCounterRef.current.setAttribute('data-count', response.data.companies || 0);
            companiesCounterRef.current.textContent = response.data.companies || 0;
          } else {
            console.warn('Companies counter ref is null');
          }
        } else {
          console.error('Failed to fetch stats data:', response.message);
          toast.error('Failed to load portal statistics');
          
          // Still set the data we got, even if it's zeros
          setStats(response.data);
          setStatsLoaded(true);
          
          if (jobsCounterRef.current) {
            jobsCounterRef.current.setAttribute('data-count', response.data.jobs || 0);
            jobsCounterRef.current.textContent = response.data.jobs || 0;
          }
          
          if (candidatesCounterRef.current) {
            candidatesCounterRef.current.setAttribute('data-count', response.data.candidates || 0);
            candidatesCounterRef.current.textContent = response.data.candidates || 0;
          }
          
          if (companiesCounterRef.current) {
            companiesCounterRef.current.setAttribute('data-count', response.data.companies || 0);
            companiesCounterRef.current.textContent = response.data.companies || 0;
          }
        }
      } catch (error) {
        console.error('Error in stats fetching:', error);
        toast.error('Failed to load portal statistics');
        
        // Set empty stats in case of error
        setStats({
          jobs: 0,
          candidates: 0,
          companies: 0
        });
        setStatsLoaded(true);
      }
    };

    // Wait a bit for the DOM to render before fetching stats
    const timer = setTimeout(() => {
      fetchStats();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle counter animation for stats
  useEffect(() => {
    if (statsLoaded) {
      console.log('Stats loaded, setting up counter animation');
      console.log('REAL DATABASE STATS:', stats);
      
      const animateCounter = (countElement, targetValue) => {
        if (!countElement) {
          console.warn('Counter element is null, cannot animate');
          return;
        }
        
        console.log(`Animating counter for target value: ${targetValue}`);
        const count = parseInt(targetValue) || 0;
        
        // Don't animate if the count is zero (would look weird)
        if (count === 0) {
          countElement.textContent = '0';
          return;
        }
        
        let current = 0;
        const increment = count > 1000 ? Math.ceil(count / 50) : Math.ceil(count / 25);
        const timer = setInterval(() => {
          current += increment;
          if (current >= count) {
            countElement.textContent = count.toLocaleString();
            clearInterval(timer);
          } else {
            countElement.textContent = current.toLocaleString();
          }
        }, 30);
      };

      // Create an intersection observer to start animation when stats section is visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log('Stats section is visible, starting animations');
            // Start animations for each counter
            animateCounter(jobsCounterRef.current, stats.jobs);
            animateCounter(candidatesCounterRef.current, stats.candidates);
            animateCounter(companiesCounterRef.current, stats.companies);
            
            // Stop observing after animation starts
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      
      // Find the stats section container and observe it
      const statsSection = document.querySelector('.stats-section');
      if (statsSection) {
        console.log('Found stats section, starting observation');
        observer.observe(statsSection);
      } else {
        console.warn('Stats section not found in DOM');
      }
      
      return () => {
        if (statsSection) {
          observer.unobserve(statsSection);
        }
      };
    }
  }, [statsLoaded, stats]);

  // Fetch location and category options on component mount
  useEffect(() => {
    const fetchSearchOptions = async () => {
      setIsLoading(true);
      try {
        // Fetch both location and category data in parallel
        const [locationsData, categoriesData] = await Promise.all([
          getLocationSuggestions(),
          getCategorySuggestions()
        ]);
        
        // Check if we received valid data for locations
        if (Array.isArray(locationsData) && locationsData.length > 0) {
          setLocationOptions(locationsData);
          console.log('Loaded locations:', locationsData.length);
        } else {
          console.error('Invalid location data received:', locationsData);
          toast.error('Failed to load location options');
        }
        
        // Check if we received valid data for categories
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategoryOptions(categoriesData);
          console.log('Loaded categories:', categoriesData.length);
        } else {
          console.error('Invalid category data received:', categoriesData);
          toast.error('Failed to load category options');
        }
      } catch (error) {
        console.error('Error fetching search options:', error);
        toast.error('Failed to load search options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchOptions();
  }, []);

  // Handle input changes for search query
  const handleSearchQueryChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim() !== '') {
      try {
        const results = await getSearchSuggestions(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Error getting search suggestions:', error);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle selection of a suggestion
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  // Handle search form submission
  const handleSearchSubmit = () => {
    if (!query && !location && !category) {
      toast.info('Please enter at least one search parameter');
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Construct search parameters - using standardized parameter names
      const searchParams = {
        query: query,
        location: location,
        category: category,
        page: 1,
        limit: 10
      };
      
      // Create URL search parameters with consistent naming
      const urlParams = new URLSearchParams();
      if (query) urlParams.set('query', query);
      if (location) urlParams.set('location', location);
      if (category) urlParams.set('category', category);
      
      // Navigate to jobs page with search params
      navigate('/jobs', { 
        state: { searchParams },
        search: urlParams.toString()
      });
    } catch (error) {
      console.error('Error during search:', error);
      toast.error('An error occurred during search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    // Prevent scrolling when mobile menu is open
    if (!showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
  };

  const handleDashboardClick = async () => {
    if (onboardingLoading) {
      return; // Wait for onboarding status to load
    }

    try {
      // Force check onboarding status before redirecting
      await checkOnboardingStatus(true);
      
      // Get the latest onboarding status
      const onboardingStatus = user?.onboardingStatus;
      const isOnboardingComplete = onboardingStatus?.isComplete;

      if (isOnboardingComplete) {
        // If onboarding is complete, go to dashboard
        navigate('/dashboard_employee', { replace: true });
      } else {
        // If onboarding is not complete, go to first onboarding step
        navigate('/onboarding/personal-info', { replace: true });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      toast.error('Failed to check onboarding status');
    }
  };

  const handleLogout = () => {
    logout();
    if (showMobileMenu) {
      toggleMobileMenu();
    }
    navigate('/');
  };

  // Show loading state while auth is being checked
  if (loading || onboardingLoading) {
    return null; // Or a loading spinner if you prefer
  }

  return (
    <div className="job-portal">
      {/* Header */}
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="logo-container">
            <Link to="/" className="logo-link">
              <div className="briefcase-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z" />
                </svg>
              </div>
              <span className={`logo-text ${logoAnimation ? 'animate' : ''}`}>Job Portal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul className="nav-links">
              <li><Link to="/" className="active">Home</Link></li>
              <li><Link to="/jobs">Jobs</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </nav>

          <div className="auth-buttons desktop-auth">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="login-btn">Login</Link>
                <Link to="/register" className="register-btn">Register</Link>
              </>
            ) : (
              <div className="user-profile">
                <button className="profile-btn" onClick={handleDashboardClick}>
                  <span className="username">{user?.name}</span>
                </button>
              </div>
            )}
          </div>

          <div className="hamburger-menu" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        {/* Mobile Side Menu */}
        <div className={`mobile-menu ${showMobileMenu ? 'show' : ''}`}>
          <div className="mobile-menu-header">
            <div className="logo-container">
              <Link to="/" className="logo-link">
                <div className="briefcase-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z" />
                  </svg>
                </div>
                <span>Job Portal</span>
              </Link>
            </div>
            <div className="close-menu" onClick={toggleMobileMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </div>
          </div>
          
          <nav className="main-nav">
            <ul className="nav-links">
              <li><Link to="/" className="active" onClick={toggleMobileMenu}>Home</Link></li>
              <li><Link to="/jobs" onClick={toggleMobileMenu}>Jobs</Link></li>
              <li><Link to="/about" onClick={toggleMobileMenu}>About Us</Link></li>
              <li><Link to="/contact" onClick={toggleMobileMenu}>Contact Us</Link></li>
            </ul>
          </nav>

          <div className="auth-buttons mobile-auth">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="login-btn" onClick={toggleMobileMenu}>Login</Link>
                <Link to="/register" className="register-btn" onClick={toggleMobileMenu}>Register</Link>
              </>
            ) : (
              <div className="mobile-user-menu">
                <button className="mobile-menu-item" onClick={() => { handleDashboardClick(); toggleMobileMenu(); }}>
                  Dashboard
                </button>
                <button className="mobile-menu-item logout-btn" onClick={() => { handleLogout(); toggleMobileMenu(); }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Dark overlay when mobile menu is open */}
        {showMobileMenu && <div className="menu-overlay" onClick={toggleMobileMenu}></div>}
      </header>

      {/* Hero Section */}
      <section className={`hero-section ${heroAnimation ? 'animate' : ''}`}>
        <div className="hero-content">
          <h1 className="slide-in-right">Find Your Dream Job Today!</h1>
          <p className="fade-in">Connecting Talent with Opportunity: Your Gateway to Career Success</p>
          
          {/* Search Form */}
          <div className="search-container slide-up">
            <div className="search-form">
              <div className="search-input">
                <input 
                  type="text" 
                  placeholder="Job Title or Company" 
                  value={query}
                  onChange={handleSearchQueryChange}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="search-suggestions" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderRadius: '0 0 4px 4px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee',
                          color: '#333',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="search-select">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select Location</option>
                  {isLoading ? (
                    <option value="" disabled>Loading locations...</option>
                  ) : (
                    locationOptions.map((location, index) => (
                      <option key={index} value={location.value}>
                        {location.label}
                      </option>
                    ))
                  )}
                </select>
                <div className="select-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              </div>
              
              <div className="search-select">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select Category</option>
                  {isLoading ? (
                    <option value="" disabled>Loading categories...</option>
                  ) : (
                    categoryOptions.map((category, index) => (
                      <option key={index} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                <div className="select-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              </div>
              
              <button 
                className="search-button"
                onClick={handleSearchSubmit}
                disabled={isSearching || isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                {isLoading ? 'Loading...' : isSearching ? 'Searching...' : 'Search Job'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="animated-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </section>

      {/* Stats Section - Updated with refs and add logging to verify counter values */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon briefcase">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="counter" ref={jobsCounterRef} data-count={stats.jobs || 0}>{stats.jobs || 0}</h3>
              <p>Jobs</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon people">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="counter" ref={candidatesCounterRef} data-count={stats.candidates || 0}>{stats.candidates || 0}</h3>
              <p>Candidates</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon building">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="counter" ref={companiesCounterRef} data-count={stats.companies || 0}>{stats.companies || 0}</h3>
              <p>Companies</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobPortal;