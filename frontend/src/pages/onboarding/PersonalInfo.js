import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import { toast } from 'react-toastify';
import axios from 'axios';

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { api, updateOnboardingStatus, checkOnboardingStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    dateOfBirth: '',
    profilePicture: null,
    profilePictureUrl: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const fetchData = async () => {
      if (isFetching || loading) return; // Prevent multiple requests
      
      try {
        isFetching = true;
        setLoading(true);
        
        // Use a new axios instance to avoid header issues
        const onboardingApi = axios.create({
          baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Use the correct endpoint
        const response = await onboardingApi.get('/users/onboarding-status');
        
        if (!isMounted) return; // Don't update state if component unmounted
        
        if (response.data.success && response.data.data.personalInfo) {
          const existingData = response.data.data.personalInfo.data || response.data.data.personalInfo;
          setFormData({
            phone: existingData.phone || '',
            address: {
              street: existingData.address?.street || '',
              city: existingData.address?.city || '',
              state: existingData.address?.state || '',
              zipCode: existingData.address?.zipCode || ''
            },
            dateOfBirth: existingData.dateOfBirth || '',
            profilePicture: null,
            profilePictureUrl: existingData.profilePicture || null
          });
        }
      } catch (error) {
        console.error('Error fetching personal info:', error);
        if (isMounted) {
          setError(error.response?.data?.message || 'Failed to load personal information');
          toast.error(error.response?.data?.message || 'Failed to load personal information');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          isFetching = false;
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array since we only want to fetch once on mount

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value || ''
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value || ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, and PNG files are allowed');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profilePicture: file,
        profilePictureUrl: URL.createObjectURL(file)
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (formData.profilePictureUrl && formData.profilePicture instanceof File) {
        URL.revokeObjectURL(formData.profilePictureUrl);
      }
    };
  }, [formData.profilePictureUrl]);

  const validateForm = (data) => {
    console.log('Validating form data:', JSON.stringify(data, null, 2));
    
    const validationErrors = {};

    // Validate phone number (10 digits starting with 0)
    const phoneStr = data.phone?.trim().replace(/\s+/g, '') || '';
    if (!phoneStr || !/^0\d{9}$/.test(phoneStr)) {
      validationErrors.phone = 'Please enter a valid Ghana phone number (10 digits starting with 0)';
    }

    // Validate address
    if (!data.address || typeof data.address !== 'object') {
      validationErrors.address = 'Address information is required';
    } else {
      const requiredAddressFields = ['street', 'city', 'state', 'zipCode'];
      const missingFields = requiredAddressFields.filter(field => 
        !data.address[field]?.trim()
      );

      if (missingFields.length > 0) {
        validationErrors.address = `Please complete all required address fields: ${missingFields.join(', ')}`;
      }
    }

    // Validate date of birth if provided
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (isNaN(dob.getTime()) || age < 18 || age > 100) {
        validationErrors.dateOfBirth = 'Please enter a valid date of birth (must be 18 or older)';
      }
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrors({});

    try {
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Form data:', formData);

      // Validate form data
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // Create FormData for file upload
      const formDataToSubmit = new FormData();
      
      // Prepare the data object
      const dataToSend = {
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth.split('T')[0], // Ensure date is in YYYY-MM-DD format
        address: formData.address
      };

      // Append the data as a JSON string
      formDataToSubmit.append('data', JSON.stringify(dataToSend));

      // Add profile picture if exists and is a File
      if (formData.profilePicture instanceof File) {
        console.log('Adding profile picture to FormData:', formData.profilePicture);
        formDataToSubmit.append('profilePicture', formData.profilePicture);
      }

      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (let [key, value] of formDataToSubmit.entries()) {
        console.log(key, ':', typeof value === 'string' ? value : 'File');
      }

      // Create a new axios instance with the correct headers
      const onboardingApi = axios.create({
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Submit form data
      console.log('Submitting form data to API...');
      const response = await onboardingApi.put('/users/onboarding/personal-info', formDataToSubmit);

      console.log('API response:', response.data);

      if (response.data.success) {
        console.log('Form submitted successfully');
        toast.success('Personal information saved successfully');

        // Update local state with the response data
        setFormData(prev => ({
          ...prev,
          profilePictureUrl: response.data.data.personalInfo?.data?.profilePicture || prev.profilePictureUrl
        }));

        // Navigate to next step
        navigate('/onboarding/professional-info');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.message || 'Failed to save personal information');
      toast.error(error.response?.data?.message || 'Failed to save personal information');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the date input handler
  const handleDateChange = (e) => {
    const date = e.target.value;
    if (date) {
      // Ensure the date is in YYYY-MM-DD format
      const formattedDate = new Date(date).toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        dateOfBirth: formattedDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dateOfBirth: ''
      }));
    }
  };

  return (
    <OnboardingLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {formData.profilePictureUrl ? (
                <img
                  src={formData.profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth || ''}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Address</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
};

export default PersonalInfo; 