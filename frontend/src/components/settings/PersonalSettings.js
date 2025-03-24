// src/components/settings/PersonalSettings.js
import React, { useState } from 'react';
import '../css/Settings.css';

const PersonalSettings = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    experience: '',
    education: '',
    website: ''
  });

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement your save logic here
    console.log('Form submitted:', formData);
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
                <img src={profileImage} alt="Profile" className="profile-preview" />
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
            />
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="title">Title/headline</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-control"
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
                <option value="" disabled>Select...</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="education">Educations</label>
            <div className="select-wrapper">
              <select
                id="education"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                className="form-control select"
              >
                <option value="" disabled>Select...</option>
                <option value="high-school">High School</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">PhD</option>
              </select>
            </div>
          </div>
          
          <div className="form-group full-width">
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
                placeholder="Website url..."
                value={formData.website}
                onChange={handleInputChange}
                className="form-control website-input"
              />
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-save">Save Changes</button>
        </div>
      </form>

      <div className="resume-section">
        <h2 className="section-title">Your CV/Resume</h2>
        
        <div className="resume-container">
          <div className="resume-cards">
            <div className="resume-card">
              <div className="resume-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19M14 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V8M14 3L19 8" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="resume-details">
                <h3>Professional Resume</h3>
                <p>3.5 MB</p>
              </div>
              <button className="resume-menu-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="resume-card">
              <div className="resume-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19M14 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V8M14 3L19 8" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="resume-details">
                <h3>Product Designer</h3>
                <p>4.7 MB</p>
              </div>
              <div className="resume-dropdown">
                <button className="edit-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.7167 7.51667L12.4833 8.28333L4.93333 15.8333H4.16667V15.0667L11.7167 7.51667ZM14.7167 2.5C14.5083 2.5 14.2917 2.58333 14.1333 2.74167L12.6083 4.26667L15.7333 7.39167L17.2583 5.86667C17.5833 5.54167 17.5833 5.01667 17.2583 4.69167L15.3083 2.74167C15.1417 2.575 14.9333 2.5 14.7167 2.5ZM11.7167 5.15833L2.5 14.375V17.5H5.625L14.8417 8.28333L11.7167 5.15833Z" fill="#0066FF"/>
                  </svg>
                  Edit Resume
                </button>
                <button className="delete-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 15.8333C5 16.75 5.75 17.5 6.66667 17.5H13.3333C14.25 17.5 15 16.75 15 15.8333V5.83333H5V15.8333ZM6.66667 7.5H13.3333V15.8333H6.66667V7.5ZM12.9167 3.33333L12.0833 2.5H7.91667L7.08333 3.33333H4.16667V5H15.8333V3.33333H12.9167Z" fill="#FF424E"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
            
            <div className="resume-card">
              <div className="resume-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19M14 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V8M14 3L19 8" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="resume-details">
                <h3>Visual Designer</h3>
                <p>1.3 MB</p>
              </div>
              <button className="resume-menu-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="add-resume-card">
              <div className="add-resume-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="add-resume-text">
                <h3>Add CV/Resume</h3>
                <p>Browse file or drop here, only pdf</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalSettings;