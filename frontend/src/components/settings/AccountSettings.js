import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Country codes object with flags
const countryCodes = {
  '+233': { code: 'gh', name: 'Ghana' },
  '+234': { code: 'ng', name: 'Nigeria' },
  '+1': { code: 'us', name: 'United States' },
  '+44': { code: 'gb', name: 'United Kingdom' },
  '+880': { code: 'bd', name: 'Bangladesh' }
};

const AccountSettings = () => {
  const { user, api } = useAuth();
  const { 
    contactInfo,
    notificationPreferences,
    privacySettings,
    jobAlerts = { role: '', location: '' },
    loading,
    isSaving,
    updateSettings,
    refreshSettings
  } = useSettings();
  
  const [countryCodeDropdownOpen, setCountryCodeDropdownOpen] = useState(false);
  const [settingsComplete, setSettingsComplete] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    email: '',
    reason: '',
    customReason: ''
  });

  useEffect(() => {
    // Check if settings are complete when user or contact info changes
    if (user && contactInfo) {
      const isComplete = checkSettingsCompletion(user);
      setSettingsComplete(isComplete);
    }
  }, [user, contactInfo]);

  // Add effect to ensure job alerts are properly initialized from the user's data
  useEffect(() => {
    if (user && user.settings?.jobAlerts) {
      console.log('Initializing job alerts from user settings:', user.settings.jobAlerts);
      updateSettings('jobAlerts', user.settings.jobAlerts);
    } else if (user && user.onboardingData?.preferences?.data?.jobPreferences) {
      // Fallback to onboarding data if settings don't have job alerts
      const { desiredRole, desiredLocation } = user.onboardingData.preferences.data.jobPreferences;
      console.log('Initializing job alerts from onboarding data:', { role: desiredRole, location: desiredLocation });
      updateSettings('jobAlerts', { 
        role: desiredRole || '',
        location: desiredLocation || ''
      });
    }
  }, [user]);

  const checkSettingsCompletion = (userData) => {
    // Check if essential settings are completed
    return !!(
      userData.phone && 
      userData.address?.city && 
      userData.professionalInfo?.currentTitle
    );
  };

  const handleContactInfoChange = (field, value) => {
    // Update only the field that changed, maintaining other values
    updateSettings('contactInfo', { ...contactInfo, [field]: value });
  };

  const handleNotificationChange = (field, value) => {
    updateSettings('notificationPreferences', { ...notificationPreferences, [field]: value });
  };

  const handleJobAlertsChange = (field, value) => {
    console.log(`Updating job alerts ${field} to: "${value}"`);
    // Create a new object with the updated field to ensure React detects the change
    const updatedJobAlerts = { 
      ...jobAlerts, 
      [field]: value 
    };
    console.log('New job alerts state:', updatedJobAlerts);
    updateSettings('jobAlerts', updatedJobAlerts);
  };

  const handlePrivacyChange = (field, value) => {
    updateSettings('privacySettings', { ...privacySettings, [field]: value });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveSettings = async () => {
    try {
      // Use the optimistic updates in the updateSettings function
      const fullPhoneNumber = contactInfo.phoneCode + ' ' + contactInfo.phoneNumber.trim();
      
      // Ensure all objects exist with defaults if needed
      const currentJobAlerts = jobAlerts || { role: '', location: '' };
      console.log('Saving job alerts:', currentJobAlerts);
      
      const settingsData = {
        contact: {
          mapLocation: contactInfo.mapLocation,
          phone: fullPhoneNumber,
          email: contactInfo.email
        },
        settings: {
          notifications: notificationPreferences,
          privacy: privacySettings,
          jobAlerts: {
            role: currentJobAlerts.role || '',
            location: currentJobAlerts.location || ''
          }
        }
      };
      
      console.log('Saving complete settings data:', settingsData);
      
      // Use a single update call with combined data
      const success = await updateSettings('combined', settingsData);
      
      if (success) {
        toast.success('Settings saved successfully!');
        console.log('Settings saved successfully, refreshing data...');
        
        // Refresh settings to ensure UI is in sync with server data
        refreshSettings();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings: ' + (error.message || 'Unknown error'));
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      // Use the optimistic updates in the updateSettings function
      const response = await updateSettings('password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        toast.success('Password updated successfully');
        
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response?.status === 401) {
        toast.error('Current password is incorrect');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update password');
      }
    }
  };

  const handleDeleteAccount = async () => {
    // Validate email confirmation
    if (deleteConfirmation.email !== user.email) {
      toast.error('Email does not match your account email');
      return;
    }

    // Validate deletion reason
    if (!deleteConfirmation.reason) {
      toast.error('Please select a reason for deleting your account');
      return;
    }

    // Validate custom reason if 'Other' is selected
    if (deleteConfirmation.reason === 'Other' && !deleteConfirmation.customReason.trim()) {
      toast.error('Please provide a reason for deleting your account');
      return;
    }
    
    try {
      // Call the delete endpoint with the reason
      const response = await api.delete('/users/me', {
        data: {
          deletionReason: deleteConfirmation.reason,
          customReason: deleteConfirmation.reason === 'Other' ? deleteConfirmation.customReason : undefined
        }
      });
      
      if (response.data.success) {
        toast.success('Account deleted successfully');
        
        // Redirect to login page and clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="settings-section">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <ScrollToTop />
      <div className="space-y-8">
        {/* Contact Info Section */}
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Contact Info</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Map Location</label>
              <input
                type="text"
                value={contactInfo.mapLocation}
                onChange={(e) => handleContactInfoChange('mapLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Phone</label>
              <div className="flex">
                <div className="relative">
                  <button 
                    type="button"
                    className="flex items-center sm:w-[200px] justify-between px-3 py-2 bg-white border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setCountryCodeDropdownOpen(!countryCodeDropdownOpen)}
                  >
                    <span className="flex items-center">
                      <img 
                        src={`https://flagcdn.com/w20/${countryCodes[contactInfo.phoneCode]?.code || 'gh'}.png`} 
                        alt={countryCodes[contactInfo.phoneCode]?.name || 'Ghana'} 
                        className="w-5 h-3 mr-2" 
                      /> 
                      <span>{contactInfo.phoneCode}</span>
                    </span>
                    <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  {countryCodeDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-[200px] bg-white border border-gray-300 rounded-md shadow-lg">
                      {Object.entries(countryCodes).map(([code, { code: countryCode, name }]) => (
                        <button
                          key={code}
                          type="button"
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleContactInfoChange('phoneCode', code)}
                        >
                          <img 
                            src={`https://flagcdn.com/w20/${countryCode}.png`} 
                            alt={name} 
                            className="w-5 h-3 mr-2" 
                          />
                          <span>{code}</span>
                          <span className="ml-2 text-xs text-gray-500">{name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Phone number..."
                  value={contactInfo.phoneNumber}
                  onChange={(e) => handleContactInfoChange('phoneNumber', e.target.value)}
                  className="flex-1 px-3 py-2 border m-auto ml-5 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={contactInfo.email}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </section>
        
        {/* Notification Section */}
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Notification</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyShortlisted"
                checked={notificationPreferences.notifyShortlisted}
                onChange={(e) => handleNotificationChange('notifyShortlisted', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notifyShortlisted" className="ml-2 text-sm text-gray-700">
                Notify me when employers shortlisted me
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifySaved"
                checked={notificationPreferences.notifySaved}
                onChange={(e) => handleNotificationChange('notifySaved', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notifySaved" className="ml-2 text-sm text-gray-700">
                Notify me when employers saved my profile
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyRejected"
                checked={notificationPreferences.notifyRejected}
                onChange={(e) => handleNotificationChange('notifyRejected', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notifyRejected" className="ml-2 text-sm text-gray-700">
                Notify me when I'm rejected
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyAppliedExpire"
                checked={notificationPreferences.notifyAppliedExpire}
                onChange={(e) => handleNotificationChange('notifyAppliedExpire', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notifyAppliedExpire" className="ml-2 text-sm text-gray-700">
                Notify me when jobs I've applied to expire
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyJobAlerts"
                checked={notificationPreferences.notifyJobAlerts}
                onChange={(e) => handleNotificationChange('notifyJobAlerts', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notifyJobAlerts" className="ml-2 text-sm text-gray-700">
                Notify me when I have up to 5 job alerts
              </label>
            </div>
          </div>
        </section>
        
        {/* Job Alerts Section */}
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Job Alerts</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Desired Job Role</label>
              <input
                type="text"
                value={jobAlerts?.role || ''}
                onChange={(e) => handleJobAlertsChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Software Engineer, Project Manager"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter job titles that interest you to receive relevant alerts
              </p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Desired Location</label>
              <input
                type="text"
                value={jobAlerts?.location || ''}
                onChange={(e) => handleJobAlertsChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Accra, Remote"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter locations where you'd like to work
              </p>
            </div>
          </div>
        </section>
        
        {/* Privacy Section */}
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Privacy</h2>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="profilePublic"
                checked={privacySettings.profilePublic}
                onChange={(e) => handlePrivacyChange('profilePublic', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="profilePublic" className="ml-2 text-sm text-gray-700">
                Make my profile public to employers
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="resumePublic"
                checked={privacySettings.resumePublic}
                onChange={(e) => handlePrivacyChange('resumePublic', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="resumePublic" className="ml-2 text-sm text-gray-700">
                Make my resume public to employers
              </label>
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                By making your profile public, employers can find and contact you even if you haven't 
                applied to their jobs. This increases your chances of finding employment.
              </p>
            </div>
          </div>
        </section>
        
        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
        
        {/* Password Section */}
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Change Password</h2>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={passwordVisibility.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {passwordVisibility.current ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={passwordVisibility.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {passwordVisibility.new ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={passwordVisibility.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {passwordVisibility.confirm ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>
        
        {/* Delete Account Section */}
        <section>
          <h2 className="text-lg font-medium text-red-600 mb-4">Delete Account</h2>
          
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <p className="text-sm text-red-700 mb-4">
              Warning: Deleting your account is permanent and cannot be undone. All your data will be lost.
            </p>
            
            {deleteConfirmation.open ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-red-700">
                  Please type your email address to confirm deletion: <span className="font-bold">{user.email}</span>
                </p>
                
                <input
                  type="email"
                  value={deleteConfirmation.email}
                  onChange={(e) => setDeleteConfirmation(prev => ({...prev, email: e.target.value}))}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your email address"
                />

                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Why are you deleting your account?
                  </label>
                  <select
                    value={deleteConfirmation.reason}
                    onChange={(e) => setDeleteConfirmation(prev => ({...prev, reason: e.target.value}))}
                    className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="Found a job">I found a job</option>
                    <option value="Not finding relevant jobs">Not finding relevant jobs</option>
                    <option value="Technical issues">Technical issues with the platform</option>
                    <option value="Privacy concerns">Privacy concerns</option>
                    <option value="Creating a new account">Creating a new account</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {deleteConfirmation.reason === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-2">
                      Please specify your reason
                    </label>
                    <textarea
                      value={deleteConfirmation.customReason}
                      onChange={(e) => setDeleteConfirmation(prev => ({...prev, customReason: e.target.value}))}
                      className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Tell us why you're deleting your account..."
                      rows={3}
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmation({open: false, email: '', reason: '', customReason: ''})}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isSaving || deleteConfirmation.email !== user.email || !deleteConfirmation.reason || (deleteConfirmation.reason === 'Other' && !deleteConfirmation.customReason.trim())}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSaving ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirmation({open: true, email: '', reason: '', customReason: ''})}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete My Account
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountSettings;