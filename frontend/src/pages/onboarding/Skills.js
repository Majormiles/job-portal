import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import OnboardingLayout from './OnboardingLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const ResumeUpload = () => {
  const navigate = useNavigate();
  const { updateOnboardingStatus, api, checkOnboardingStatus, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isTrainee, setIsTrainee] = useState(false);
  const [isTrainer, setIsTrainer] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [shouldSkipResume, setShouldSkipResume] = useState(false);
  
  // Initial setup - check user role and fetch existing data
  useEffect(() => {
    const setup = async () => {
      await checkUserRole();
      await fetchExistingData();
    };
    setup();
  }, []);

  // Watch for changes in shouldSkipResume state and trigger complete step when it becomes true
  useEffect(() => {
    if (shouldSkipResume && !loading) {
      console.log('Should skip resume is true, completing step for skipped roles');
      completeStepForSkippedRoles();
    }
  }, [shouldSkipResume, loading]);

  // Check user role to determine if resume upload is needed
  const checkUserRole = async () => {
    try {
      // Check API data first if available
      if (user) {
        console.log('User data from auth context:', user);
        if (user.roleName === 'employer' || user.role === 'employer') {
          console.log('User is an employer, skipping resume upload');
          setIsEmployer(true);
          setUserRole('employer');
          setShouldSkipResume(true);
        } else if (user.roleName === 'trainee' || user.role === 'trainee') {
          console.log('User is a trainee, skipping resume upload');
          setIsTrainee(true);
          setUserRole('trainee');
          setShouldSkipResume(true);
        } else if (user.roleName === 'trainer' || user.role === 'trainer') {
          console.log('User is a trainer, must upload resume');
          setIsTrainer(true);
          setUserRole('trainer');
          setShouldSkipResume(false); // Trainers need to upload resume
        } else {
          // Default to job seeker - needs resume
          setUserRole('jobSeeker');
          setShouldSkipResume(false);
        }
      } else {
        // Fallback to local storage if user data isn't available
        const storedData = localStorage.getItem('registrationData') || sessionStorage.getItem('registrationData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Registration data from storage:', parsedData);
          
          if (parsedData.userType === 'employer') {
            console.log('User is an employer, skipping resume upload');
            setIsEmployer(true);
            setUserRole('employer');
            setShouldSkipResume(true);
          } else if (parsedData.userType === 'trainee' || parsedData.talentType === 'trainee') {
            console.log('User is a trainee, skipping resume upload');
            setIsTrainee(true);
            setUserRole('trainee');
            setShouldSkipResume(true);
          } else if (parsedData.userType === 'trainer' || parsedData.talentType === 'trainer') {
            console.log('User is a trainer, must upload resume');
            setIsTrainer(true);
            setUserRole('trainer');
            setShouldSkipResume(false);
          } else {
            // Default to job seeker - needs resume
            setUserRole('jobSeeker');
            setShouldSkipResume(false);
          }
        }
      }
    } catch (e) {
      console.error('Error checking user role:', e);
    } finally {
      setLoading(false);
    }
  };
  
  // Automatically complete this step for roles that don't need resume
  const completeStepForSkippedRoles = async () => {
    try {
      console.log(`Completing skills step for ${userRole} role without resume upload`);
      
      // Create skills data to mark this section as complete based on role
      const skillsData = {
        technical: [userRole === 'employer' ? 'Employer' : 'Trainee'],
        soft: [userRole === 'employer' ? 'Leadership' : 'Learning'],
        languages: [],
        certifications: []
      };
      
      // Mark skills section as complete
      await updateOnboardingStatus('skills', skillsData);
      
      console.log('Skills onboarding step completed, navigating to complete page');
      
      // Navigate to complete page immediately
      navigate('/onboarding/complete');
    } catch (error) {
      console.error(`Error completing step for ${userRole}:`, error);
      toast.error('Error processing your information. Please try again.');
    }
  };

  const fetchExistingData = async () => {
    try {
      // Try to get existing resume from onboarding data
      const statusResponse = await checkOnboardingStatus(true);
      
      if (statusResponse && statusResponse.professionalInfo?.data?.resume) {
        setResumeUrl(statusResponse.professionalInfo.data.resume);
        // Extract filename from URL
        const filename = statusResponse.professionalInfo.data.resume.split('/').pop().split('-').slice(1).join('-');
        setResumeName(filename || 'Your resume');
        console.log('Retrieved existing resume:', statusResponse.professionalInfo.data.resume);
      }
    } catch (error) {
      console.error('Error fetching resume data:', error);
      toast.error('Failed to load your resume. You can upload a new one.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };
  
  const processFile = (file) => {
    if (file) {
      // Check file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setResumeFile(file);
      setResumeName(file.name);
      toast.info('Resume selected. Click "Upload Resume" to submit.');
    }
  };
  
  // Handle drag and drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file to upload');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      // Create data object for professional info
      const professionalData = {
        experience: {
          currentRole: '',
          yearsOfExperience: '0',
          company: '',
          desiredRole: ''
        }
      };
      
      // Append data as JSON string
      formData.append('data', JSON.stringify(professionalData));
      
      // For debugging
      console.log('Uploading resume:', resumeFile.name);
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1] instanceof File ? pair[1].name : pair[1]);
      }
      
      // Create a configured API instance for file upload
      // Note: Don't manually set Content-Type for FormData, let the browser set it
      const uploadApi = axios.create({
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Log the auth token (masked for security)
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Using auth token:', token.substring(0, 10) + '...');
      } else {
        console.warn('No auth token found!');
      }
      
      // Upload to server - using professionalInfo section for resume
      console.log('Sending to correct endpoint: /users/onboarding/professional-info');
      
      let response;
      try {
        // First try with the correct hyphenated endpoint
        response = await uploadApi.put('/users/onboarding/professional-info', formData);
      } catch (error) {
        console.log('Primary endpoint failed:', error.message);
        if (error.response?.status === 404) {
          console.log('Trying alternative camelCase endpoint as fallback...');
          // Try the camelCase version as fallback
          response = await uploadApi.put('/users/onboarding/professionalInfo', formData);
        } else {
          // Re-throw for other types of errors
          throw error;
        }
      }
      
      if (response.data && response.data.success) {
        // Update resume URL and create skills data
        const newResumeUrl = response.data.data.professionalInfo.data.resume;
        setResumeUrl(newResumeUrl);
        
        // Create skills data to mark this section as complete
        const skillsData = {
          technical: [userRole === 'trainer' ? 'Training Skills' : 'Resume Uploaded'],
          soft: [userRole === 'trainer' ? 'Training' : 'Communication'],
          languages: [],
          certifications: []
        };
        
        // Mark skills section as complete
        await updateOnboardingStatus('skills', skillsData);
        
        toast.success('Resume uploaded successfully');
        navigate('/onboarding/complete');
      } else {
        throw new Error('Server responded but the upload was not successful');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      // Debug information
      console.log('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      
      let errorMessage = 'Failed to upload resume. Please try again.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'The server endpoint for resume upload was not found. Please contact support.';
        } else if (error.response.status === 413) {
          errorMessage = 'The resume file is too large. Please upload a smaller file (max 5MB).';
        } else if (error.response.status === 415) {
          errorMessage = 'Unsupported file type. Please upload a PDF file.';
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = 'You are not authorized to upload a resume. Please log in again.';
          // Refresh token if needed
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = '/login', 2000);
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };
  
  const handleViewResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  };

  // Get the role-specific message for the resume upload page
  const getRoleSpecificMessage = () => {
    if (isEmployer) {
      return "As an employer, you don't need to upload a resume. You'll be redirected to the next step automatically.";
    } else if (isTrainee) {
      return "As a trainee, you don't need to upload a resume. You'll be redirected to the next step automatically.";
    } else if (isTrainer) {
      return "As a trainer, please upload your resume to showcase your expertise and qualifications to potential trainees.";
    } else {
      return "Upload your resume to help employers learn more about your qualifications and experience.";
    }
  };

  // Get the role-specific title for the resume upload page
  const getRoleSpecificTitle = () => {
    if (isEmployer || isTrainee) {
      return "Skipping Resume Upload";
    } else if (isTrainer) {
      return "Upload Your Trainer Resume";
    } else {
      return "Upload Your Resume";
    }
  };

  return (
    <>
      <ScrollToTop />
      <OnboardingLayout>
        <div className="max-w-3xl mx-auto p-6">
          {shouldSkipResume ? (
            // View for roles that skip resume upload (employers and trainees)
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">{getRoleSpecificTitle()}</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {getRoleSpecificMessage()}
              </p>
              <div className="animate-pulse">
                <div className="text-sm text-gray-500">Redirecting...</div>
              </div>
            </div>
          ) : (
            // View for roles that need resume upload (job seekers and trainers)
            <>
              <h2 className="text-2xl font-bold mb-4">{getRoleSpecificTitle()}</h2>
              <p className="text-gray-600 mb-6">
                {getRoleSpecificMessage()}
                We accept PDF files up to 5MB in size.
              </p>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Resume Upload Section */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">
                          {resumeFile ? 'Resume Selected' : 'Drag & Drop Your Resume Here'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {resumeFile 
                            ? resumeName 
                            : resumeUrl 
                              ? 'You already have a resume uploaded. Drop a new one to replace it.' 
                              : 'or click to browse files'}
                        </p>
                      </div>
                      
                      <div>
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="resume-upload"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer inline-block"
                        >
                          {resumeFile ? 'Change File' : 'Select File'}
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Current Resume Section */}
                  {resumeUrl && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="font-medium">Current Resume</p>
                            <p className="text-sm text-gray-500">{resumeName}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleViewResume}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate('/onboarding/personal-info')}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Back
                    </button>
                    
                    {resumeFile ? (
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : 'Upload Resume'}
                      </button>
                    ) : resumeUrl ? (
                      <button
                        type="button"
                        onClick={() => navigate('/onboarding/complete')}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toast.info('Please select a resume file first')}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </OnboardingLayout>
    </>
  );
};

export default ResumeUpload; 