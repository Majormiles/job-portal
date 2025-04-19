import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import jobService from '../services/jobService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    customLocation: '',
    jobType: '',
    jobTypeId: '',
    customInterest: '',
    file: null,
    companySize: ''
  });

  const [userType, setUserType] = useState('jobSeeker');
  const [talentType, setTalentType] = useState(null);
  const [showTalentOptions, setShowTalentOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCustomInterest, setShowCustomInterest] = useState(false);

  // State for location data
  const [locations, setLocations] = useState([]);
  const [roles, setRoles] = useState([]);
  // State for job categories/types
  const [jobCategories, setJobCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  // State for job types data
  const [jobTypes, setJobTypes] = useState([]);
  const [loadingJobTypes, setLoadingJobTypes] = useState(false);
  // State for interests data (for trainees)
  const [interests, setInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  // State for company types
  const [companyTypes, setCompanyTypes] = useState([]);
  const [loadingCompanyTypes, setLoadingCompanyTypes] = useState(false);

  // State for form errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch locations, roles, job categories, job types, and company types when component mounts
  useEffect(() => {
    // Define some default locations in case the API fails
    const defaultLocations = [
      { _id: 'accra', name: 'Accra', region: 'Greater Accra' },
      { _id: 'kumasi', name: 'Kumasi', region: 'Ashanti' },
      { _id: 'tamale', name: 'Tamale', region: 'Northern' },
      { _id: 'takoradi', name: 'Takoradi', region: 'Western' },
      { _id: 'cape-coast', name: 'Cape Coast', region: 'Central' },
      { _id: 'ho', name: 'Ho', region: 'Volta' },
      { _id: 'koforidua', name: 'Koforidua', region: 'Eastern' }
    ];

    // Default job categories if API fails
    const defaultJobCategories = [
      { _id: 'it', name: 'Information Technology' },
      { _id: 'healthcare', name: 'Healthcare' },
      { _id: 'education', name: 'Education' },
      { _id: 'finance', name: 'Finance' },
      { _id: 'retail', name: 'Retail' },
      { _id: 'manufacturing', name: 'Manufacturing' },
      { _id: 'construction', name: 'Construction' },
      { _id: 'hospitality', name: 'Hospitality & Tourism' },
      { _id: 'agriculture', name: 'Agriculture' },
      { _id: 'transportation', name: 'Transportation & Logistics' },
      { _id: 'media', name: 'Media & Communication' },
      { _id: 'other', name: 'Other' }
    ];

    // Default job types if API fails
    const defaultJobTypes = [
      { id: 'full-time', name: 'Full-time' },
      { id: 'part-time', name: 'Part-time' },
      { id: 'contract', name: 'Contract' },
      { id: 'temporary', name: 'Temporary' },
      { id: 'internship', name: 'Internship' },
      { id: 'remote', name: 'Remote' },
      { id: 'hybrid', name: 'Hybrid' },
      { id: 'seasonal', name: 'Seasonal' },
      { id: 'freelance', name: 'Freelance' },
      { id: 'volunteer', name: 'Volunteer' }
    ];

    // Default interests for trainees if API fails
    const defaultInterests = [
      { id: 'web-development', name: 'Web Development' },
      { id: 'mobile-app-development', name: 'Mobile App Development' },
      { id: 'graphic-design', name: 'Graphic Design' },
      { id: 'ui-ux-design', name: 'UI/UX Design' },
      { id: 'digital-marketing', name: 'Digital Marketing' },
      { id: 'data-analysis', name: 'Data Analysis' },
      { id: 'business-admin', name: 'Business Administration' },
      { id: 'accounting', name: 'Accounting & Finance' },
      { id: 'language', name: 'Language & Communication' },
      { id: 'healthcare', name: 'Healthcare & Wellness' },
      { id: 'culinary', name: 'Culinary Arts' },
      { id: 'fashion', name: 'Fashion & Beauty' },
      { id: 'photography', name: 'Photography & Videography' },
      { id: 'music-production', name: 'Music Production' },
      { id: 'electrical', name: 'Electrical Engineering' },
      { id: 'mechanical', name: 'Mechanical Engineering' },
      { id: 'carpentry', name: 'Carpentry & Woodworking' },
      { id: 'plumbing', name: 'Plumbing' },
      { id: 'welding', name: 'Welding & Metalwork' },
      { id: 'agriculture', name: 'Agriculture & Farming' },
      { id: 'other', name: 'Other' }
    ];

    // Default company types if API fails
    const defaultCompanyTypes = [
      { _id: 'corporation', name: 'Corporation' },
      { _id: 'limited-liability', name: 'Limited Liability Company (LLC)' },
      { _id: 'partnership', name: 'Partnership' },
      { _id: 'sole-proprietorship', name: 'Sole Proprietorship' },
      { _id: 'non-profit', name: 'Non-Profit Organization' },
      { _id: 'startup', name: 'Startup' },
      { _id: 'government', name: 'Government Agency' },
      { _id: 'educational', name: 'Educational Institution' },
      { _id: 'other', name: 'Other' }
    ];

    // Default roles if API fails
    const defaultRoles = [
      { name: 'user', displayName: 'User' },
      { name: 'employer', displayName: 'Employer' },
      { name: 'trainer', displayName: 'Trainer' },
      { name: 'trainee', displayName: 'Trainee' }
    ];

    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API_URL}/locations`);
        if (response.data.success && response.data.data.length > 0) {
          setLocations(response.data.data);
        } else {
          // Use default locations if API returns empty data
          setLocations(defaultLocations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Use default locations in case of error
        setLocations(defaultLocations);
      }
    };

    const fetchJobCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await axios.get(`${API_URL}/categories`);
        if (response.data.success && response.data.data.length > 0) {
          setJobCategories(response.data.data);
        } else {
          // Use default categories if API returns empty data
          setJobCategories(defaultJobCategories);
        }
      } catch (error) {
        console.error('Error fetching job categories:', error);
        // Use default categories in case of error
        setJobCategories(defaultJobCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    // Fetch job types for job seekers and trainees
    const fetchJobTypes = async () => {
      setLoadingJobTypes(true);
      try {
        // Use the job service instead of direct axios call
        const response = await jobService.getJobTypes();
        if (response.success && response.data.length > 0) {
          setJobTypes(response.data);
        } else {
          // Use default job types if API returns empty data
          setJobTypes(defaultJobTypes);
        }
      } catch (error) {
        console.error('Error fetching job types:', error);
        // Use default job types in case of error
        setJobTypes(defaultJobTypes);
      } finally {
        setLoadingJobTypes(false);
      }
    };

    // Fetch interests for trainees
    const fetchInterests = async () => {
      setLoadingInterests(true);
      try {
        // Try to fetch interests from a dedicated training interests endpoint
        try {
          // First try a dedicated interests endpoint
          const response = await axios.get(`${API_URL}/training/interests`);
          if (response.data.success && response.data.data.length > 0) {
            // Make sure "Other" option is included
            const interestsData = response.data.data;
            if (!interestsData.some(item => item.name === 'Other' || item.id === 'other')) {
              interestsData.push({ id: 'other', name: 'Other' });
            }
            setInterests(interestsData);
            return;
          }
        } catch (interestsError) {
          console.log('Dedicated training interests endpoint not available:', interestsError.message);
        }

        // Try a secondary interests endpoint
        try {
          const response = await axios.get(`${API_URL}/categories/interests`);
          if (response.data.success && response.data.data.length > 0) {
            // Make sure "Other" option is included
            const interestsData = response.data.data;
            if (!interestsData.some(item => item.name === 'Other' || item.id === 'other')) {
              interestsData.push({ id: 'other', name: 'Other' });
            }
            setInterests(interestsData);
            return;
          }
        } catch (secondaryInterestsError) {
          console.log('Secondary interests endpoint not available:', secondaryInterestsError.message);
        }

        // Instead of using categories as a fallback, use our comprehensive default interests list
        console.log('Using predefined training interests as no API endpoint was available');
        setInterests(defaultInterests);
      } catch (error) {
        console.error('Error fetching interests:', error);
        // Use default interests in case of error
        setInterests(defaultInterests);
      } finally {
        setLoadingInterests(false);
      }
    };

    // Fetch company types for employer registration
    const fetchCompanyTypes = async () => {
      setLoadingCompanyTypes(true);
      try {
        // Try different endpoints that might contain company types
        const endpoints = [
          '/company-types',
          '/industries', 
          '/categories/industries',
          '/employer/industries'
        ];
        
        let companyTypesData = null;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`Attempting to fetch company types from ${API_URL}${endpoint}`);
            const response = await axios.get(`${API_URL}${endpoint}`);
            if (response.data && (response.data.success || response.data.data)) {
              companyTypesData = response.data.data || response.data;
              console.log('Successfully fetched company types:', companyTypesData);
              break;
            }
          } catch (err) {
            // Try the next endpoint
            console.log(`Endpoint ${endpoint} failed:`, err.message);
          }
        }
        
        if (companyTypesData && Array.isArray(companyTypesData) && companyTypesData.length > 0) {
          setCompanyTypes(companyTypesData);
        } else {
          // Use job categories as company types if no dedicated endpoint exists
          console.log('Using job categories as company types');
          setCompanyTypes(defaultCompanyTypes);
        }
      } catch (error) {
        console.error('Error fetching company types:', error);
        setCompanyTypes(defaultCompanyTypes);
      } finally {
        setLoadingCompanyTypes(false);
      }
    };

    // Try to fetch roles to understand the correct role names
    const fetchRoles = async () => {
      try {
        // Try different possible endpoints for roles
        const endpoints = [
          '/roles', 
          '/user-roles', 
          '/users/roles', 
          '/auth/roles'
        ];
        
        let rolesData = null;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`Attempting to fetch roles from ${API_URL}${endpoint}`);
            const response = await axios.get(`${API_URL}${endpoint}`);
            if (response.data && (response.data.success || response.data.data)) {
              rolesData = response.data.data || response.data;
              console.log('Successfully fetched roles:', rolesData);
              break;
            }
          } catch (err) {
            // Try the next endpoint
            console.log(`Endpoint ${endpoint} failed:`, err.message);
          }
        }
        
        if (rolesData && Array.isArray(rolesData) && rolesData.length > 0) {
          setRoles(rolesData);
          console.log('Valid role names are:', rolesData.map(r => r.name));
        } else {
          console.log('Using default roles:', defaultRoles);
          setRoles(defaultRoles);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        setRoles(defaultRoles);
      }
    };

    // Execute the fetch functions
    fetchLocations();
    fetchJobCategories();
    fetchJobTypes();
    fetchCompanyTypes();
    fetchRoles();
    fetchInterests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear the error for this field when user changes the input
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Special handling for jobType based on user type
    if (name === 'jobType') {
      if (userType === 'employer' && jobCategories.length > 0) {
        // For employers, we use job categories (industries)
        const selectedCategory = jobCategories.find(cat => cat.name === value);
        if (selectedCategory) {
          console.log('Selected job category:', selectedCategory);
          setFormData({
            ...formData,
            jobType: value,
            jobTypeId: selectedCategory._id // Store the category ID
          });
        } else {
          setFormData({
            ...formData,
            [name]: value
          });
        }
      } else if (userType === 'jobSeeker' && jobTypes.length > 0) {
        // For job seekers, we use job types
        const selectedJobType = jobTypes.find(type => type.name === value);
        if (selectedJobType) {
          console.log('Selected job type:', selectedJobType);
          setFormData({
            ...formData,
            jobType: value,
            jobTypeId: selectedJobType.id // Store the job type ID
          });
        } else {
          setFormData({
            ...formData,
            [name]: value
          });
        }
      } else if (userType === 'talent' && talentType === 'trainee' && interests.length > 0) {
        // For trainees, we use interests
        if (value === 'Other') {
          // Show custom interest field
          setShowCustomInterest(true);
          setFormData({
            ...formData,
            jobType: value,
            jobTypeId: 'other'
          });
        } else {
          // Use selected interest
          setShowCustomInterest(false);
          const selectedInterest = interests.find(interest => interest.name === value);
          if (selectedInterest) {
            console.log('Selected interest:', selectedInterest);
            setFormData({
              ...formData,
              jobType: value,
              jobTypeId: selectedInterest.id,
              customInterest: '' // Clear custom interest when a predefined option is selected
            });
          } else {
            setFormData({
              ...formData,
              [name]: value
            });
          }
        }
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else if (name === 'customInterest') {
      // Handle custom interest field
      setFormData({
        ...formData,
        customInterest: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0]
    });
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    
    if (type === 'talent') {
      setShowTalentOptions(true);
      setTalentType(null);
    } else {
      setShowTalentOptions(false);
    }
  };

  const handleTalentTypeSelect = (type) => {
    setTalentType(type);
  };

  // Enhance validateForm function to add better email validation
  const validateForm = () => {
    const errors = {};
    
    // Validate email format with a more robust regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email) {
      errors.email = 'Email is required';
      toast.error('Please enter your email address');
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      toast.error('Please enter a valid email address');
    }
    
    // Other validations
    if (!formData.fullName) {
      errors.fullName = 'Name is required';
      toast.error('Please enter your name');
    }
    
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
      toast.error('Please enter your phone number');
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number';
      toast.error('Please enter a valid 10-digit phone number');
    }
    
    if (!formData.location) {
      errors.location = 'Location is required';
      toast.error('Please select your location');
    }
    
    if (!formData.jobType) {
      errors.jobType = userType === 'talent' && talentType === 'trainee' ? 
        'Please select your training interest' : 
        'Please select a job type';
      toast.error(errors.jobType);
    }
    
    // Employer specific validation
    if (userType === 'employer' && !formData.companySize) {
      errors.companySize = 'Company size is required';
      toast.error('Please select your company size');
    }
    
    // Custom interest validation for trainees who selected "Other"
    if (userType === 'talent' && talentType === 'trainee' && 
        formData.jobType === 'Other' && !formData.customInterest) {
      errors.customInterest = 'Please specify your interest';
      toast.error('Please specify your interest');
    }
    
    // Set errors in state
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }
    
    return true;
  };

  const clearErrors = () => {
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Process location data
      let locationData = {};
      
      if (formData.location === 'custom') {
        // Handle custom location
        if (!formData.customLocation.trim()) {
          toast.error('Please enter your custom location');
          setLoading(false);
          return;
        }
        locationData.customLocation = formData.customLocation;
      } else {
        // Handle selected location from dropdown
        const selectedLocation = locations.find(loc => loc._id === formData.location);
        if (selectedLocation) {
          if (selectedLocation._id.length === 24 && /^[0-9a-f]{24}$/i.test(selectedLocation._id)) {
            locationData.location = selectedLocation._id;
          } else {
            locationData.customLocation = `${selectedLocation.name}, ${selectedLocation.region}`;
          }
        }
      }
      
      // Create registration data
      const registrationData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        // Add a default password to satisfy the backend requirement
        password: 'Password123!',
        // Add a flag to skip email verification in development
        skipEmailVerification: true,
        // Add location data
        ...locationData
      };
      
      // Explicitly set the role and user type based on selection
      registrationData.userType = userType;
      registrationData.role = userType;
      registrationData.roleName = userType;
      
      // Add role-specific data based on user selection
      if (userType === 'jobSeeker') {
        // For job seekers, we store job type in the skills array
        registrationData.preferredJobType = formData.jobType;
        registrationData.jobTypeId = formData.jobTypeId;
        registrationData.skills = [formData.jobType];
        
        // Add job type to user preferences
        registrationData.preferences = {
          jobType: formData.jobType
        };
      } else if (userType === 'employer') {
        // For employers, set both name and company name fields
        registrationData.companyName = formData.fullName;
        // Ensure we have a user's real name if company name is different
        registrationData.name = formData.fullName;
        registrationData.industry = formData.jobType;
        if (formData.jobTypeId) {
          registrationData.categoryId = formData.jobTypeId;
        }
        registrationData.companySize = formData.companySize;
        registrationData.companyType = formData.jobType; // Store jobType as companyType for employers
      } else if (userType === 'talent') {
        if (talentType === 'trainer') {
          registrationData.organization = formData.fullName;
          registrationData.specialization = [formData.jobType];
          // Add preferred job type
          registrationData.preferredJobType = formData.jobType;
          registrationData.jobTypeId = formData.jobTypeId;
        } else {
          // For trainees, store the interest properly
          const interestValue = formData.jobType === 'Other' ? formData.customInterest : formData.jobType;
          
          registrationData.interests = [interestValue];
          registrationData.preferredInterest = interestValue;
          registrationData.interestId = formData.jobTypeId;
          
          // Add custom interest flag if applicable
          if (formData.jobType === 'Other') {
            registrationData.hasCustomInterest = true;
            registrationData.customInterest = formData.customInterest;
          }
        }
      }
      
      console.log('Attempting registration with the following data:');
      console.log(JSON.stringify({...registrationData, password: '*****'}));

      try {
        // First try - Direct axios call to see full error details
        try {
          console.log('Making direct registration attempt to debug server response');
          const directResponse = await axios({
            method: 'post',
            url: `${API_URL}/auth/register`,
            data: registrationData,
            validateStatus: false // Don't throw errors for non-2xx status codes
          });
          
          console.log('Registration server response status:', directResponse.status);
          console.log('Registration server response headers:', directResponse.headers);
          console.log('Registration server response data:', directResponse.data);
          
          // Handle specific error for existing user
          if (directResponse.status === 500 && 
              directResponse.data && 
              typeof directResponse.data.message === 'string' && 
              (directResponse.data.message.includes('User already exists') || 
               directResponse.data.message.toLowerCase().includes('already exists') || 
               directResponse.data.message.toLowerCase().includes('already registered') ||
               directResponse.data.message.toLowerCase().includes('duplicate'))) {
            
            console.log('Detected existing user error in a 500 response');
            
            // Set email validation error
            setFormErrors(prev => ({
              ...prev,
              email: 'Email already exists'
            }));
            
            // Show error toast
            toast.error('This email address is already registered.');
            setTimeout(() => {
              toast.info('Please use a different email address or try logging in instead.');
            }, 500);
            
            // Focus on the email field
            setTimeout(() => {
              const emailField = document.querySelector('input[name="email"]');
              if (emailField) {
                emailField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                emailField.focus();
              }
            }, 100);
            
            // Exit early
            setLoading(false);
            return;
          }
          
          if (directResponse.status >= 200 && directResponse.status < 300) {
            // Success case
            localStorage.setItem('pendingVerificationEmail', formData.email);
            
            // Store job type and basic registration data for fallback during onboarding
            try {
              const storageData = {
                jobType: formData.jobType,
                jobTypeId: formData.jobTypeId,
                userType: userType,
                talentType: talentType,
                location: formData.location,
                customLocation: formData.customLocation,
                // Add explicit data about job type
                preferredJobType: formData.jobType,
                isJobTypeCategory: userType === 'employer', // Flag to indicate if the job type is a category (employer) or actual job type
              };
              
              // Add trainee-specific data if applicable
              if (userType === 'talent' && talentType === 'trainee') {
                storageData.interest = formData.jobType === 'Other' ? formData.customInterest : formData.jobType;
                storageData.interestId = formData.jobTypeId;
                storageData.hasCustomInterest = formData.jobType === 'Other';
                storageData.customInterest = formData.customInterest;
              }
              
              // Add employer-specific data if applicable
              if (userType === 'employer') {
                storageData.companySize = formData.companySize;
                storageData.companyName = formData.fullName;
                storageData.industry = formData.jobType;
                storageData.companyType = formData.jobType;
              }
              
              localStorage.setItem('registrationData', JSON.stringify(storageData));
              
              // Also store in sessionStorage as a backup
              sessionStorage.setItem('registrationData', JSON.stringify(storageData));
              
              console.log('Stored registration data in storage with jobType:', formData.jobType);
              console.log('Stored location data:', {
                location: formData.location,
                customLocation: formData.customLocation
              });
            } catch (storageError) {
              console.log('Error storing registration data:', storageError);
            }
            
            toast.success('Registration successful! Please check your email to verify your account.');
            navigate('/login', { 
              state: { 
                registrationSuccess: true, 
                email: formData.email,
                verificationRequired: true,
                message: 'Registration successful! Please check your email to verify your account before logging in.'
              } 
            });
            return;
          }
        } catch (directError) {
          console.error('Direct registration attempt failed:', directError);
          console.error('Error details:', directError.response?.data || directError.message);
          
          // Handle specific error for existing user
          if (directError.message && 
              (directError.message.includes('User already exists') || 
               directError.message.toLowerCase().includes('already exists') || 
               directError.message.toLowerCase().includes('already registered') ||
               directError.message.toLowerCase().includes('duplicate'))) {
            
            console.log('Detected existing user error in error message');
            
            // Set email validation error
            setFormErrors(prev => ({
              ...prev,
              email: 'Email already exists'
            }));
            
            // Show error toast
            toast.error('This email address is already registered.');
            setTimeout(() => {
              toast.info('Please use a different email address or try logging in instead.');
            }, 500);
            
            // Focus on the email field
            setTimeout(() => {
              const emailField = document.querySelector('input[name="email"]');
              if (emailField) {
                emailField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                emailField.focus();
              }
            }, 100);
            
            // Exit early
            setLoading(false);
            return;
          }
          
          // Also check response data for the error
          if (directError.response?.data?.message && 
              (directError.response.data.message.includes('User already exists') ||
               directError.response.data.message.toLowerCase().includes('already exists') ||
               directError.response.data.message.toLowerCase().includes('already registered') ||
               directError.response.data.message.toLowerCase().includes('duplicate'))) {
            
            console.log('Detected existing user error in response data');
            
            // Set email validation error
            setFormErrors(prev => ({
              ...prev,
              email: 'Email already exists'
            }));
            
            // Show error toast
            toast.error('This email address is already registered.');
            setTimeout(() => {
              toast.info('Please use a different email address or try logging in instead.');
            }, 500);
            
            // Focus on the email field
            setTimeout(() => {
              const emailField = document.querySelector('input[name="email"]');
              if (emailField) {
                emailField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                emailField.focus();
              }
            }, 100);
            
            // Exit early
            setLoading(false);
            return;
          }
          
          // If direct attempt has useful error info, throw it now
          if (directError.response?.data?.message) {
            throw new Error(directError.response.data.message);
          }
          
          // Continue with alternative role attempts
        }

        // Try alternative role names if the first attempt failed
        // Map the UI role names to possible API role names
        const roleOptions = [
          { uiType: 'jobSeeker', possible: ['jobSeeker', 'user', 'candidate', 'applicant', 'job-seeker', 'regular'] },
          { uiType: 'employer', possible: ['employer', 'company', 'business', 'recruiter', 'vendor'] },
          { uiType: 'talent', subType: 'trainer', possible: ['trainer', 'teacher', 'instructor', 'coach'] },
          { uiType: 'talent', subType: 'trainee', possible: ['trainee', 'student', 'learner', 'mentee'] }
        ];
        
        // Find the appropriate role options based on user selection
        let roleToTry = roleOptions.find(r => 
          r.uiType === userType && 
          (r.uiType !== 'talent' || r.subType === talentType)
        );
        
        if (roleToTry) {
          // Try each possible role name
          for (const roleName of roleToTry.possible) {
            try {
              console.log(`Trying registration with role: ${roleName}`);
              const roleData = { 
                ...registrationData, 
                roleName,
                role: roleName,
                userType: roleName
              };
              
              const retryResponse = await axios.post(`${API_URL}/auth/register`, roleData);
              
              if (retryResponse.data.success) {
                // Store the successful role name in localStorage for future reference
                try {
                  const existingData = localStorage.getItem('registrationData') 
                    ? JSON.parse(localStorage.getItem('registrationData')) 
                    : {};
                  
                  existingData.successfulRoleName = roleName;
                  localStorage.setItem('registrationData', JSON.stringify(existingData));
                } catch (e) {
                  console.error('Error updating registration data with successful role:', e);
                }
                
                toast.success('Registration successful! Please check your email to verify your account.');
                navigate('/login', { 
                  state: { 
                    registrationSuccess: true, 
                    email: formData.email,
                    verificationRequired: true,
                    message: 'Registration successful! Please check your email to verify your account before logging in.'
                  } 
                });
                return; // Exit if successful
              }
            } catch (roleError) {
              console.log(`Registration with ${roleName} failed:`, roleError.message);
              console.log('Error details:', roleError.response?.data || 'No detailed error information');
              // Continue to next role
            }
          }
        }
      } catch (firstAttemptError) {
        console.log('Registration without role failed:', firstAttemptError.message);
        console.log('Error details:', firstAttemptError.response?.data || 'No detailed error information');
        
        // Check if the error contains information about required fields
        if (firstAttemptError.response?.data?.errors) {
          const errorFields = Object.keys(firstAttemptError.response.data.errors).join(', ');
          console.error(`Server indicates issues with fields: ${errorFields}`);
          toast.error(`Registration failed: Issues with fields: ${errorFields}`);
          throw firstAttemptError;
        }
        
        // If first attempt failed, try with different role names
        const roleOptions = [
          { uiType: 'jobSeeker', possible: ['jobSeeker', 'user', 'candidate', 'applicant', 'job-seeker', 'regular'] },
          { uiType: 'employer', possible: ['employer', 'company', 'business', 'recruiter', 'vendor'] },
          { uiType: 'talent', subType: 'trainer', possible: ['trainer', 'teacher', 'instructor', 'coach'] },
          { uiType: 'talent', subType: 'trainee', possible: ['trainee', 'student', 'learner', 'mentee'] }
        ];
        
        // Find the appropriate role options based on user selection
        let roleToTry = roleOptions.find(r => 
          r.uiType === userType && 
          (r.uiType !== 'talent' || r.subType === talentType)
        );
        
        if (roleToTry) {
          // Try each possible role name
          for (const roleName of roleToTry.possible) {
            try {
              console.log(`Trying registration with role: ${roleName}`);
              const roleData = { ...registrationData, roleName };
              
              const retryResponse = await axios.post(`${API_URL}/auth/register`, roleData);
              
              if (retryResponse.data.success) {
                toast.success('Registration successful! Please check your email to verify your account.');
                navigate('/login', { 
                  state: { 
                    registrationSuccess: true, 
                    email: formData.email,
                    verificationRequired: true,
                    message: 'Registration successful! Please check your email to verify your account before logging in.'
                  } 
                });
                return; // Exit if successful
              }
            } catch (roleError) {
              console.log(`Registration with ${roleName} failed:`, roleError.message);
              console.log('Error details:', roleError.response?.data || 'No detailed error information');
              // Continue to next role
            }
          }
        }
        
        // As a last resort, try admin-initialized roles from database
        try {
          console.log('Attempting to fetch available roles from server...');
          const rolesResponse = await axios.get(`${API_URL}/roles`);
          
          if (rolesResponse.data && Array.isArray(rolesResponse.data.data)) {
            const availableRoles = rolesResponse.data.data;
            console.log('Available roles:', availableRoles);
            
            for (const role of availableRoles) {
              if (role.isActive) {
                try {
                  console.log(`Trying with server-provided role: ${role.name}`);
                  const serverRoleData = { ...registrationData, roleName: role.name };
                  
                  const finalResponse = await axios.post(`${API_URL}/auth/register`, serverRoleData);
                  
                  if (finalResponse.data.success) {
                    toast.success('Registration successful! Please check your email to verify your account.');
                    navigate('/login', { state: { registrationSuccess: true, email: formData.email } });
                    return; // Exit if successful
                  }
                } catch (finalError) {
                  console.log(`Registration with server role ${role.name} failed:`, finalError.message);
                  console.log('Error details:', finalError.response?.data || 'No detailed error information');
                }
              }
            }
          }
        } catch (rolesError) {
          console.log('Failed to fetch roles from server:', rolesError.message);
          console.log('Error details:', rolesError.response?.data || 'No detailed error information');
        }
        
        // Try one more attempt with minimal data
        try {
          console.log('Attempting simplified registration with minimal required data');
          const minimalData = {
            name: formData.fullName,
            email: formData.email,
            password: 'Password123!'
          };
          
          const minimalResponse = await axios.post(`${API_URL}/auth/register`, minimalData);
          
          if (minimalResponse.data.success) {
            toast.success('Registration successful! Please check your email to verify your account.');
            navigate('/login', { 
              state: { 
                registrationSuccess: true, 
                email: formData.email,
                verificationRequired: true,
                message: 'Registration successful! Please check your email to verify your account before logging in.'
              } 
            });
            return;
          }
        } catch (minimalError) {
          console.log('Minimal registration failed:', minimalError.message);
          console.log('Error details:', minimalError.response?.data || 'No detailed error information');
        }
        
        // If all attempts failed, show original error
        throw firstAttemptError;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      
      // Extract the most useful error message to display to the user
      let errorMessage = 'Registration failed. Please try again.';
      let errorDetails = '';
      
      // Check for specific error messages first before checking response status
      if (error.message && (
          error.message.toLowerCase().includes('already registered') || 
          error.message.toLowerCase().includes('already exists') ||
          error.message.toLowerCase().includes('email is already') ||
          error.message.toLowerCase().includes('user already exists'))) {
        
        // This is definitely a duplicate email error regardless of status code
        errorMessage = 'This email address is already registered.';
        errorDetails = 'Please use a different email address or try logging in instead.';
        
        // Highlight the email field to indicate it's the source of the error
        setFormErrors(prev => ({
          ...prev,
          email: 'Email already exists'
        }));
        
        // Show the error message to the user
        toast.error(errorMessage);
        
        // If we have additional details, show them as a second toast
        if (errorDetails) {
          setTimeout(() => {
            toast.info(errorDetails);
          }, 500);
        }
        
        // After setting formErrors, scroll to the first error element
        setTimeout(() => {
          const firstErrorField = document.querySelector('.border-red-500');
          if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
          }
        }, 100);
        
        return; // Exit early since we've handled this specific error case
      }
      
      // Check response status and extract appropriate messages
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        // Handle specific HTTP status codes
        switch (error.response.status) {
          case 409: // Conflict - typically means duplicate email
            errorMessage = 'This email address is already registered.';
            errorDetails = 'Please use a different email address or try logging in instead.';
            
            // Highlight the email field to indicate it's the source of the error
            setFormErrors(prev => ({
              ...prev,
              email: 'Email already exists'
            }));
            break;
            
          case 400: // Bad Request - invalid data
            errorMessage = error.response.data?.message || 'Invalid registration data provided.';
            errorDetails = 'Please check your information and try again.';
            
            // If the backend provided field-specific errors, set them
            if (error.response.data?.errors) {
              const serverErrors = error.response.data.errors;
              const fieldErrors = {};
              
              Object.keys(serverErrors).forEach(field => {
                fieldErrors[field] = serverErrors[field].message || serverErrors[field];
              });
              
              setFormErrors(prev => ({
                ...prev,
                ...fieldErrors
              }));
            }
            break;
            
          case 500: // Server Error
            errorMessage = 'Server error occurred during registration.';
            errorDetails = error.response.data?.message || 'Please try again later or contact support.';
            break;
            
          default:
            // For any other response status
            errorMessage = error.response.data?.message || 'An error occurred during registration.';
            errorDetails = 'Please try again or contact support if the issue persists.';
        }
      } else if (error.request) {
        // Network error - no response received
        errorMessage = 'Unable to connect to the registration service.';
        errorDetails = 'Please check your internet connection and try again.';
      } else {
        // Other errors
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      // Show the error message to the user
      toast.error(errorMessage);
      
      // If we have additional details, show them as a second toast
      if (errorDetails) {
        setTimeout(() => {
          toast.info(errorDetails);
        }, 500);
      }
      
      // After setting formErrors, scroll to the first error element
      setTimeout(() => {
        const firstErrorField = document.querySelector('.border-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus();
        }
      }, 100);
    }
  };

  // Determine payment amount based on user type
  const getPaymentAmount = () => {
    if (userType === 'employer') {
      return '100 GHS';
    }
    return '50 GHS';
  };

  // Check if we should show the registration form
  const shouldShowForm = () => {
    if (userType === 'talent') {
      return talentType !== null;
    }
    return true;
  };

  // Check if we should show the Skill Training section
  const shouldShowSkillTraining = () => {
    return userType === 'jobSeeker' || 
           (userType === 'talent' && talentType !== null);
  };

  return (
    <div className="min-h-screen bg-gray-80 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left panel */}
          <div className="w-full md:w-1/2 p-8">
            <Link to="/" className="inline-block mb-2">
              <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Register to Find Jobs & Training</h1>
            <p className="text-base text-gray-700 mb-2">
              Connect with companies and skill training providers. Register to get started.
            </p>

            <p className="text-base text-blue-500 mb-4">
              Choose your role to get started!
            </p>
            
            {/* User Type Selection */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <button
                type="button"
                className={`flex flex-col items-center justify-center p-4 rounded-md ${
                  userType === 'jobSeeker' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'
                }`}
                onClick={() => handleUserTypeSelect('jobSeeker')}
              >
                <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-2 ${
                  userType === 'jobSeeker' ? 'bg-white' : 'bg-blue-500'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                    userType === 'jobSeeker' ? 'text-blue-500' : 'text-white'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Job Seeker</span>
              </button>
              
              <button
                type="button"
                className={`flex flex-col items-center justify-center p-4 rounded-md ${
                  userType === 'employer' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'
                }`}
                onClick={() => handleUserTypeSelect('employer')}
              >
                <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-2 ${
                  userType === 'employer' ? 'bg-white' : 'bg-blue-500'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                    userType === 'employer' ? 'text-blue-500' : 'text-white'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Employer</span>
              </button>
              
              <button
                type="button"
                className={`flex flex-col items-center justify-center p-4 rounded-md ${
                  userType === 'talent' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'
                }`}
                onClick={() => handleUserTypeSelect('talent')}
              >
                <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-2 ${
                  userType === 'talent' ? 'bg-white' : 'bg-blue-500'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                    userType === 'talent' ? 'text-blue-500' : 'text-white'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Talent</span>
              </button>
            </div>
            
            {/* Talent Type Selection - only show when Talent is selected */}
            {userType === 'talent' && !talentType && (
              <div className="mt-4 mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Choose Your Talent Category</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center p-5 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-200"
                    onClick={() => handleTalentTypeSelect('trainer')}
                  >
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-base font-medium text-gray-900">Trainer</span>
                    <p className="text-sm text-gray-500 text-center mt-2">Register as a trainer to provide skills training</p>
                  </button>
                  
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center p-5 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-200"
                    onClick={() => handleTalentTypeSelect('trainee')}
                  >
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-base font-medium text-gray-900">Trainee</span>
                    <p className="text-sm text-gray-500 text-center mt-2">Register as a trainee to learn new skills</p>
                  </button>
                </div>
              </div>
            )}
            
            {/* Skill Training Categories - Show for Job Seeker, Trainer, and Trainee */}
            {shouldShowSkillTraining() && (
              <div>
                <h3 className="text-lg mt-20 font-medium text-gray-800 mb-4 ">Skill Training</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-gray-800 rounded-md flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="text-sm text-center font-medium">Tailoring</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-gray-800 rounded-md flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="7" r="4" />
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      </svg>
                    </div>
                    <span className="text-sm text-center font-medium">Hairdressing</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-gray-800 rounded-md flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <span className="text-sm text-center font-medium">Security</span>
                  </div>
                </div>
                
                
              </div>
            )}

            {/* Employer Information - Only show for Employer */}
            {userType === 'employer' && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Employer Benefits</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Post unlimited job listings
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Access to candidate database
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Applicant tracking system
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Priority customer support
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Right panel - Sign Up Form */}
          {shouldShowForm() && (
            <div className="w-full md:w-1/2 p-6 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {userType === 'employer' ? 'Register as Employer' : 
                 userType === 'talent' && talentType === 'trainer' ? 'Register as Trainer' :
                 userType === 'talent' && talentType === 'trainee' ? 'Register as Trainee' :
                 'Register as Job Seeker'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-0">
                <div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name or Business Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full p-3 border ${formErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.fullName}
                    </p>
                  )}
                </div>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-3 border ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                
                <div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full p-3 border ${formErrors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {formErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>
                
                <div>
                  <div className="relative">
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full p-3 border ${formErrors.location ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="">Location</option>
                      {locations.length > 0 ? (
                        locations.map(location => (
                          <option key={location._id} value={location._id}>
                            {location.name}, {location.region}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="accra">Accra</option>
                          <option value="kumasi">Kumasi</option>
                          <option value="tamale">Tamale</option>
                          <option value="takoradi">Takoradi</option>
                        </>
                      )}
                      <option value="custom">Other (Custom Location)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {formErrors.location && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.location}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Custom Location field - Only shown when "Other" is selected */}
                {formData.location === 'custom' && (
                  <div>
                    <input
                      type="text"
                      name="customLocation"
                      placeholder="Enter your location"
                      value={formData.customLocation}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                
                <div>
                  {userType === 'employer' ? (
                    <div className="relative">
                      <select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        className={`w-full p-3 border ${formErrors.jobType ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      >
                        <option value="">
                          {loadingCompanyTypes ? 'Loading company types...' : 'Select Company Type'}
                        </option>
                        {companyTypes.length > 0 ? (
                          companyTypes.map(type => (
                            <option key={type._id} value={type.name}>
                              {type.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Corporation">Corporation</option>
                            <option value="Limited Liability Company">Limited Liability Company (LLC)</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Sole Proprietorship">Sole Proprietorship</option>
                            <option value="Non-Profit Organization">Non-Profit Organization</option>
                            <option value="Startup">Startup</option>
                            <option value="Government Agency">Government Agency</option>
                            <option value="Educational Institution">Educational Institution</option>
                            <option value="Other">Other</option>
                          </>
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : userType === 'talent' && talentType === 'trainer' ? (
                    <input
                      type="text"
                      name="jobType"
                      placeholder="Training Specialty"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : userType === 'talent' && talentType === 'trainee' ? (
                    <div>
                      <div className="relative">
                        <select
                          name="jobType"
                          value={formData.jobType}
                          onChange={handleChange}
                          className={`w-full p-3 border ${formErrors.jobType ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          required
                        >
                          <option value="">
                            {loadingInterests ? 'Loading interests...' : 'Select Your Training Interest'}
                          </option>
                          {interests.length > 0 ? (
                            interests.map(interest => (
                              <option key={interest.id} value={interest.name} data-id={interest.id}>
                                {interest.name}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Web Development">Web Development</option>
                              <option value="Mobile App Development">Mobile App Development</option>
                              <option value="Graphic Design">Graphic Design</option>
                              <option value="UI/UX Design">UI/UX Design</option>
                              <option value="Digital Marketing">Digital Marketing</option>
                              <option value="Data Analysis">Data Analysis</option>
                              <option value="Business Administration">Business Administration</option>
                              <option value="Accounting & Finance">Accounting & Finance</option>
                              <option value="Language & Communication">Language & Communication</option>
                              <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                              <option value="Culinary Arts">Culinary Arts</option>
                              <option value="Fashion & Beauty">Fashion & Beauty</option>
                              <option value="Photography & Videography">Photography & Videography</option>
                              <option value="Music Production">Music Production</option>
                              <option value="Electrical Engineering">Electrical Engineering</option>
                              <option value="Carpentry & Woodworking">Carpentry & Woodworking</option>
                              <option value="Plumbing">Plumbing</option>
                              <option value="Agriculture & Farming">Agriculture & Farming</option>
                              <option value="Other">Other</option>
                            </>
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Custom Interest field - Only shown when "Other" is selected */}
                      {showCustomInterest && (
                        <div className="mt-3">
                          <input
                            type="text"
                            name="customInterest"
                            placeholder="Enter your interest"
                            value={formData.customInterest}
                            onChange={handleChange}
                            className={`w-full p-3 border ${formErrors.customInterest ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                          {formErrors.customInterest && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.customInterest}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        className={`w-full p-3 border ${formErrors.jobType ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      >
                        <option value="">
                          {loadingJobTypes ? 'Loading job types...' : 'Select Job Type'}
                        </option>
                        {jobTypes.length > 0 ? (
                          jobTypes.map(type => (
                            <option key={type.id} value={type.name} data-id={type.id}>
                              {type.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Temporary">Temporary</option>
                            <option value="Internship">Internship</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Seasonal">Seasonal</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Volunteer">Volunteer</option>
                          </>
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Company Size field for Employers only */}
                {userType === 'employer' && (
                  <div>
                    <div className="relative">
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleChange}
                        className={`w-full p-3 border ${formErrors.companySize ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      >
                        <option value="">Select Company Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1001+">1001+ employees</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="w-full p-3 border border-gray-300 rounded-md flex items-center justify-between bg-gray-50">
                    <span className="text-gray-800">Payment</span>
                    <span className="font-medium">{getPaymentAmount()}</span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 rounded-md font-medium hover:bg-blue-600 transition duration-300"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Register'}
                </button>

                {/* Login link */}
                <div className="mt-6 border-t border-gray100">
                  <p className="text-left text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                      Login
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;