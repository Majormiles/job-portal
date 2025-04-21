import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingLayout from './OnboardingLayout';
import { toast } from 'react-toastify';
import axios from 'axios';

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { api, updateOnboardingStatus, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    customLocation: '',
    jobType: '',
    industry: '',
    skills: [],
    interests: [],
    specialization: [],
    companySize: '',
    companyName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState('');
  const [locations, setLocations] = useState([]);
  const [isEmployer, setIsEmployer] = useState(false);
  const [hasReloaded, setHasReloaded] = useState(false);
  const [hasCompanyData, setHasCompanyData] = useState(false);

  // Immediate safe check for employer status when component mounts
  useEffect(() => {
    console.log('Running immediate employer status check');
    // Check registration data in storage
    try {
      const storedData = localStorage.getItem('registrationData') || sessionStorage.getItem('registrationData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.userType === 'employer') {
          console.log('Setting employer status based on registration data');
          setIsEmployer(true);
          setUserRole('employer');
          
          // Initialize company data for employers
          setFormData(prev => ({
            ...prev,
            companyName: parsedData.companyName || prev.name || '',
            industry: parsedData.industry || prev.industry || 'Technology',
            companySize: parsedData.companySize || prev.companySize || '1-10'
          }));
        } else if (parsedData && parsedData.userType === 'jobSeeker') {
          console.log('Setting job seeker status based on registration data');
          setIsEmployer(false);
          setUserRole('jobSeeker');
        } else if (parsedData && (parsedData.userType === 'trainer' || parsedData.talentType === 'trainer')) {
          console.log('Setting trainer status based on registration data');
          setIsEmployer(false);
          setUserRole('trainer');
        } else if (parsedData && (parsedData.userType === 'trainee' || parsedData.talentType === 'trainee')) {
          console.log('Setting trainee status based on registration data');
          setIsEmployer(false);
          setUserRole('trainee');
          
          // Check all possible fields where interests might be stored
          const storedInterest = parsedData.interests || // Array format
                                 parsedData.interest || // Single value format
                                 parsedData.jobType || // Alternative format from registration
                                 ''; 
          
          console.log('Found stored interest data:', storedInterest);
          
          // Set interests in formData, handling both array and string formats
          setFormData(prev => ({
            ...prev,
            interests: Array.isArray(storedInterest) ? storedInterest : 
                       (storedInterest ? [storedInterest] : [])
          }));
        }
      }
    } catch (e) {
      console.error('Error in immediate employer check:', e);
    }
  }, []);

  // Fetch data from API
  useEffect(() => {
    // Check if we've already done one reload to prevent infinite loop
    if (sessionStorage.getItem('onboarding_reload_done')) {
      setHasReloaded(true);
    }

    const fetchAllData = async () => {
      setLoading(true);
      
      try {
        // First, check if we have employer data in storage (for immediate UI response)
        try {
          const storedData = localStorage.getItem('registrationData') || sessionStorage.getItem('registrationData');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            console.log('Checking storage data for user type:', parsedData);
            
            // When we detect an employer from storage but not from API data,
            // manually set employer-specific fields if they're empty
            if (parsedData.userType === 'employer') {
              console.log('Setting employer flag based on storage data');
              setIsEmployer(true);
              setUserRole('employer');
              
              // Set company name from storage if it's not already set
              if (parsedData.companyName && !formData.companyName) {
                setFormData(prev => ({
                  ...prev,
                  companyName: parsedData.companyName,
                  name: parsedData.companyName // Also set name to company name
                }));
              }
              
              // Set industry from job type if it's empty
              if (parsedData.jobType && !formData.industry) {
                setFormData(prev => ({
                  ...prev,
                  industry: parsedData.jobType
                }));
              }
              
              // Set company size if it's not already set
              if (parsedData.companySize && !formData.companySize) {
                setFormData(prev => ({
                  ...prev,
                  companySize: parsedData.companySize
                }));
              }
            } else if (parsedData.userType === 'trainer' || parsedData.talentType === 'trainer') {
              console.log('Setting trainer flag based on storage data');
              setUserRole('trainer');
              
              if (parsedData.jobType && !formData.specialization) {
                setFormData(prev => ({
                  ...prev,
                  specialization: [parsedData.jobType]
                }));
              }
            } else if (parsedData.userType === 'trainee' || parsedData.talentType === 'trainee') {
              console.log('Setting trainee flag based on storage data');
              setUserRole('trainee');
              
              // Check all possible fields where interests might be stored
              const storedInterest = parsedData.interests || // Array format
                                     parsedData.interest || // Single value format
                                     parsedData.jobType || // Alternative format from registration
                                     ''; 
              
              console.log('Found stored interest data:', storedInterest);
              
              // Set interests in formData, handling both array and string formats
              setFormData(prev => ({
                ...prev,
                interests: Array.isArray(storedInterest) ? storedInterest : 
                           (storedInterest ? [storedInterest] : [])
              }));
            }
          }
        } catch (storageError) {
          console.log('Error checking storage for user type:', storageError);
        }
        
        // Create API instance with auth headers
        const apiClient = axios.create({
          baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Fetch locations
        let locationsData = [];
        try {
          const locationsResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/locations`);
          if (locationsResponse.data.success) {
            locationsData = locationsResponse.data.data || [];
          }
        } catch (error) {
          console.error('Error fetching locations:', error);
        }
        
        // Fetch job categories for possible matching
        let jobCategories = [];
        try {
          const categoriesResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/categories`);
          if (categoriesResponse.data.success) {
            jobCategories = categoriesResponse.data.data || [];
            console.log('Fetched job categories:', jobCategories);
          }
        } catch (error) {
          console.error('Error fetching job categories:', error);
        }
        
        // Set default locations if API failed or returned empty array
        if (!locationsData.length) {
          locationsData = [
            { _id: 'accra', name: 'Accra', region: 'Greater Accra' },
            { _id: 'kumasi', name: 'Kumasi', region: 'Ashanti' },
            { _id: 'tamale', name: 'Tamale', region: 'Northern' },
            { _id: 'takoradi', name: 'Takoradi', region: 'Western' }
          ];
        }
        
        setLocations(locationsData);
        
        // Try to get user profile data from different possible endpoints
        let userData = null;
        let userResponse = null;
        
        try {
          // First try /users/me which seems to be the most common endpoint
          console.log('Attempting to fetch user profile from /users/me');
          userResponse = await apiClient.get('/users/me');
          if (userResponse.data && userResponse.data.success) {
            userData = userResponse.data.data || userResponse.data;
            console.log('Successfully fetched user data from /users/me');
            console.log('User data contents:', JSON.stringify(userData, null, 2));
          }
        } catch (error) {
          console.log('Error fetching from /users/me:', error.message);
          
          try {
            // Try alternate endpoint /auth/me as fallback
            console.log('Attempting fallback to /auth/me');
            userResponse = await apiClient.get('/auth/me');
            if (userResponse.data && userResponse.data.success) {
              userData = userResponse.data.data || userResponse.data;
              console.log('Successfully fetched user data from /auth/me');
            }
          } catch (error2) {
            console.log('Error fetching from /auth/me:', error2.message);
            
            try {
              // Last fallback to /dashboard/me
              console.log('Attempting fallback to /dashboard/me');
              userResponse = await apiClient.get('/dashboard/me');
              if (userResponse.data && userResponse.data.success) {
                userData = userResponse.data.data || userResponse.data;
                console.log('Successfully fetched user data from /dashboard/me');
              }
            } catch (error3) {
              console.log('Error fetching from /dashboard/me:', error3.message);
              throw new Error('Could not fetch user profile from any endpoint');
            }
          }
        }
        
        // Process user profile data if we got it
        if (userData) {
          console.log('User profile data:', userData);
          console.log('USER ROLE NAME:', userData.roleName);
          console.log('ROLE OBJECT:', JSON.stringify(userData.role, null, 2));
          
          // Determine user role
          let role = '';
          
          // First check roleName directly which is most reliable
          if (userData.roleName) {
            console.log('Found roleName:', userData.roleName);
            role = userData.roleName;
            
            // If roleName is 'trainer' or 'trainee', set it directly
            if (role === 'trainer' || role.includes('trainer')) {
              console.log('Setting role to trainer based on roleName');
              role = 'trainer';
              setIsEmployer(false);
            } else if (role === 'trainee' || role.includes('trainee')) {
              console.log('Setting role to trainee based on roleName');
              role = 'trainee';
              setIsEmployer(false);
            }
          }
          // If roleName doesn't contain trainer/trainee, check other properties
          else if (userData.role) {
            role = typeof userData.role === 'string' ? userData.role : userData.role.name || '';
            console.log('User role raw value:', userData.role);
            
            // Check if the role is a MongoDB ID (indicating it needs to be resolved)
            const isRoleId = typeof userData.role === 'string' && /^[0-9a-fA-F]{24}$/.test(userData.role);
            if (isRoleId) {
              console.log('Role appears to be an ID:', userData.role);
              
              // Check registration data for role status
              try {
                const storedData = localStorage.getItem('registrationData') || sessionStorage.getItem('registrationData');
                if (storedData) {
                  const parsedData = JSON.parse(storedData);
                  if (parsedData.userType === 'employer') {
                    console.log('Registration data indicates user is an employer');
                    role = 'employer';
                  } else if (parsedData.userType === 'trainer' || parsedData.talentType === 'trainer') {
                    console.log('Registration data indicates user is a trainer');
                    role = 'trainer';
                  } else if (parsedData.userType === 'trainee' || parsedData.talentType === 'trainee') {
                    console.log('Registration data indicates user is a trainee');
                    role = 'trainee';
                  }
                }
              } catch (e) {
                console.error('Error checking storage for role resolution:', e);
              }
            }
          }
          
          // Force check for specific role names in userData to catch all possible trainer/trainee indicators
          if (userData.roleName === 'trainer' || 
             (userData.role && userData.role.name === 'trainer') ||
             userData.userType === 'trainer') {
            console.log('Forcing role to trainer based on explicit check');
            role = 'trainer';
            setIsEmployer(false);
          } else if (userData.roleName === 'trainee' || 
                    (userData.role && userData.role.name === 'trainee') ||
                    userData.userType === 'trainee') {
            console.log('Forcing role to trainee based on explicit check');
            role = 'trainee';
            setIsEmployer(false);
          }
          
          setUserRole(role);
          console.log('User role determined:', role);
          
          // For employers, handling industry instead of job type
          // Only set as employer if NOT a trainer or trainee
          const userIsEmployer = (role.includes('employer') || 
                                 userData.userType === 'employer' || 
                                 (userData.profile && userData.profile.userType === 'employer')) &&
                                 !(role === 'trainer' || role === 'trainee' || 
                                  userData.roleName === 'trainer' || userData.roleName === 'trainee');
          
          setIsEmployer(userIsEmployer);
          console.log('Is user an employer (from API):', userIsEmployer);
          
          // Enhanced role detection for trainer/trainee
          const userIsTrainer = role === 'trainer' || 
                             userData.roleName === 'trainer' || 
                             (userData.role && userData.role.name === 'trainer');
          const userIsTrainee = role === 'trainee' || 
                             userData.roleName === 'trainee' || 
                             (userData.role && userData.role.name === 'trainee');
                             
          if (userIsTrainer) {
            console.log('Setting user as trainer');
            setUserRole('trainer');
            setIsEmployer(false);
          } else if (userIsTrainee) {
            console.log('Setting user as trainee');
            setUserRole('trainee');
            setIsEmployer(false);
          }
          
          // Format location data
          let locationId = '';
          let customLoc = '';
          
          if (userData.location) {
            if (typeof userData.location === 'string') {
              locationId = userData.location;
            } else if (userData.location._id) {
              locationId = userData.location._id;
            }
          } else if (userData.customLocation) {
            customLoc = userData.customLocation;
            locationId = 'custom';
          }
          
          // Extract skills/interests/specialization data
          const skills = Array.isArray(userData.skills) ? userData.skills : 
                        (userData.skills ? [userData.skills] : []);
                        
          // Improved interests extraction with multiple fallbacks
          let interests = [];
          // Look in all possible locations for interests data
          if (Array.isArray(userData.interests)) {
            interests = userData.interests;
          } else if (userData.interests) {
            interests = [userData.interests];
          } else if (userData.traineeProfile?.interests) {
            // Look in nested traineeProfile object
            interests = Array.isArray(userData.traineeProfile.interests) ? 
              userData.traineeProfile.interests : 
              [userData.traineeProfile.interests];
          } else if (userData.interest) {
            // Check singular form
            interests = Array.isArray(userData.interest) ? userData.interest : [userData.interest];
          } else if (userData.preferredInterest) {
            // Check for preferredInterest field
            interests = [userData.preferredInterest];
          }

          // If still no interests, check storage for trainees
          if (interests.length === 0 && (role === 'trainee' || userData.roleName === 'trainee')) {
            try {
              const storedData = localStorage.getItem('registrationData') || sessionStorage.getItem('registrationData');
              if (storedData) {
                const parsedData = JSON.parse(storedData);
                const storedInterest = parsedData.interests || parsedData.interest || parsedData.jobType;
                if (storedInterest) {
                  interests = Array.isArray(storedInterest) ? storedInterest : [storedInterest];
                  console.log('Using interests from storage:', interests);
                }
              }
            } catch (e) {
              console.error('Error checking storage for interests:', e);
            }
          }

          console.log('Extracted interests data:', interests);

          const specialization = Array.isArray(userData.specialization) ? userData.specialization : 
                                (userData.specialization ? [userData.specialization] : []);
          
          // Extract job type or industry with multiple fallbacks
          console.log('Looking for job type/industry in user data');
          console.log('Full user data structure:', JSON.stringify(userData, null, 2));
          let jobType = '';
          let industry = '';
          let categoryId = null;
          
          // Log all possible locations for job type data for debugging
          console.log('All possible job type/industry locations:');
          console.log('- Direct jobType:', userData.jobType);
          console.log('- Industry:', userData.industry);
          console.log('- Category:', userData.category);
          console.log('- CategoryId:', userData.categoryId);
          console.log('- CategoryID:', userData.categoryID);
          console.log('- Profile Category:', userData.profile?.category);
          console.log('- Skills:', userData.skills);
          console.log('- Company Name:', userData.companyName);
          console.log('- Company Size:', userData.companySize);
          
          // For employers, try to get industry first
          if (userIsEmployer) {
            if (userData.industry) {
              console.log('Found industry for employer:', userData.industry);
              industry = userData.industry;
            } else if (userData.jobType) {
              console.log('Using jobType as industry for employer:', userData.jobType);
              industry = userData.jobType;
            } else if (userData.profile && userData.profile.industry) {
              console.log('Found industry in profile:', userData.profile.industry);
              industry = userData.profile.industry;
            }
          }
          
          // First, try to get categoryId from any location
          if (userData.categoryId) {
            categoryId = userData.categoryId;
            console.log('Found categoryId:', categoryId);
          } else if (userData.categoryID) {
            categoryId = userData.categoryID;
            console.log('Found categoryID (capitalized):', categoryId);
          } else if (userData.category && typeof userData.category === 'object' && userData.category._id) {
            categoryId = userData.category._id;
            console.log('Found category object with _id:', categoryId);
          } else if (userData.profile && userData.profile.categoryId) {
            categoryId = userData.profile.categoryId;
            console.log('Found categoryId in profile:', categoryId);
          }
          
          // If we found a categoryId, try to get the name directly from the API
          if (categoryId) {
            try {
              console.log('Directly querying category ID:', categoryId);
              // Make a direct API call to get the category name
              const categoryResponse = await axios.get(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/categories/${categoryId}`
              );
              
              if (categoryResponse.data && categoryResponse.data.success) {
                const categoryData = categoryResponse.data.data || categoryResponse.data;
                const categoryName = typeof categoryData === 'string' ? categoryData : categoryData.name || '';
                console.log('Successfully fetched category name from API:', categoryName);
                
                // Assign to appropriate field based on user role
                if (userIsEmployer) {
                  industry = categoryName;
                } else {
                  jobType = categoryName;
                }
              } else {
                console.log('Category API returned success:false or empty data');
              }
            } catch (categoryError) {
              console.log('Error fetching category by ID:', categoryError.message);
              
              // Fallback to searching in our cached category list
              if (jobCategories.length > 0) {
                const foundCategory = jobCategories.find(cat => cat._id === categoryId);
                if (foundCategory) {
                  const categoryName = foundCategory.name;
                  console.log('Found category in cached list:', categoryName);
                  
                  // Assign to appropriate field based on user role
                  if (userIsEmployer) {
                    industry = categoryName;
                  } else {
                    jobType = categoryName;
                  }
                } else {
                  console.log('Category ID not found in cached list');
                }
              }
            }
          }
          
          // If we couldn't get the job type/industry from category, try other fields
          if (!userIsEmployer && !jobType) {
            if (userData.jobType) {
              console.log('Using jobType field:', userData.jobType);
              jobType = userData.jobType;
            } else if (userData.profile && userData.profile.jobType) {
              console.log('Using profile.jobType field:', userData.profile.jobType);
              jobType = userData.profile.jobType;
            } else if (userData.category && typeof userData.category === 'string') {
              console.log('Using category name:', userData.category);
              jobType = userData.category;
            } else if (userData.skills && userData.skills.length > 0) {
              console.log('Using first skill as jobType:', userData.skills[0]);
              jobType = Array.isArray(userData.skills) ? userData.skills[0] : userData.skills;
            } else if (userData.type) {
              console.log('Using type field:', userData.type);
              jobType = userData.type;
            }
          } else if (userIsEmployer && !industry) {
            // Additional industry fallbacks for employers
            if (userData.type) {
              console.log('Using type as industry for employer:', userData.type);
              industry = userData.type;
            } else if (userData.jobType) {
              console.log('Using jobType as industry for employer:', userData.jobType);
              industry = userData.jobType;
            }
          }

          // If we still don't have a job type and we have job categories data, try to find a match
          if (!userIsEmployer && !jobType && jobCategories.length > 0) {
            // Try to match against user skills, interests, or other fields
            const possibleMatches = [
              ...(Array.isArray(userData.skills) ? userData.skills : []),
              ...(Array.isArray(userData.interests) ? userData.interests : []),
              ...(Array.isArray(userData.specialization) ? userData.specialization : [])
            ];
            
            for (const category of jobCategories) {
              const categoryName = category.name.toLowerCase();
              
              // Check if any user field contains this category
              for (const field of possibleMatches) {
                if (typeof field === 'string' && field.toLowerCase().includes(categoryName)) {
                  jobType = category.name;
                  console.log(`Matched job type from categories: ${jobType}`);
                  break;
                }
              }
              
              if (jobType) break;
            }
          }
          
          // Last resort: Try to get the job type/industry directly from registration data in local storage
          try {
            // Check both localStorage and sessionStorage
            const storedData = localStorage.getItem('registrationData') || sessionStorage.getItem('registrationData');
            if (storedData) {
              const parsedData = JSON.parse(storedData);
              console.log('Found saved registration data in storage:', parsedData);
              
              // Check userType to determine if this was an employer registration
              const wasEmployerRegistration = parsedData.userType === 'employer';
              console.log('Was registered as employer:', wasEmployerRegistration);
              
              // If we have the job type directly, use it based on role
              if (parsedData.jobType) {
                console.log('Storage has jobType:', parsedData.jobType);
                if (userIsEmployer || wasEmployerRegistration) {
                  if (!industry) {
                    console.log('Using jobType from storage as industry:', parsedData.jobType);
                    industry = parsedData.jobType;
                  }
                } else {
                  if (!jobType) {
                    console.log('Using jobType from storage:', parsedData.jobType);
                    jobType = parsedData.jobType;
                  }
                }
              }
              
              // If we have the job type ID but not the name, try to fetch it
              if (parsedData.jobTypeId && ((!userIsEmployer && !jobType) || (userIsEmployer && !industry))) {
                console.log('Found category ID in storage, attempting to fetch:', parsedData.jobTypeId);
                try {
                  const categoryResponse = await axios.get(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/categories/${parsedData.jobTypeId}`
                  );
                  
                  if (categoryResponse.data && categoryResponse.data.success) {
                    const categoryData = categoryResponse.data.data || categoryResponse.data;
                    const categoryName = typeof categoryData === 'string' ? categoryData : categoryData.name || '';
                    console.log('Successfully fetched category name from API using stored ID:', categoryName);
                    
                    // Assign to appropriate field based on user role
                    if (userIsEmployer || wasEmployerRegistration) {
                      industry = categoryName;
                    } else {
                      jobType = categoryName;
                    }
                  }
                } catch (error) {
                  console.log('Error fetching category using stored ID:', error.message);
                }
              }
              
              // Get company size from storage if available
              if (userIsEmployer && !userData.companySize && parsedData.companySize) {
                console.log('Using company size from storage:', parsedData.companySize);
                userData.companySize = parsedData.companySize;
              }
              
              // Get company name from storage if available
              if (userIsEmployer && !userData.companyName && parsedData.companyName) {
                console.log('Using company name from storage:', parsedData.companyName);
                userData.companyName = parsedData.companyName;
              }
            }
          } catch (e) {
            console.log('Error accessing storage:', e);
          }

          console.log('Final determined jobType:', jobType);
          console.log('Final determined industry:', industry);
          console.log('Company size:', userData.companySize);
          console.log('Company name:', userData.companyName);
          
          // If profile image or other fields exist in user.profile, use those
          const profile = userData.profile || {};
          
          // Use Auth Context user data as fallback
          const authUser = user || {};
          
          // Populate form with all registration data, with multiple fallbacks
          setFormData({
            name: userData.name || profile.name || authUser.name || '',
            email: userData.email || profile.email || authUser.email || '',
            phone: userData.phone || profile.phone || authUser.phone || '',
            location: locationId,
            customLocation: customLoc || userData.customLocation || profile.customLocation || '',
            jobType: jobType || '',
            industry: industry || userData.industry || profile.industry || '',
            skills: skills,
            interests: interests,
            specialization: specialization,
            companySize: userData.companySize || profile.companySize || '',
            companyName: userData.companyName || profile.companyName || userData.organization || ''
          });
        } else {
          toast.warning('Could not retrieve your profile data. Some fields may be empty.');
          
          // Try to use data from Auth context if available
          if (user) {
            console.log('Trying to get data from Auth context:', user);
            // Check for employer role in auth context
            if (user.role && (typeof user.role === 'string' ? user.role.includes('employer') : user.role.name?.includes('employer'))) {
              console.log('Auth context indicates user is an employer');
              setIsEmployer(true);
              setUserRole('employer');
            }
            
            setFormData(prev => ({
              ...prev,
              name: user.name || prev.name,
              email: user.email || prev.email,
              phone: user.phone || prev.phone,
              jobType: user.jobType || user.type || prev.jobType,
              industry: user.industry || prev.industry,
              companyName: user.companyName || prev.companyName,
              companySize: user.companySize || prev.companySize
            }));
          }

          // As a final fallback, check if data was stored in local storage during registration
          try {
            const storedData = localStorage.getItem('registrationData') || sessionStorage.getItem('registrationData');
            if (storedData) {
              const parsedData = JSON.parse(storedData);
              console.log('Found saved registration data in storage:', parsedData);
              
              // Determine if this was an employer registration
              const wasEmployerRegistration = parsedData.userType === 'employer';
              console.log('Storage indicates user is employer:', wasEmployerRegistration);
              
              if (wasEmployerRegistration) {
                console.log('Setting employer flag based on storage userType');
                setIsEmployer(true);
                setUserRole('employer');
              }
              
              const updatedData = {};
              
              if (parsedData.jobType) {
                if (wasEmployerRegistration) {
                  console.log('Using jobType from storage as industry:', parsedData.jobType);
                  updatedData.industry = parsedData.jobType;
                } else {
                  console.log('Using jobType from storage:', parsedData.jobType);
                  updatedData.jobType = parsedData.jobType;
                }
              }
              
              // For employer registrations, use the company-specific data
              if (wasEmployerRegistration) {
                if (parsedData.companySize) {
                  console.log('Using company size from storage:', parsedData.companySize);
                  updatedData.companySize = parsedData.companySize;
                }
                
                if (parsedData.companyName) {
                  console.log('Using company name from storage:', parsedData.companyName);
                  updatedData.companyName = parsedData.companyName;
                  updatedData.name = parsedData.companyName;
                }
                
                // Set the user role to employer if we haven't determined one yet
                if (!userRole) {
                  console.log('Setting user role to employer based on registration data');
                  setUserRole('employer');
                }
              }
              
              setFormData(prev => ({
                ...prev,
                ...updatedData
              }));
            }
          } catch (e) {
            console.log('Error accessing storage:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load your information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [user]);

  // Effects to ensure company data is loaded for employers
  useEffect(() => {
    // First, check if the user role ID is a MongoDB ID, which might indicate it's an employer
    if (userRole && /^[0-9a-fA-F]{24}$/.test(userRole)) {
      // Don't enable employer mode if user has explicitly set userRole to 'jobSeeker'
      if (userRole === 'jobSeeker') {
        console.log('User is explicitly set as jobSeeker, not enabling employer mode');
        return;
      }
      
      console.log('Detected MongoDB ID as role, checking if employer mode should be enabled:', userRole);
      
      // Check if we have evidence the user should be an employer
      const shouldBeEmployer = formData.companyName || formData.industry || formData.companySize;
      
      if (shouldBeEmployer) {
        console.log('User has company data, enabling employer mode');
        setIsEmployer(true);
        // Ensure we have an industry value
        if (formData && !formData.industry) {
          setFormData(prev => ({
            ...prev,
            industry: 'Technology' // Set default industry
          }));
        }
      }
    }
    
    // If user is detected as employer, ensure company name is set using their name
    if (isEmployer && formData && !formData?.companyName && formData?.name) {
      console.log('Setting company name to name:', formData.name);
      setFormData(prev => ({
        ...prev,
        companyName: prev.name
      }));
    }
  }, [isEmployer, formData?.name, formData?.companyName, userRole, formData?.industry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || ''
    }));
  };

  const validateForm = (data) => {
    const validationErrors = {};

    // Validate phone number (if required)
    const phoneStr = data.phone?.trim().replace(/\s+/g, '') || '';
    if (!phoneStr || !/^0\d{9}$/.test(phoneStr)) {
      validationErrors.phone = 'Please enter a valid Ghana phone number (10 digits starting with 0)';
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrors({});

    try {
      // Validate form data
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // Process skills, interests, and specialization if they're string inputs
      const processArrayField = (field) => {
        if (typeof field === 'string') {
          return field.split(',').map(item => item.trim()).filter(item => item);
        }
        return field;
      };

      // Determine user type based on form data and stored preferences
      const determineUserType = () => {
        // Check registration data first
        try {
          const storageStr = localStorage.getItem('registrationData');
          if (storageStr) {
            const storageData = JSON.parse(storageStr);
            if (storageData.userType) {
              console.log(`Using registration type: ${storageData.userType}`);
              return storageData.userType;
            }
            
            // Check for successful role name from registration if available
            if (storageData.successfulRoleName) {
              console.log(`Using successful role from registration: ${storageData.successfulRoleName}`);
              return storageData.successfulRoleName;
            }
          }
        } catch (e) {
          console.error('Error checking storage in submit:', e);
        }
        
        // Check current interface state for role type
        if (isTrainer()) {
          return 'trainer';
        }
        
        if (isTrainee()) {
          return 'trainee';
        }
        
        // If company fields are filled, this is likely an employer
        if (formData.companyName || formData.industry || formData.companySize) {
          return 'employer';
        }
        
        // Check current userRole value from state
        if (userRole === 'trainer' || userRole.includes('trainer')) {
          return 'trainer';
        }
        
        if (userRole === 'trainee' || userRole.includes('trainee')) {
          return 'trainee';
        }
        
        // Default to whatever state we have
        return isEmployer ? 'employer' : 'jobSeeker';
      };

      const userType = determineUserType();
      const finalIsEmployer = userType === 'employer';

      // Create a data object based on user role
      const dataToSend = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location !== 'custom' ? formData.location : '',
        customLocation: formData.location === 'custom' ? formData.customLocation : ''
      };
      
      // Always explicitly set the user type in the request
      dataToSend.userType = userType;
      dataToSend.role = userType;
      dataToSend.roleName = userType;
      
      // Always include employer data if available, even if not detected as employer
      if (formData.industry) {
        dataToSend.industry = formData.industry;
      }
      
      if (formData.companyName) {
        dataToSend.companyName = formData.companyName;
      }
      
      if (formData.companySize) {
        dataToSend.companySize = formData.companySize;
      }
      
      // Add role-specific data if we have detection that they are an employer
      if (finalIsEmployer) {
        // Ensure company name is set
        dataToSend.companyName = formData.companyName || formData.name;
        dataToSend.industry = formData.industry || 'Technology';
        dataToSend.companySize = formData.companySize || '1-10';
        
        // Update local storage to reflect employer status
        try {
          const existingData = localStorage.getItem('registrationData');
          const updatedData = existingData ? JSON.parse(existingData) : {};
          updatedData.userType = 'employer';
          updatedData.companyName = dataToSend.companyName;
          updatedData.industry = dataToSend.industry;
          updatedData.companySize = dataToSend.companySize;
          localStorage.setItem('registrationData', JSON.stringify(updatedData));
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
      } else {
        // Handle job seeker or other role-specific data
        dataToSend.skills = processArrayField(formData.skills);
        
        // Add trainer-specific data if user is a trainer
        if (isTrainer()) {
          dataToSend.specialization = processArrayField(formData.specialization);
        }
        
        // Update storage for job seeker
        try {
          const existingData = localStorage.getItem('registrationData');
          const updatedData = existingData ? JSON.parse(existingData) : {};
          updatedData.userType = 'jobSeeker';
          localStorage.setItem('registrationData', JSON.stringify(updatedData));
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
      }

      // Create a new axios instance with the correct headers
      const onboardingApi = axios.create({
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      // Try different endpoints for updating profile info
      let response;
      try {
        console.log('Attempting to update profile via /users/onboarding/personal-info');
        response = await onboardingApi.put('/users/onboarding/personal-info', dataToSend);
      } catch (error) {
        console.log('Error with first endpoint:', error.message);
        
        try {
          console.log('Attempting fallback to /users/profile');
          response = await onboardingApi.put('/users/profile', dataToSend);
        } catch (error2) {
          console.log('Error with second endpoint:', error2.message);
          
          // Last attempt with /users/me
          console.log('Attempting final fallback to /users/me');
          response = await onboardingApi.put('/users/me', dataToSend);
        }
      }

      if (response && response.data && response.data.success) {
        toast.success('Personal information saved successfully');
        
        // Update user role explicitly based on the detected user type
        try {
          console.log(`Attempting to explicitly update user role to ${userType}`);
          const updateRoleResponse = await onboardingApi.put('/users/role', { 
            role: userType,
            userType: userType,
            roleName: userType
          });
          
          if (updateRoleResponse.data && updateRoleResponse.data.success) {
            console.log(`Successfully updated user role to ${userType}`);
          } else {
            console.warn('Role update API call succeeded but returned success:false');
          }
        } catch (roleError) {
          console.error('Error updating user role:', roleError);
          // Continue with the flow even if role update fails
        }
        
        // Navigate to next step
        navigate('/onboarding/skills');
      } else {
        throw new Error('Server responded but indicated failure');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.message || 'Failed to save personal information');
      toast.error(error.response?.data?.message || 'Failed to save personal information');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the appropriate title based on user role
  const getTitle = () => {
    console.log('Getting title with userRole:', userRole, 'isEmployer:', isEmployer);
    if (isEmployer || userRole.includes('employer')) return 'Company Information';
    if (userRole === 'trainer' || userRole.includes('trainer')) return 'Trainer Information';
    if (userRole === 'trainee' || userRole.includes('trainee')) return 'Trainee Information';
    return 'Personal Information';
  };

  // Format array data for display
  const formatArrayForDisplay = (array) => {
    if (!array) return '';
    if (typeof array === 'string') return array;
    if (Array.isArray(array)) {
      // Filter out empty items and join
      return array.filter(item => item && (typeof item === 'string' ? item.trim() !== '' : true)).join(', ');
    }
    // If it's an object or something else, convert to string
    return String(array);
  };

  // Enhanced role detection helpers
  const isJobSeeker = () => {
    return !isEmployer && 
          !isTrainer() &&
          !isTrainee() &&
          (userRole === 'jobSeeker' || 
          userRole === 'user' || 
          userRole.includes('job') || 
          userRole.includes('seeker'));
  };

  const isTrainer = () => {
    return userRole === 'trainer' || 
           userRole.includes('trainer') || 
           (user && user.roleName === 'trainer');
  };

  const isTrainee = () => {
    return userRole === 'trainee' || 
           userRole.includes('trainee') || 
           (user && user.roleName === 'trainee');
  };

  // Add a more robust version for trainee interests
  const getTraineeInterests = () => {
    // Get interests from form data
    const interestsData = formData.interests;
    
    // Format if exists
    if (interestsData && 
       (Array.isArray(interestsData) && interestsData.length > 0) || 
       (typeof interestsData === 'string' && interestsData.trim() !== '')) {
      return formatArrayForDisplay(interestsData);
    }
    
    // Try to get from local storage as fallback
    try {
      const storedData = localStorage.getItem('registrationData') || sessionStorage.getItem('registrationData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const storedInterest = parsedData.interests || parsedData.interest || parsedData.jobType || parsedData.preferredInterest;
        if (storedInterest) {
          return Array.isArray(storedInterest) ? storedInterest.join(', ') : storedInterest;
        }
      }
    } catch (e) {
      console.error('Error retrieving interests from storage:', e);
    }
    
    // Final fallback to job type or empty string
    return formData.jobType || '';
  };

  // Function to get the appropriate account type label
  const getAccountTypeLabel = () => {
    if (isEmployer || userRole.includes('employer')) return 'Employer Account';
    if (isTrainer()) return 'Trainer Account';
    if (isTrainee()) return 'Trainee Account';
    return 'Job Seeker Account';
  };

  return (
    <>
      <ScrollToTop />
      <OnboardingLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">{getTitle()}</h2>
          
          {/* Display current account type with reduced prominence */}
          <div className="bg-blue-50 p-3 text-sm border border-blue-100 rounded mb-4">
            <p><strong>Account Type:</strong> {getAccountTypeLabel()}</p>
            <p className="text-xs mt-1 text-blue-700">
              This is based on your selection during registration. If this is incorrect, please contact support.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Basic Information - All Fields in Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {/* Common Fields - First Column */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {isEmployer ? 'Company Name' : isTrainer() ? 'Trainer Name' : isTrainee() ? 'Trainee Name' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="relative">
                      <select
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select Location</option>
                        {locations.map(location => (
                          <option key={location._id} value={location._id}>
                            {location.name}, {location.region}
                          </option>
                        ))}
                        <option value="custom">Other (Specify)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Custom Location - Only shown if needed */}
                  {formData.location === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Custom Location
                      </label>
                      <input
                        type="text"
                        name="customLocation"
                        value={formData.customLocation || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your location"
                      />
                    </div>
                  )}

                  {/* Job Type field - shown only for job seekers */}
                  {isJobSeeker() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Job Type / Field
                      </label>
                      <input
                        type="text"
                        name="jobType"
                        value={formData.jobType || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md ${formData.jobType ? 'bg-gray-100 text-gray-800 border-gray-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                        readOnly={!!formData.jobType}
                        placeholder="Enter your job type or professional field"
                        required={isJobSeeker()}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.jobType ? "Job type from your registration" : "Please enter your job type or professional field"}
                      </p>
                    </div>
                  )}

                  {/* Employer-specific fields - Only show if isEmployer is true */}
                  {isEmployer && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Industry
                        </label>
                        <input
                          type="text"
                          name="industry"
                          value={formData.industry || ''}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required={isEmployer}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          E.g., Technology, Healthcare, Construction, Retail
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName || ''}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required={isEmployer}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Company Size
                        </label>
                        <select
                          name="companySize"
                          value={formData.companySize || ''}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required={isEmployer}
                        >
                          <option value="">Select Company Size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="501-1000">501-1000 employees</option>
                          <option value="1001+">1001+ employees</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Trainer-specific fields - Only show if user is a trainer */}
                  {isTrainer() && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Specialization
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          value={formatArrayForDisplay(formData.specialization) || ''}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                          placeholder="Enter your areas of specialization (comma separated)"
                        />
                      </div>
                    </>
                  )}

                  {/* Trainee-specific fields - Only show if user is a trainee */}
                  {isTrainee() && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Training Interests
                        </label>
                        <input
                          type="text"
                          name="interests"
                          value={getTraineeInterests()}
                          className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm text-gray-700"
                          readOnly
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          These are the training interests you selected during registration.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Job Seeker fields */}
                  {isJobSeeker() && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Skills
                        </label>
                        <input
                          type="text"
                          name="skills"
                          value={formatArrayForDisplay(formData.skills) || ''}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter your skills (comma separated)"
                        />
                      </div>
                    </>
                  )}

                  {/* Role-specific notice messages */}
                  {isJobSeeker() && (
                    <div className="col-span-3">
                      <p className="text-xs text-gray-500 mt-2">
                        You are registered as a Job Seeker. If you wish to register as an Employer, please contact support.
                      </p>
                    </div>
                  )}
                  
                  {isTrainer() && (
                    <div className="col-span-3">
                      <p className="text-xs text-gray-500 mt-2">
                        You are registered as a Trainer. Please make sure to provide your specialization.
                      </p>
                    </div>
                  )}
                  
                  {isTrainee() && (
                    <div className="col-span-3">
                      <p className="text-xs text-gray-500 mt-2">
                        You are registered as a Trainee. Please add your interests to help us match you with suitable training opportunities.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Next'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </OnboardingLayout>
    </>
  );
};

export default PersonalInfo;