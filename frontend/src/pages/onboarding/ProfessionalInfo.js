import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
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

const ProfessionalInfo = () => {
  const navigate = useNavigate();
  const { api, updateOnboardingStatus, checkOnboardingStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    education: {
      degree: '',
      field: '',
      institution: '',
      graduationYear: '',
      gpa: ''
    },
    experience: {
      currentRole: '',
      yearsOfExperience: '',
      company: '',
      industry: ''
    },
    resume: null,
    resumeUrl: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const fetchData = async () => {
      if (isFetching || loading) return;

      try {
        isFetching = true;
        setLoading(true);

        // Get the onboarding status
        const statusResponse = await checkOnboardingStatus(true);
        
        if (!isMounted) return;

        if (statusResponse?.sections?.professionalInfo?.data) {
          const existingData = statusResponse.sections.professionalInfo.data;
          setFormData(prev => ({
            ...prev,
            education: {
              degree: existingData.education?.degree || '',
              field: existingData.education?.field || '',
              institution: existingData.education?.institution || '',
              graduationYear: existingData.education?.graduationYear || '',
              gpa: existingData.education?.gpa || ''
            },
            experience: {
              currentRole: existingData.experience?.currentRole || '',
              yearsOfExperience: existingData.experience?.yearsOfExperience || '',
              company: existingData.experience?.company || '',
              industry: existingData.experience?.industry || ''
            },
            resume: null,
            resumeUrl: existingData.resume || null
          }));
        }
      } catch (error) {
        console.error('Error fetching professional info:', error);
        if (isMounted) {
          toast.error(error.response?.data?.message || 'Failed to load professional information');
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
  }, [checkOnboardingStatus, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        resume: file,
        resumeUrl: URL.createObjectURL(file)
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (formData.resumeUrl && formData.resume instanceof File) {
        URL.revokeObjectURL(formData.resumeUrl);
      }
    };
  }, [formData.resumeUrl]);

  const validateForm = (data) => {
    const errors = {};

    // Education validation (all fields optional)
    if (data.education.degree.trim()) {
      // If degree is provided, validate it contains only letters and spaces
      if (!/^[a-zA-Z\s]+$/.test(data.education.degree.trim())) {
        errors.education = { degree: 'Degree should contain only letters and spaces' };
      }
    }

    if (data.education.field.trim()) {
      // If field is provided, validate it contains only letters and spaces
      if (!/^[a-zA-Z\s]+$/.test(data.education.field.trim())) {
        errors.education = { field: 'Field of study should contain only letters and spaces' };
      }
    }

    if (data.education.institution.trim()) {
      // If institution is provided, validate it contains only letters, numbers, spaces, and basic special characters
      if (!/^[a-zA-Z0-9\s\-_#.]+$/.test(data.education.institution.trim())) {
        errors.education = { institution: 'Institution name should contain only letters, numbers, spaces, and basic special characters' };
      }
    }

    if (data.education.graduationYear) {
      // If graduation year is provided, validate it's not in the future and not too far in the past
      const currentYear = new Date().getFullYear();
      const graduationYear = parseInt(data.education.graduationYear);
      if (graduationYear > currentYear) {
        errors.education = { graduationYear: 'Graduation year cannot be in the future' };
      }
      if (graduationYear < currentYear - 50) {
        errors.education = { graduationYear: 'Please enter a valid graduation year' };
      }
    }

    // Experience validation (required fields)
    if (!data.experience.currentRole.trim()) {
      errors.experience = { currentRole: 'Please enter your current role' };
    }

    // Validate current role contains only letters, numbers, spaces, and basic special characters
    if (!/^[a-zA-Z0-9\s\-_#.]+$/.test(data.experience.currentRole.trim())) {
      errors.experience = { currentRole: 'Current role should contain only letters, numbers, spaces, and basic special characters' };
    }

    if (!data.experience.company.trim()) {
      errors.experience = { company: 'Please enter your company name' };
    }

    // Validate company name contains only letters, numbers, spaces, and basic special characters
    if (!/^[a-zA-Z0-9\s\-_#.]+$/.test(data.experience.company.trim())) {
      errors.experience = { company: 'Company name should contain only letters, numbers, spaces, and basic special characters' };
    }

    if (!data.experience.yearsOfExperience) {
      errors.experience = { yearsOfExperience: 'Please enter your years of experience' };
    }

    // Validate years of experience is a reasonable number
    const years = parseInt(data.experience.yearsOfExperience);
    if (isNaN(years) || years < 0 || years > 50) {
      errors.experience = { yearsOfExperience: 'Please enter a valid number of years of experience (0-50)' };
    }

    if (!data.experience.industry.trim()) {
      errors.experience = { industry: 'Please enter your industry' };
    }

    // Validate industry contains only letters and spaces
    if (!/^[a-zA-Z\s]+$/.test(data.experience.industry.trim())) {
      errors.experience = { industry: 'Industry should contain only letters and spaces' };
    }

    // Resume validation if provided
    if (data.resume instanceof File) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(data.resume.type)) {
        errors.resume = { resume: 'Please upload a PDF or Word document' };
      }

      // Validate file size (max 10MB)
      if (data.resume.size > 10 * 1024 * 1024) {
        errors.resume = { resume: 'Resume size should be less than 10MB' };
      }
    }

    return errors;
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

      // Create FormData for file upload
      const formDataToSubmit = new FormData();
      
      // Prepare the data object
      const dataToSend = {
        experience: formData.experience,
        education: formData.education,
        resume: formData.resumeUrl // Include the existing resume URL if no new file is uploaded
      };

      // Append the data as a JSON string
      formDataToSubmit.append('data', JSON.stringify(dataToSend));

      // Add resume if exists and is a File
      if (formData.resume instanceof File) {
        formDataToSubmit.append('resume', formData.resume);
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
      const response = await onboardingApi.put('/users/onboarding/professional-info', formDataToSubmit);

      if (response.data.success) {
        toast.success('Professional information saved successfully');
        
        // Update local state with the response data
        setFormData(prev => ({
          ...prev,
          resumeUrl: response.data.data.professionalInfo?.data?.resume || prev.resumeUrl
        }));

        // Navigate to next step
        navigate('/onboarding/skills');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.message || 'Failed to save professional information');
      toast.error(error.response?.data?.message || 'Failed to save professional information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ScrollToTop />
      <OnboardingLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <h2 className="text-2xl font-bold mb-6">Professional Information</h2> */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Education Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Education (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    name="education.degree"
                    value={formData.education.degree}
                    onChange={handleChange}
                    placeholder="e.g., Bachelor's, Master's"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    name="education.field"
                    value={formData.education.field}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science, Business"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    name="education.institution"
                    value={formData.education.institution}
                    onChange={handleChange}
                    placeholder="e.g., University Name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    name="education.graduationYear"
                    value={formData.education.graduationYear}
                    onChange={handleChange}
                    placeholder="e.g., 2020"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="1900"
                    max={new Date().getFullYear() + 4}
                  />
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Experience (Required)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Role*
                  </label>
                  <input
                    type="text"
                    name="experience.currentRole"
                    value={formData.experience.currentRole}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineer"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                  {errors.experience?.currentRole && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience.currentRole}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company*
                  </label>
                  <input
                    type="text"
                    name="experience.company"
                    value={formData.experience.company}
                    onChange={handleChange}
                    placeholder="e.g., Acme Inc."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                  {errors.experience?.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience.company}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience*
                  </label>
                  <input
                    type="number"
                    name="experience.yearsOfExperience"
                    value={formData.experience.yearsOfExperience}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="0"
                    required
                  />
                  {errors.experience?.yearsOfExperience && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience.yearsOfExperience}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry*
                  </label>
                  <input
                    type="text"
                    name="experience.industry"
                    value={formData.experience.industry}
                    onChange={handleChange}
                    placeholder="e.g., Technology"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                  {errors.experience?.industry && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience.industry}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume (PDF)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 
                        focus:outline-none"
                    />
                  </div>
                  {formData.resumeUrl && (
                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Current resume: {formData.resume instanceof File ? formData.resume.name : 'Resume uploaded'}
                    </p>
                  )}
                  {errors.resume?.resume && (
                    <p className="mt-1 text-sm text-red-600">{errors.resume.resume}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-500">* Required fields</div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </OnboardingLayout>
    </>
  );
};

export default ProfessionalInfo;