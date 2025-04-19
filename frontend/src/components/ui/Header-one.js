import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import '../css/Header_one.css';
import { toast } from 'react-toastify';
import { searchJobs, getCategorySuggestions, getLocationSuggestions, getSearchSuggestions } from '../../services/searchService';
import { getPortalStats } from '../../services/statsService';
import header_banner_img from '../../assets/images/svg-1.svg';

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

  // Ref for the hero image container
  const heroImageRef = useRef(null);

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

  // Handle cursor movement for the hero image
  useEffect(() => {
    const heroContainer = heroImageRef.current;

    if (!heroContainer) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = heroContainer.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      // Get the image element inside the container
      const heroImage = heroContainer.querySelector('.hero-image');
      if (heroImage) {
        // Apply transform based on cursor position
        heroImage.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(20px)`;
      }
    };

    const handleMouseLeave = () => {
      const heroImage = heroContainer.querySelector('.hero-image');
      if (heroImage) {
        // Reset transform when cursor leaves
        heroImage.style.transform = '';
      }
    };

    heroContainer.addEventListener('mousemove', handleMouseMove);
    heroContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      heroContainer.removeEventListener('mousemove', handleMouseMove);
      heroContainer.removeEventListener('mouseleave', handleMouseLeave);
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
      const statsSection = document.querySelector('.job-stats');
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
          getLocationSuggestions().catch(err => {
            console.error('Error fetching locations:', err);
            // Return default locations instead of failing
            return [
              { value: 'Accra', label: 'Accra' },
              { value: 'Kumasi', label: 'Kumasi' },
              { value: 'Tamale', label: 'Tamale' },
              { value: 'Takoradi', label: 'Takoradi' },
              { value: 'Cape Coast', label: 'Cape Coast' }
            ];
          }),
          getCategorySuggestions().catch(err => {
            console.error('Error fetching categories:', err);
            // Return empty array rather than failing completely
            return [];
          })
        ]);

        // Check if we received valid data for locations
        if (Array.isArray(locationsData) && locationsData.length > 0) {
          setLocationOptions(locationsData);
          console.log('Loaded locations:', locationsData.length);
        } else {
          console.warn('No location data received, using defaults');
          // Set default locations if none were received
          setLocationOptions([
            { value: 'Accra', label: 'Accra' },
            { value: 'Kumasi', label: 'Kumasi' },
            { value: 'Tamale', label: 'Tamale' },
            { value: 'Takoradi', label: 'Takoradi' },
            { value: 'Cape Coast', label: 'Cape Coast' }
          ]);
        }

        // Check if we received valid data for categories
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategoryOptions(categoriesData);
          console.log('Loaded categories:', categoriesData.length);
        } else {
          console.warn('No category data received');
          // We don't show an error toast for this - it's not critical
        }
      } catch (error) {
        console.error('Error fetching search options:', error);
        // Don't show error toast - use default data instead
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
        // Determine which dashboard to redirect to based on user role
        const isEmployer = user?.role === 'employer' ||
          (typeof user?.role === 'object' && user?.role?.name === 'employer') ||
          user?.userType === 'employer' ||
          localStorage.getItem('registrationData') &&
          JSON.parse(localStorage.getItem('registrationData'))?.userType === 'employer';

        console.log('Header-one redirecting to dashboard for role:', isEmployer ? 'employer' : 'job seeker');

        // Navigate to the appropriate dashboard
        if (isEmployer) {
          navigate('/dashboard-employer', { replace: true });
        } else {
          navigate('/dashboard-jobseeker', { replace: true });
        }
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
              <li><Link to="/" className="nav-link-clean">Home</Link></li>
              {/* <li><Link to="/jobs" className="nav-link-clean">Jobs</Link></li> */}
              <li><Link to="/gallery" className="nav-link-clean">About Us</Link></li>
              <li><Link to="/contact" className="nav-link-clean">Contact Us</Link></li>
            </ul>
          </nav>

          <div className="auth-buttons desktop-auth">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="login-btn" >Login</Link>
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
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </div>
          </div>

          <nav className="main-nav">
            <ul className="nav-links">
              <li><Link to="/" className="nav-link-clean" onClick={toggleMobileMenu}>Home</Link></li>
              {/* <li><Link to="/jobs" className="nav-link-clean" onClick={toggleMobileMenu}>Jobs</Link></li> */}
              <li><Link to="/gallery" className="nav-link-clean" onClick={toggleMobileMenu}>About Us</Link></li>
              <li><Link to="/contact" className="nav-link-clean" onClick={toggleMobileMenu}>Contact Us</Link></li>
            </ul>
          </nav>

          <div className="auth-buttons mobile-auth">
            {!isAuthenticated ? (
              <>
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

      {/* New Header Banner */}
      <section className="header-banner">
        <div className="banner-content">
          <h1 className="banner-title">Connect Job Seekers, Training centers, Companies</h1>
          <p className="banner-description">
            Find the perfect job or hire the best talent with our comprehensive job portal.
            Connecting employers, candidates, and training centers in one seamless platform.
          </p>
        </div>

        <div ref={heroImageRef} className="hero-container">
          <img src={header_banner_img} alt="Company hero" className="home-hero-image" />
        </div>
      </section>
    </div>
  );
};

export default JobPortal;