import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { user, api, updateUserSettings } = useAuth();
  const [settingsData, setSettingsData] = useState({
    personalInfo: {},
    contactInfo: {},
    notificationPreferences: {},
    privacySettings: {},
    jobAlerts: {},
    socialLinks: [],
    loading: true,
    error: null
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load all settings data when user changes
  useEffect(() => {
    if (user && user._id) {
      fetchAllSettings();
    }
  }, [user]);

  const fetchAllSettings = async () => {
    try {
      setSettingsData(prev => ({ ...prev, loading: true, error: null }));
      const response = await api.get('/users/account-data');
      
      if (response.data.success) {
        const userData = response.data.data;
        
        // Extract phone code and number
        let phoneCode = '+233'; // Default
        let phoneNumber = '';
        
        if (userData.phone) {
          const phoneWithCode = userData.phone.trim();
          // Common country codes
          const countryCodes = ['+233', '+234', '+1', '+44', '+880'];
          
          // Try to extract country code
          for (const code of countryCodes) {
            if (phoneWithCode.startsWith(code)) {
              phoneCode = code;
              phoneNumber = phoneWithCode.substring(code.length).trim();
              break;
            }
          }
          
          if (phoneNumber === '') {
            phoneNumber = phoneWithCode;
          }
        }
        
        // Format and store all settings data
        setSettingsData({
          personalInfo: {
            fullName: userData.name || '',
            title: userData.professionalInfo?.currentTitle || '',
            experience: userData.professionalInfo?.yearsOfExperience || '',
            education: userData.professionalInfo?.education || '',
            website: userData.website || '',
            dateOfBirth: userData.dateOfBirth || ''
          },
          contactInfo: {
            mapLocation: userData.address?.city || '',
            phoneCode: phoneCode,
            phoneNumber: phoneNumber,
            email: userData.email || ''
          },
          notificationPreferences: userData.settings?.notifications || {
            notifyShortlisted: true,
            notifyAppliedExpire: false,
            notifyJobAlerts: true,
            notifySaved: false,
            notifyRejected: true
          },
          privacySettings: userData.settings?.privacy || {
            profilePublic: true,
            resumePublic: false
          },
          jobAlerts: userData.settings?.jobAlerts || 
                     (userData.onboardingData?.preferences?.data?.jobPreferences ? {
                        role: userData.onboardingData.preferences.data.jobPreferences.desiredRole || '',
                        location: userData.onboardingData.preferences.data.jobPreferences.desiredLocation || ''
                     } : { role: '', location: '' }),
          socialLinks: userData.socialLinks || [],
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error fetching settings data:', error);
      setSettingsData(prev => ({
        ...prev, 
        loading: false, 
        error: 'Failed to load settings data'
      }));
    }
  };

  // Update any settings section
  const updateSettings = async (section, data) => {
    try {
      setIsSaving(true);
      
      // Update local state optimistically
      setSettingsData(prev => ({
        ...prev,
        [section]: { ...prev[section], ...data }
      }));
      
      // Prepare data for API
      let settingsData = {};
      
      switch (section) {
        case 'personalInfo':
          settingsData = {
            personal: data
          };
          break;
        case 'contactInfo':
          settingsData = {
            contact: {
              mapLocation: data.mapLocation,
              phone: data.phoneCode + ' ' + data.phoneNumber.trim(),
              email: data.email
            }
          };
          break;
        case 'notificationPreferences':
          settingsData = {
            settings: {
              notifications: data
            }
          };
          break;
        case 'privacySettings':
          settingsData = {
            settings: {
              privacy: data
            }
          };
          break;
        case 'jobAlerts':
          settingsData = {
            settings: {
              jobAlerts: data
            }
          };
          break;
        case 'socialLinks':
          settingsData = {
            socialLinks: data
          };
          break;
        default:
          settingsData = data;
      }
      
      // Call the updateUserSettings function from AuthContext
      const response = await updateUserSettings(settingsData);
      
      if (response && response.success) {
        // Refresh all settings to ensure consistency
        await fetchAllSettings();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      // Revert the optimistic update
      await fetchAllSettings();
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settingsData,
        isSaving,
        updateSettings,
        refreshSettings: fetchAllSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 