// src/components/settings/PersonalSettings.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import '../css/Settings.css';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Modal } from '../ui/modal';

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const PersonalSettings = () => {
  const { user, updateUserSettings } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    customLocation: '',
    jobType: '',
    industry: '',
    companyName: '',
    companySize: '',
    specialization: '',
    organization: '',
    educationLevel: '',
    interests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [locations, setLocations] = useState([]);
  const [userRole, setUserRole] = useState('jobseeker');
  const [workingEndpoint, setWorkingEndpoint] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Determine user role
  useEffect(() => {
    const determineUserRole = () => {
      // Check various places where user role might be stored
      // First try explicit role properties
      if (user?.role) {
        const role = typeof user.role === 'string' 
          ? user.role.toLowerCase() 
          : (user.role.name ? user.role.name.toLowerCase() : '');
        
        if (role === 'employer') {
          setUserRole('employer');
          return;
        } else if (role === 'trainer') {
          setUserRole('trainer');
          return;
        } else if (role === 'trainee') {
          setUserRole('trainee');
          return;
        } else if (role === 'jobseeker' || role === 'job_seeker' || role === 'job-seeker') {
          setUserRole('jobseeker');
          return;
        }
      }
      
      // Then check userType
      if (user?.userType) {
        const type = user.userType.toLowerCase();
        if (type === 'employer') {
          setUserRole('employer');
          return;
        } else if (type === 'trainer') {
          setUserRole('trainer');
          return;
        } else if (type === 'trainee') {
          setUserRole('trainee');
          return;
        } else if (type === 'jobseeker' || type === 'job_seeker' || type === 'job-seeker') {
          setUserRole('jobseeker');
          return;
        }
      }
      
      // Check roleName if available
      if (user?.roleName) {
        const roleName = user.roleName.toLowerCase();
        if (roleName === 'employer') {
          setUserRole('employer');
          return;
        } else if (roleName === 'trainer') {
          setUserRole('trainer');
          return;
        } else if (roleName === 'trainee') {
          setUserRole('trainee');
          return;
        } else if (roleName === 'jobseeker' || roleName === 'job_seeker' || roleName === 'job-seeker') {
          setUserRole('jobseeker');
          return;
        }
      }
      
      // Check localStorage
      try {
        const storageStr = localStorage.getItem('registrationData');
        if (storageStr) {
          const storageData = JSON.parse(storageStr);
          const storedType = storageData.userType || storageData.talentType || '';
          if (storedType === 'employer') {
            setUserRole('employer');
            return;
          } else if (storedType === 'trainer') {
            setUserRole('trainer');
            return;
          } else if (storedType === 'trainee') {
            setUserRole('trainee');
            return;
          } else if (storedType === 'jobseeker' || storedType === 'job_seeker' || storedType === 'job-seeker') {
            setUserRole('jobseeker');
            return;
          }
        }
      } catch (e) {
        console.error('Error checking storage for role:', e);
      }
      
      // Default to jobseeker if nothing else found
      setUserRole('jobseeker');
    };
    
    determineUserRole();
    console.log('Determined user role:', userRole);
  }, [user]);

  // Effect for employer company name set for when the name isn't set
  useEffect(() => {
    // If the user is an employer and no company name is set, use their name
    if (userRole === 'employer' && formData.fullName && !formData.companyName) {
      setFormData(prev => ({
        ...prev,
        companyName: prev.fullName
      }));
    }
  }, [userRole, formData.fullName, formData.companyName]);

  // Check for location data in localStorage on component mount and initialize it
  useEffect(() => {
    // Check localStorage for location data and set it immediately
    const checkInitialLocation = () => {
      try {
        // First check userData
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          if (userData.location) {
            console.log('Found initial location in userData:', userData.location);
            setSelectedLocation(userData.location);
            return;
          }
        }

        // Then check registrationData as fallback
        const registrationData = localStorage.getItem('registrationData');
        if (registrationData) {
          const parsedData = JSON.parse(registrationData);
          if (parsedData.location) {
            console.log('Found initial location in registrationData:', parsedData.location);
            setSelectedLocation(parsedData.location);
            return;
          }
        }

        // Check role-specific data
        const roleType = localStorage.getItem('userRole') || 'jobseeker';
        let roleStorageKey = '';
        
        if (roleType === 'employer') roleStorageKey = 'employerData';
        else if (roleType === 'trainer') roleStorageKey = 'trainerData';
        else if (roleType === 'trainee') roleStorageKey = 'traineeData';
        else roleStorageKey = 'jobseekerData';
        
        const roleData = localStorage.getItem(roleStorageKey);
        if (roleData) {
          const parsedRoleData = JSON.parse(roleData);
          if (parsedRoleData.location) {
            console.log(`Found initial location in ${roleStorageKey}:`, parsedRoleData.location);
            setSelectedLocation(parsedRoleData.location);
          }
        }
      } catch (e) {
        console.error('Error checking initial location:', e);
      }
    };

    checkInitialLocation();
  }, []);

  // Fetch user data and locations from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch locations
        let locationsData = [];
        try {
          const locationsResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/locations`);
          if (locationsResponse.data.success) {
            locationsData = locationsResponse.data.data || [];
          }
        } catch (error) {
          console.error('Error fetching locations:', error);
          // Set default locations if API failed
          locationsData = [
            { _id: 'accra', name: 'Accra', region: 'Greater Accra' },
            { _id: 'kumasi', name: 'Kumasi', region: 'Ashanti' },
            { _id: 'tamale', name: 'Tamale', region: 'Northern' },
            { _id: 'takoradi', name: 'Takoradi', region: 'Western' }
          ];
        }
        setLocations(locationsData);
        console.log('Fetched locations:', locationsData);

        // Fetch user data and also discover which endpoints work
        let userData = null;
        let roleSpecificData = null;
        
        // Check localStorage for any stored user data first - for faster loading
        try {
          const storedUserData = localStorage.getItem('userData');
          if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            
            // Apply location from localStorage if available
            if (parsedUserData.location) {
              console.log('Found location in localStorage:', parsedUserData.location);
              setSelectedLocation(parsedUserData.location);
            }
          }
        } catch (e) {
          console.error('Error reading localStorage userData:', e);
        }
        
        // Try different endpoints to get user data
        const endpoints = ['/users/me', '/auth/me', '/dashboard/me', '/profile', '/api/users/me'];
        
        // First, determine which GET endpoints work
        for (const endpoint of endpoints) {
          try {
            console.log(`Checking if endpoint works: GET ${endpoint}`);
            const userResponse = await axios.get(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}${endpoint}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (userResponse.status === 200) {
              console.log(`Found working endpoint: ${endpoint}`);
              // Store the working endpoint for later use
              setWorkingEndpoint(endpoint);
              
              // Extract user data
              if (userResponse.data) {
                userData = userResponse.data.data || userResponse.data.user || userResponse.data;
                console.log(`Successfully fetched user data from ${endpoint}:`, userData);
                
                // Extract role-specific data based on user type
                if (userRole === 'employer') {
                  if (userData.company) roleSpecificData = userData.company;
                  else if (userData.companyProfile) roleSpecificData = userData.companyProfile;
                  else if (userData.employerData) roleSpecificData = userData.employerData;
                  else if (userData.employer) roleSpecificData = userData.employer;
                  else if (userData.employerProfile) roleSpecificData = userData.employerProfile;
                } else if (userRole === 'jobseeker') {
                  if (userData.jobSeekerProfile) roleSpecificData = userData.jobSeekerProfile;
                  else if (userData.jobseekerData) roleSpecificData = userData.jobseekerData;
                  else if (userData.jobSeeker) roleSpecificData = userData.jobSeeker;
                } else if (userRole === 'trainer') {
                  if (userData.trainerProfile) roleSpecificData = userData.trainerProfile;
                  else if (userData.trainerData) roleSpecificData = userData.trainerData;
                  else if (userData.trainer) roleSpecificData = userData.trainer;
                } else if (userRole === 'trainee') {
                  if (userData.traineeProfile) roleSpecificData = userData.traineeProfile;
                  else if (userData.traineeData) roleSpecificData = userData.traineeData;
                  else if (userData.trainee) roleSpecificData = userData.trainee;
                }
                
                console.log(`Role-specific data:`, roleSpecificData);
                break;
              }
            }
          } catch (err) {
            console.log(`Endpoint ${endpoint} not working:`, err.message);
          }
        }
        
        // Try to also fetch from local storage
        try {
          const storedData = localStorage.getItem('registrationData') || sessionStorage.getItem('registrationData');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData) {
              // Apply role-specific data from local storage based on user type
              if (userRole === 'employer' && !roleSpecificData) {
                roleSpecificData = {
                  companyName: parsedData.companyName,
                  industry: parsedData.industry,
                  companySize: parsedData.companySize
                };
              } else if (userRole === 'trainer' && !roleSpecificData) {
                roleSpecificData = {
                  specialization: parsedData.specialization,
                  organization: parsedData.organization
                };
              } else if (userRole === 'trainee' && !roleSpecificData) {
                roleSpecificData = {
                  interests: parsedData.interests
                };
              } else if (userRole === 'jobseeker' && !roleSpecificData) {
                roleSpecificData = {
                  jobType: parsedData.jobType || parsedData.profession
                };
              }
              
              // Check for location data in registration
              if (parsedData.location && (!userData || !userData.location)) {
                if (!userData) userData = {};
                userData.location = parsedData.location;
                console.log('Found location in registration data:', parsedData.location);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing stored registration data:', e);
        }
        
        // Check role-specific storage in localStorage
        try {
          let roleData = null;
          
          if (userRole === 'employer') {
            roleData = JSON.parse(localStorage.getItem('employerData') || '{}');
          } else if (userRole === 'trainer') {
            roleData = JSON.parse(localStorage.getItem('trainerData') || '{}');
          } else if (userRole === 'trainee') {
            roleData = JSON.parse(localStorage.getItem('traineeData') || '{}');
          } else if (userRole === 'jobseeker') {
            roleData = JSON.parse(localStorage.getItem('jobseekerData') || '{}');
          }
          
          if (roleData && Object.keys(roleData).length > 0) {
            console.log(`Found role-specific data in localStorage for ${userRole}:`, roleData);
            if (!roleSpecificData) roleSpecificData = {};
            roleSpecificData = { ...roleSpecificData, ...roleData };
          }
        } catch (e) {
          console.error('Error reading role-specific localStorage data:', e);
        }
        
        console.log('User data:', userData);
        console.log('Role-specific data:', roleSpecificData);
        console.log('Working endpoint:', workingEndpoint);

        if (userData || roleSpecificData) {
          // Parse complex data structures that might be stored as strings
          let parsedCompanySize = '';
          if (userData && typeof userData.companySize === 'string' && userData.companySize.startsWith('{')) {
            try {
              const parsed = JSON.parse(userData.companySize);
              parsedCompanySize = parsed.value || parsed.name || '';
            } catch (e) {
              parsedCompanySize = userData.companySize;
            }
          } else if (userData) {
            parsedCompanySize = userData.companySize || '';
          }
          
          // Combine user data with role-specific data
          const mergedData = {
            ...(userData || {}),
            ...(roleSpecificData || {})
          };
          
          // Determine location value - prioritize explicitly selected location
          const locationValue = selectedLocation || 
                               mergedData.location || 
                               mergedData.locationId || 
                               '';
          
          console.log('Resolved location value:', locationValue);
          
          // Set form data based on user data, handling different field names
          const updatedFormData = {
            fullName: mergedData.name || mergedData.fullName || '',
            email: mergedData.email || '',
            phone: mergedData.phone || mergedData.phoneNumber || '',
            location: locationValue,
            customLocation: mergedData.customLocation || '',
            
            // Fields for different roles
            // Job Seeker
            jobType: mergedData.jobType || mergedData.profession || '',
            
            // Employer
            industry: mergedData.industry || '', 
            companyName: mergedData.companyName || '',
            companySize: mergedData.companySize || parsedCompanySize || '',
            
            // Trainer
            specialization: (() => {
              // Handle different possible formats of specialization data
              if (Array.isArray(mergedData.specialization)) {
                return mergedData.specialization.join(', ');
              } else if (typeof mergedData.specialization === 'string') {
                return mergedData.specialization;
              } else if (Array.isArray(mergedData.specializations)) {
                return mergedData.specializations.join(', ');
              } else if (typeof mergedData.specializations === 'string') {
                return mergedData.specializations;
              }
              return '';
            })(),
            organization: mergedData.organization || '',
            
            // Trainee
            interests: (() => {
              // Handle different possible formats of interests data
              if (Array.isArray(mergedData.interests)) {
                return mergedData.interests.join(', ');
              } else if (typeof mergedData.interests === 'string') {
                return mergedData.interests;
              }
              return '';
            })()
          };
          
          console.log('Setting form data:', updatedFormData);
          setFormData(updatedFormData);
          
          // If the location is set but not one of the predefined locations, set it as custom
          if (updatedFormData.location && locations.length > 0 && !locations.some(loc => loc._id === updatedFormData.location)) {
            if (updatedFormData.location !== 'custom') {
              console.log('Setting custom location:', updatedFormData.location);
              setFormData(prev => ({ 
                ...prev, 
                customLocation: updatedFormData.location,
                location: 'custom' 
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load user data. Please try again later.');
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLocation, userRole]);

  // Form input change handler with improved location handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // For location, save to state and localStorage immediately
    if (name === 'location') {
      try {
        // If switching to custom, don't overwrite the selectedLocation yet
        if (value !== 'custom') {
          setSelectedLocation(value);
        }
        
        // Always save to userData for persistence
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.location = value;
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('Saved location to localStorage:', value);
        
        // Also save to role-specific storage
        const roleStorageKey = userRole === 'employer' ? 'employerData' :
                             userRole === 'trainer' ? 'trainerData' :
                             userRole === 'trainee' ? 'traineeData' : 'jobseekerData';
        
        const roleData = JSON.parse(localStorage.getItem(roleStorageKey) || '{}');
        roleData.location = value;
        localStorage.setItem(roleStorageKey, JSON.stringify(roleData));
      } catch (e) {
        console.error('Error saving location to localStorage:', e);
      }
    }
    
    // For customLocation, update selectedLocation if location is custom
    if (name === 'customLocation' && formData.location === 'custom') {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.customLocation = value;
        localStorage.setItem('userData', JSON.stringify(userData));
      } catch (e) {
        console.error('Error saving custom location to localStorage:', e);
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) newErrors.fullName = 'Name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    // Role-specific validation
    if (userRole === 'employer') {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (!formData.industry) newErrors.industry = 'Industry is required';
    } else if (userRole === 'jobseeker') {
      if (!formData.jobType) newErrors.jobType = 'Job type is required';
    } else if (userRole === 'trainer') {
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      if (!formData.organization) newErrors.organization = 'Organization is required';
    } else if (userRole === 'trainee') {
      if (!formData.interests) newErrors.interests = 'Interests are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Find location name by ID for display purposes
  const getLocationNameById = (locationId) => {
    if (!locationId || locationId === 'custom') return 'Custom Location';
    const location = locations.find(loc => loc._id === locationId);
    return location ? `${location.name}, ${location.region}` : locationId;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Capture location value for local storage and API
      const locationValue = formData.location === 'custom' ? formData.customLocation : formData.location;
      
      // Prepare data to send to the API
      const dataToSend = {
        name: formData.fullName,
        fullName: formData.fullName, // Include both name formats for compatibility
        phone: formData.phone,
        phoneNumber: formData.phone, // Include both phone formats for compatibility
        location: locationValue,
        locationName: getLocationNameById(formData.location), // Include the location name for display purposes
        userType: userRole,
        role: userRole
      };
      
      // Add role-specific fields
      if (userRole === 'employer') {
        dataToSend.companyName = formData.companyName;
        dataToSend.industry = formData.industry;
        dataToSend.companySize = formData.companySize;
        
        // Include nested profile structure for compatibility
        dataToSend.employerProfile = {
          companyName: formData.companyName,
          industry: formData.industry,
          companySize: formData.companySize
        };
      } else if (userRole === 'jobseeker') {
        dataToSend.jobType = formData.jobType;
        
        // Include nested profile structure for compatibility
        dataToSend.jobSeekerProfile = {
          jobType: formData.jobType
        };
      } else if (userRole === 'trainer') {
        dataToSend.specialization = formData.specialization;
        dataToSend.organization = formData.organization;
        
        // Format specialization as array if it's a comma-separated string
        let specializationArray = [];
        
        // Check if specialization is already an array
        if (Array.isArray(formData.specialization)) {
          specializationArray = formData.specialization;
          console.log('Specialization is already an array:', specializationArray);
        } else if (typeof formData.specialization === 'string') {
          // Only call split if it's a string
          specializationArray = formData.specialization.split(',').map(item => item.trim());
          console.log('Converted specialization string to array:', specializationArray);
        } else {
          // Handle other cases (like undefined or null)
          specializationArray = [String(formData.specialization || '')];
          console.log('Created specialization array from non-string value:', specializationArray);
        }
        
        // Include nested profile structure for compatibility
        dataToSend.trainerProfile = {
          specialization: specializationArray,
          organization: formData.organization
        };
      } else if (userRole === 'trainee') {
        dataToSend.interests = formData.interests;
        
        // Format interests as array if it's a comma-separated string
        let interestsArray = [];
        
        // Check if interests is already an array
        if (Array.isArray(formData.interests)) {
          interestsArray = formData.interests;
          console.log('Interests is already an array:', interestsArray);
        } else if (typeof formData.interests === 'string') {
          // Only call split if it's a string
          interestsArray = formData.interests.split(',').map(item => item.trim());
          console.log('Converted interests string to array:', interestsArray);
        } else {
          // Handle other cases (like undefined or null)
          interestsArray = [String(formData.interests || '')];
          console.log('Created interests array from non-string value:', interestsArray);
        }
        
        // Include nested profile structure for compatibility
        dataToSend.traineeProfile = {
          interests: interestsArray
        };
      }
      
      console.log('Data to send:', dataToSend);
      
      // First try using AuthContext's updateUserSettings if available
      let updateSuccess = false;
      
      if (updateUserSettings) {
        try {
          console.log('Attempting to update using AuthContext updateUserSettings');
          const result = await updateUserSettings(dataToSend);
          console.log('Update result:', result);
          
          if (result && result.success) {
            console.log('Successfully updated profile using AuthContext');
            updateSuccess = true;
            toast.success('Personal information updated successfully');
          }
        } catch (authError) {
          console.error('AuthContext update failed:', authError);
        }
      }
      
      // If AuthContext update failed, try direct API calls
      if (!updateSuccess) {
        // Use baseURL from environment or default
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        
        // Create axios instance for making requests
        const axiosInstance = axios.create({
          baseURL,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        // First attempt using the endpoint that worked for GET
        if (workingEndpoint) {
          try {
            // Convert GET endpoint to its PUT equivalent
            let updateEndpoint = workingEndpoint;
            
            // Attempt PUT request first
            console.log(`Attempting PUT to endpoint that worked for GET: ${updateEndpoint}`);
            const response = await axiosInstance.put(updateEndpoint, dataToSend);
            
            console.log('PUT response:', response);
            if (response.status >= 200 && response.status < 300) {
              toast.success('Personal information updated successfully');
              updateSuccess = true;
            }
          } catch (err) {
            console.error(`Error updating via working endpoint ${workingEndpoint}:`, err);
          }
        }
        
        // If still not successful, try direct path and various API paths
        if (!updateSuccess) {
          // Try different backend server paths
          const serverPaths = [
            '', // No prefix
            '/api', // Common API prefix
            '/v1', // Version prefix
            '/v1/api'
          ];
          
          // Try each server path with common user endpoints
          for (const serverPath of serverPaths) {
            if (updateSuccess) break; // Stop if we already succeeded
            
            const endpointPaths = [
              '/users/profile', 
              '/users/me', 
              '/users',
              '/profile',
              '/auth/profile',
              '/dashboard/profile'
            ];
            
            for (const endpointPath of endpointPaths) {
              try {
                const fullUrl = `${baseURL}${serverPath}${endpointPath}`;
                console.log(`Trying direct PUT to ${fullUrl}`, dataToSend);
                
                const response = await axios({
                  method: 'put',
                  url: fullUrl,
                  data: dataToSend,
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                console.log(`Response from ${fullUrl}:`, response);
                
                if (response.status >= 200 && response.status < 300) {
                  console.log('Update successful!');
                  toast.success('Personal information updated successfully');
                  updateSuccess = true;
                  break;
                }
              } catch (err) {
                console.log(`Error with ${serverPath}${endpointPath}:`, err.message);
              }
            }
          }
        }
        
        // If still not successful, try POST as a last resort
        if (!updateSuccess) {
          try {
            const fullUrl = `${baseURL}/users/profile`;
            console.log('Attempting POST as last resort to', fullUrl);
            
            const response = await axios({
              method: 'post',
              url: fullUrl,
              data: dataToSend,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.status >= 200 && response.status < 300) {
              toast.success('Personal information updated successfully');
              updateSuccess = true;
            }
          } catch (err) {
            console.error('POST fallback also failed:', err.message);
          }
        }
      }
      
      // Store data locally regardless of API success
      // This ensures location and other data persists between page loads
      console.log('Storing data locally for persistence');
      
      // Store user data in localStorage
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUserData = { 
        ...storedUserData, 
        ...dataToSend,
        location: locationValue, // Ensure location is stored correctly
        locationName: getLocationNameById(formData.location),
        userRole: userRole // Store the user role explicitly
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      console.log('Stored user data in localStorage:', updatedUserData);
      
      // Store role-specific data in localStorage
      if (userRole === 'employer') {
        const storedEmployerData = JSON.parse(localStorage.getItem('employerData') || '{}');
        const updatedEmployerData = {
          ...storedEmployerData,
          companyName: formData.companyName,
          industry: formData.industry,
          companySize: formData.companySize
        };
        localStorage.setItem('employerData', JSON.stringify(updatedEmployerData));
      } else if (userRole === 'trainer') {
        const storedTrainerData = JSON.parse(localStorage.getItem('trainerData') || '{}');
        const updatedTrainerData = {
          ...storedTrainerData,
          specialization: formData.specialization,
          organization: formData.organization
        };
        localStorage.setItem('trainerData', JSON.stringify(updatedTrainerData));
      } else if (userRole === 'trainee') {
        const storedTraineeData = JSON.parse(localStorage.getItem('traineeData') || '{}');
        const updatedTraineeData = {
          ...storedTraineeData,
          interests: formData.interests
        };
        localStorage.setItem('traineeData', JSON.stringify(updatedTraineeData));
      } else if (userRole === 'jobseeker') {
        const storedJobseekerData = JSON.parse(localStorage.getItem('jobseekerData') || '{}');
        const updatedJobseekerData = {
          ...storedJobseekerData,
          jobType: formData.jobType
        };
        localStorage.setItem('jobseekerData', JSON.stringify(updatedJobseekerData));
      }
      
      if (!updateSuccess) {
        toast.info('Profile updated locally. Changes will be synchronized with the server when available.');
      }
      
      // Reset the form to show the updated values
      setFormData(prev => ({
        ...prev,
        fullName: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        customLocation: formData.location === 'custom' ? formData.customLocation : '',
        // Update role-specific fields
        jobType: userRole === 'jobseeker' ? formData.jobType : prev.jobType,
        industry: userRole === 'employer' ? formData.industry : prev.industry,
        companyName: userRole === 'employer' ? formData.companyName : prev.companyName,
        companySize: userRole === 'employer' ? formData.companySize : prev.companySize,
        specialization: userRole === 'trainer' ? formData.specialization : prev.specialization,
        organization: userRole === 'trainer' ? formData.organization : prev.organization,
        interests: userRole === 'trainee' ? formData.interests : prev.interests
      }));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Get a more specific error message
      let errorMessage = 'Failed to update personal information';
      
      if (error.name === 'TypeError') {
        if (error.message.includes('split is not a function')) {
          errorMessage = 'Error processing field values. Please save your changes again.';
        } else {
          errorMessage = `Type error: ${error.message}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Set error state and show toast
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role checker helper functions
  const isEmployer = () => userRole === 'employer';
  const isJobSeeker = () => userRole === 'jobseeker';
  const isTrainer = () => userRole === 'trainer';
  const isTrainee = () => userRole === 'trainee';

  return (
    <div className="personal-settings">
      <div className="settings-section">
        <h3 className="settings-section-title">
          {isEmployer() ? 'Company Information' : 'Personal Information'}
        </h3>
        
        {/* Display current account type */}
        <div className="account-type-info mb-4 p-3 bg-blue-50 border border-blue-100 rounded">
          <p><strong>Account Type:</strong> {isEmployer() ? 'Employer Account' : 
                                          isJobSeeker() ? 'Job Seeker Account' : 
                                          isTrainer() ? 'Trainer Account' : 
                                          isTrainee() ? 'Trainee Account' : 'User Account'}</p>
          {formData.location && (
            <p className="text-sm mt-1">
              <strong>Location:</strong> {formData.location === 'custom' ? formData.customLocation : getLocationNameById(formData.location)}
            </p>
          )}
        </div>
        
        {loading ? (
          <div className="loading-spinner flex justify-center py-8">
            <div className="spinner animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Common Fields - For all users */}
              <div className="form-group">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  {isEmployer() ? 'Company Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {errors.fullName && <span className="error text-red-600 text-xs mt-1">{errors.fullName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {errors.phone && <span className="error text-red-600 text-xs mt-1">{errors.phone}</span>}
              </div>
              
              {/* Location Field */}
              <div className="form-group">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location._id} value={location._id}>
                      {location.name}, {location.region}
                    </option>
                  ))}
                  <option value="custom">Other (Specify)</option>
                </select>
                {formData.location ? (
                  <p className="text-xs mt-1 text-green-600 font-medium">
                    Current location: {formData.location === 'custom' ? formData.customLocation : getLocationNameById(formData.location)}
                  </p>
                ) : (
                  <p className="text-xs mt-1 text-gray-500">Please select your location</p>
                )}
              </div>
              
              {/* Custom Location - Only shown if needed */}
              {formData.location === 'custom' && (
                <div className="form-group">
                  <label htmlFor="customLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Location
                  </label>
                  <input
                    type="text"
                    id="customLocation"
                    name="customLocation"
                    value={formData.customLocation}
                    onChange={handleInputChange}
                    placeholder="Enter your location"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    required={formData.location === 'custom'}
                  />
                </div>
              )}

              {/* Job Seeker Specific Fields */}
              {isJobSeeker() && (
                <div className="form-group">
                  <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type / Field
                  </label>
                  <input
                    type="text"
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    placeholder="Enter your job type or professional field"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    required={isJobSeeker()}
                  />
                  {errors.jobType && <span className="error text-red-600 text-xs mt-1">{errors.jobType}</span>}
                </div>
              )}

              {/* Trainer Specific Fields */}
              {isTrainer() && (
                <>
                  <div className="form-group">
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization
                    </label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={formData.specialization || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your specialization areas (comma separated)"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required={isTrainer()}
                    />
                    {errors.specialization && <span className="error text-red-600 text-xs mt-1">{errors.specialization}</span>}
                    <p className="text-xs text-gray-500 mt-1">Examples: Web Development, Data Science, Project Management</p>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="Enter your organization or institution"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required={isTrainer()}
                    />
                    {errors.organization && <span className="error text-red-600 text-xs mt-1">{errors.organization}</span>}
                  </div>
                </>
              )}

              {/* Trainee Specific Fields */}
              {isTrainee() && (
                <div className="form-group col-span-1 md:col-span-2">
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                    Training Interests
                  </label>
                  <textarea
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="Enter your training interests (comma separated)"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    required={isTrainee()}
                  />
                  {errors.interests && <span className="error text-red-600 text-xs mt-1">{errors.interests}</span>}
                  <p className="text-xs text-gray-500 mt-1">Examples: Web Development, Project Management, Data Analysis, etc.</p>
                </div>
              )}

              {/* Employer Specific Fields */}
              {isEmployer() && (
                <>
                  <div className="form-group">
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="E.g., Technology, Healthcare, Construction, Retail"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required={isEmployer()}
                    />
                    {errors.industry && <span className="error text-red-600 text-xs mt-1">{errors.industry}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Size
                    </label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required={isEmployer()}
                    >
                      <option value="">Select Company Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1001+">1001+ employees</option>
                    </select>
                    {errors.companySize && <span className="error text-red-600 text-xs mt-1">{errors.companySize}</span>}
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-actions mt-8 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PersonalSettings;