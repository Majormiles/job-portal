// src/components/settings/PersonalSettings.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../css/Settings.css';

const PersonalSettings = () => {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    title: '',
    experience: '',
    education: '',
    website: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    dateOfBirth: ''
  });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchResumes();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/onboarding-status');
      
      if (response.data.success) {
        const userData = response.data.data;
        
        // Update form data with personal info
        if (userData.personalInfo?.data) {
          const personalData = userData.personalInfo.data;
          setFormData(prev => ({
            ...prev,
            phone: personalData.phone || '',
            address: personalData.address || {
              street: '',
              city: '',
              state: '',
              zipCode: ''
            },
            dateOfBirth: personalData.dateOfBirth ? new Date(personalData.dateOfBirth).toISOString().split('T')[0] : ''
          }));
          
          // Set profile picture if exists
          if (personalData.profilePicture) {
            setProfileImage(personalData.profilePicture);
          }
        }

        // Update form data with professional info
        if (userData.professionalInfo?.data) {
          const professionalData = userData.professionalInfo.data;
          setFormData(prev => ({
            ...prev,
            experience: professionalData.experience?.yearsOfExperience?.toString() || '',
            education: professionalData.education?.level || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await api.get('/users/onboarding-status');
      if (response.data.success) {
        // Check if resumes exist in the response
        const userData = response.data.data;
        if (userData.professionalInfo?.data?.resume) {
          // Convert single resume to array format for display
          setResumes([{
            _id: 'current-resume',
            originalName: 'Current Resume',
            url: userData.professionalInfo.data.resume,
            createdAt: new Date().toISOString()
          }]);
        } else {
          setResumes([]);
        }
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in again to continue');
      } else {
        toast.error('Failed to load resumes');
      }
      setResumes([]); // Set empty array on error
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
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

      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
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

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('resume', file);

      // Add existing professional info data
      const professionalData = {
        experience: {
          yearsOfExperience: parseInt(formData.experience) || 0
        },
        education: {
          level: formData.education || ''
        }
      };
      formData.append('data', JSON.stringify(professionalData));

      // Show loading toast
      const loadingToast = toast.loading('Uploading resume...');

      const response = await api.put('/users/onboarding/professional-info', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.update(loadingToast, {
          render: 'Resume uploaded successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
        
        // Update resumes state with the new resume
        const newResume = {
          _id: 'current-resume',
          originalName: file.name,
          url: response.data.data.professionalInfo.data.resume,
          createdAt: new Date().toISOString()
        };
        setResumes([newResume]);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in again to continue');
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload resume');
      }
    } finally {
      setLoading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleViewResume = (resume) => {
    // Create a blob URL from the resume data
    const resumeUrl = resume.url;
    setSelectedResume({
      ...resume,
      url: resumeUrl
    });
    setShowResumeModal(true);
  };

  const handleCloseModal = () => {
    setShowResumeModal(false);
    setSelectedResume(null);
  };

  const handleDeleteResume = async (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('data', JSON.stringify({
          experience: formData.experience ? {
            yearsOfExperience: parseInt(formData.experience) || 0
          } : undefined,
          education: formData.education ? {
            level: formData.education
          } : undefined,
          resume: null
        }));

        const response = await api.put('/users/onboarding/professional-info', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          toast.success('Resume deleted successfully');
          fetchResumes(); // Refresh resumes list
        }
      } catch (error) {
        console.error('Error deleting resume:', error);
        if (error.response?.status === 401) {
          toast.error('Please log in again to continue');
        } else {
          toast.error('Failed to delete resume');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create FormData for file upload
      const formDataToSubmit = new FormData();
      
      // Prepare the data object
      const dataToSend = {
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        experience: {
          yearsOfExperience: parseInt(formData.experience) || 0
        },
        education: {
          level: formData.education
        }
      };

      // Append the data as a JSON string
      formDataToSubmit.append('data', JSON.stringify(dataToSend));

      // Add profile picture if exists and is a File
      if (profileImage && profileImage.startsWith('blob:')) {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        formDataToSubmit.append('profilePicture', blob, 'profile-picture.jpg');
      }

      // Update personal info
      await api.put('/users/onboarding/personal-info', formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update professional info
      await api.put('/users/onboarding/professional-info', {
        data: {
          experience: {
            yearsOfExperience: parseInt(formData.experience) || 0
          },
          education: {
            level: formData.education
          }
        }
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-section">
      <h2 className="section-title">Basic Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="settings-grid">
          <div className="profile-picture-container">
            <h3>Profile Picture</h3>
            <div className="profile-upload-area">
              {profileImage ? (
                <div className="profile-preview-container">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="profile-preview rounded-full object-cover"
                    style={{ width: '150px', height: '150px' }}
                  />
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16V8M12 8L8 12M12 8L16 12" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="browse-text">Browse photo or drop here</p>
                    <p className="upload-instruction">A photo larger than 400 pixels work best. Max photo size 5 MB.</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                id="profilePicture" 
                className="file-input" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="fullName">Full name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="form-control"
              disabled
              aria-label="Full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-control"
              aria-label="Phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="form-control"
              aria-label="Date of birth"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address.street">Street Address</label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              className="form-control"
              aria-label="Street address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address.city">City</label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={handleInputChange}
              className="form-control"
              aria-label="City"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address.state">State</label>
            <input
              type="text"
              id="address.state"
              name="address.state"
              value={formData.address.state}
              onChange={handleInputChange}
              className="form-control"
              aria-label="State"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address.zipCode">ZIP Code</label>
            <input
              type="text"
              id="address.zipCode"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleInputChange}
              className="form-control"
              aria-label="ZIP code"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="title">Title/headline</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-control"
              aria-label="Title or headline"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="experience">Experience</label>
            <div className="select-wrapper">
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="form-control select"
              >
                <option value="" disabled>Select years of experience</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="education">Education</label>
            <div className="select-wrapper">
              <select
                id="education"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                className="form-control select"
              >
                <option value="" disabled>Select education level</option>
                <option value="high-school">High School</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">PhD</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="website">Personal Website</label>
            <div className="website-input-wrapper">
              <span className="website-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.5 10H17.5" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 2.5C12.0711 4.75442 13.1814 7.77534 13.125 10.9375C13.0686 14.0997 11.8577 17.0683 10 19.1875" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 2.5C7.92887 4.75442 6.81866 7.77534 6.875 10.9375C6.93134 14.0997 8.14225 17.0683 10 19.1875" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="form-control website-input"
              />
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="resume-section">
        <h2 className="section-title">Resumes</h2>
        <div className="resume-container">
          <div className="resume-cards">
            {resumes && resumes.length > 0 ? (
              resumes.map((resume) => (
                <div key={resume._id} className="resume-card">
                  <div className="resume-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 13H8" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17H8" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 9H8" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="resume-details">
                    <h3>{resume.originalName}</h3>
                    <p>Uploaded on {new Date(resume.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="resume-actions">
                    <button 
                      onClick={() => handleViewResume(resume)} 
                      className="resume-action-btn view-btn"
                      title="View Resume"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3C4.5 3 1.5 5.5 1.5 8C1.5 10.5 4.5 13 8 13C11.5 13 14.5 10.5 14.5 8C14.5 5.5 11.5 3 8 3ZM8 11.5C5.5 11.5 3.5 9.5 3.5 8C3.5 6.5 5.5 4.5 8 4.5C10.5 4.5 12.5 6.5 12.5 8C12.5 9.5 10.5 11.5 8 11.5Z" fill="currentColor"/>
                        <path d="M8 5.5C6.5 5.5 5.5 6.5 5.5 8C5.5 9.5 6.5 10.5 8 10.5C9.5 10.5 10.5 9.5 10.5 8C10.5 6.5 9.5 5.5 8 5.5Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteResume(resume._id)} 
                      className="resume-action-btn delete-btn"
                      title="Delete Resume"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3333 4H2.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.33333 4V1.33333C5.33333 0.596954 5.93029 0 6.66667 0H9.33333C10.0697 0 10.6667 0.596954 10.6667 1.33333V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.66667 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.33333 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 4H14V13.3333C14 13.687 13.8595 14.0261 13.6095 14.2761C13.3594 14.5262 13.0203 14.6667 12.6667 14.6667H3.33333C2.97971 14.6667 2.64057 14.5262 2.39052 14.2761C2.14048 14.0261 2 13.687 2 13.3333V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-resumes">
                <p>No resumes uploaded yet</p>
              </div>
            )}
            
            <div className="add-resume-card">
              <input
                type="file"
                id="resumeUpload"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="file-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="resumeUpload" className="add-resume-content">
                <div className="add-resume-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="add-resume-text">
                  <h3>Add New Resume</h3>
                  <p>Upload a PDF file (max 5MB)</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Modal */}
      {showResumeModal && selectedResume && (
        <div className="resume-modal-overlay">
          <div className="resume-modal">
            <div className="resume-modal-header">
              <h3>View Resume</h3>
              <button onClick={handleCloseModal} className="close-modal-btn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="resume-modal-content">
              <iframe
                src={selectedResume.url}
                title="Resume Preview"
                className="resume-preview"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalSettings;