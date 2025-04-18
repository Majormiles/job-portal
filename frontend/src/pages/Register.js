import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    jobType: '',
    jobTypeId: '',
    file: null,
    companySize: ''
  });

  const [userType, setUserType] = useState('jobSeeker');
  const [talentType, setTalentType] = useState(null);
  const [showTalentOptions, setShowTalentOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for location data
  const [locations, setLocations] = useState([]);
  const [roles, setRoles] = useState([]);
  // State for job categories/types
  const [jobCategories, setJobCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch locations, roles, and job categories when component mounts
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
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for jobType to also track the category ID
    if (name === 'jobType' && jobCategories.length > 0) {
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

  // Form validation
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter your name');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }

    if (!formData.location) {
      toast.error('Please select your location');
      return false;
    }

    if (!formData.jobType.trim()) {
      toast.error('Please enter your job type');
      return false;
    }

    // Employer-specific validation
    if (userType === 'employer' && !formData.companySize) {
      toast.error('Please select your company size');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Find selected location details
      const selectedLocation = locations.find(loc => loc._id === formData.location);
      
      // Create registration data
      const registrationData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        // Add a default password to satisfy the backend requirement
        password: 'Password123!',
        // Add a flag to skip email verification in development
        skipEmailVerification: true
      };
      
      // Handle location data
      if (selectedLocation) {
        if (selectedLocation._id.length === 24 && /^[0-9a-f]{24}$/i.test(selectedLocation._id)) {
          registrationData.location = selectedLocation._id;
        } else {
          registrationData.customLocation = `${selectedLocation.name}, ${selectedLocation.region}`;
        }
      } else {
        registrationData.customLocation = formData.location;
      }

      // Explicitly set the role and user type based on selection
      registrationData.userType = userType;
      registrationData.role = userType;
      registrationData.roleName = userType;
      
      // Add role-specific data based on user selection
      if (userType === 'jobSeeker') {
        registrationData.skills = [formData.jobType];
        if (formData.jobTypeId) {
          // If we have the category ID, include it directly
          registrationData.categoryId = formData.jobTypeId;
        }
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
      } else if (userType === 'talent') {
        if (talentType === 'trainer') {
          registrationData.organization = formData.fullName;
          registrationData.specialization = [formData.jobType];
          if (formData.jobTypeId) {
            registrationData.categoryId = formData.jobTypeId;
          }
        } else {
          registrationData.interests = [formData.jobType];
          if (formData.jobTypeId) {
            registrationData.categoryId = formData.jobTypeId;
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
          
          if (directResponse.status >= 200 && directResponse.status < 300) {
            // Success case
            localStorage.setItem('pendingVerificationEmail', formData.email);
            
            // Store job type and basic registration data for fallback during onboarding
            try {
              const storageData = {
                jobType: formData.jobType,
                jobTypeId: formData.jobTypeId,
                userType: userType,
                talentType: talentType
              };
              
              // Add employer-specific data if applicable
              if (userType === 'employer') {
                storageData.companySize = formData.companySize;
                storageData.companyName = formData.fullName;
                storageData.industry = formData.jobType;
              }
              
              localStorage.setItem('registrationData', JSON.stringify(storageData));
              
              // Also store in sessionStorage as a backup
              sessionStorage.setItem('registrationData', JSON.stringify(storageData));
              
              console.log('Stored registration data in storage with jobType:', formData.jobType);
              console.log('Stored categoryId:', formData.jobTypeId);
              if (userType === 'employer') {
                console.log('Stored employer data - companySize:', formData.companySize);
                console.log('Stored employer data - companyName:', formData.fullName);
                console.log('Stored employer data - industry:', formData.jobType);
              }
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
          } else {
            // Handle specific status codes
            if (directResponse.status === 500) {
              console.error('Server error details:', directResponse.data);
              throw new Error(`Server error: ${directResponse.data?.message || 'Unknown server error'}`);
            } else if (directResponse.status === 400) {
              throw new Error(`Bad request: ${directResponse.data?.message || 'Invalid data provided'}`);
            } else if (directResponse.status === 409) {
              throw new Error(`Conflict: ${directResponse.data?.message || 'Email may already be in use'}`);
            } else {
              throw new Error(`Error (${directResponse.status}): ${directResponse.data?.message || 'Unknown error'}`);
            }
          }
        } catch (directError) {
          console.error('Direct registration attempt failed:', directError);
          console.error('Error details:', directError.response?.data || directError.message);
          
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
      
      // Extract error message from response if available
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        // Handle specific error cases
        if (error.response.status === 500) {
          console.error('Server error response data:', error.response.data);
          
          if (error.response.data?.message?.includes('password')) {
            errorMessage = 'The server requires a password for registration. Please contact the administrator.';
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          } else {
            errorMessage = 'A server error occurred. The system may not be properly configured. Please contact support.';
          }
        } else if (error.response.status === 409) {
          errorMessage = 'This email is already registered. Please use a different email or try to login.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
                    placeholder={userType === 'employer' ? 'Company Name' : 'Full Name'}
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <div className="relative">
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  {userType === 'employer' ? (
                    <input
                      type="text"
                      name="jobType"
                      placeholder="Company Type"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
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
                  ) : (
                    <div className="relative">
                      <select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">
                          {loadingCategories ? 'Loading job types...' : 'Select Job Type'}
                        </option>
                        {jobCategories.length > 0 ? (
                          jobCategories.map(category => (
                            <option key={category._id} value={category.name} data-id={category._id}>
                              {category.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="Finance">Finance</option>
                            <option value="Retail">Retail</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Construction">Construction</option>
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
                        className="w-full p-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Company Size</option>
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