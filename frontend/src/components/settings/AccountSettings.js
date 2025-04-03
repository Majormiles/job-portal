import React, { useState } from 'react';

const AccountSettings = () => {
  const [contactInfo, setContactInfo] = useState({
    mapLocation: '',
    phoneCode: '+880',
    phoneNumber: '',
    email: ''
  });

  const [notifications, setNotifications] = useState({
    notifyShortlisted: true,
    notifyAppliedExpire: false,
    notifyJobAlerts: true,
    notifySaved: false,
    notifyRejected: true
  });

  const [jobAlerts, setJobAlerts] = useState({
    role: '',
    location: ''
  });

  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    resumePublic: false
  });

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

  const handleContactInfoChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleJobAlertsChange = (field, value) => {
    setJobAlerts(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="py-4 px-2 sm:px-4">
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
                  <button className="flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <span className="flex items-center">
                      <img src="https://flagcdn.com/w20/bd.png" alt="Bangladesh" className="w-5 h-3 mr-2" /> 
                      <span>{contactInfo.phoneCode}</span>
                    </span>
                    <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Phone number..."
                  value={contactInfo.phoneNumber}
                  onChange={(e) => handleContactInfoChange('phoneNumber', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={contactInfo.email}
                  onChange={(e) => handleContactInfoChange('email', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Save Changes
              </button>
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
                checked={notifications.notifyShortlisted}
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
                checked={notifications.notifySaved}
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
                id="notifyApplied"
                checked={notifications.notifyAppliedExpire}
                onChange={(e) => handleNotificationChange('notifyAppliedExpire', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notifyApplied" className="ml-2 text-sm text-gray-700">
                Notify me when my applied jobs are expire
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyRejected"
                checked={notifications.notifyRejected}
                onChange={(e) => handleNotificationChange('notifyRejected', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notifyRejected" className="ml-2 text-sm text-gray-700">
                Notify me when employers rejected me
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyJobAlerts"
                checked={notifications.notifyJobAlerts}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Your job roles"
                  value={jobAlerts.role}
                  onChange={(e) => handleJobAlertsChange('role', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="City, state, country name"
                  value={jobAlerts.location}
                  onChange={(e) => handleJobAlertsChange('location', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Save Changes
            </button>
          </div>
        </section>
        
        {/* Privacy Settings Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Profile Privacy</h2>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={privacySettings.profilePublic}
                    onChange={(e) => handlePrivacyChange('profilePublic', e.target.checked)}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
                <span className="ml-3 text-sm font-medium text-gray-900">YES</span>
              </div>
              <div className="text-sm text-gray-500">Your profile is public now</div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Resume Privacy</h2>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={privacySettings.resumePublic}
                    onChange={(e) => handlePrivacyChange('resumePublic', e.target.checked)}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
                <span className="ml-3 text-sm font-medium text-gray-900">NO</span>
              </div>
              <div className="text-sm text-gray-500">Your resume is private now</div>
            </div>
          </div>
        </section>
        
        {/* Change Password Section */}
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Change Password</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={passwordVisibility.current ? "text" : "password"}
                  placeholder="Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => togglePasswordVisibility('current')}
                >
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={passwordVisibility.new ? "text" : "password"}
                  placeholder="Password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => togglePasswordVisibility('new')}
                >
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={passwordVisibility.confirm ? "text" : "password"}
                  placeholder="Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Save Changes
            </button>
          </div>
        </section>
        
        {/* Delete Account Section */}
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Delete Your Account</h2>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-700 mb-6">
              If you delete your Jobpilot account, you will no longer be able to get information about the matched jobs, following employers, and job alert, shortlisted jobs and more. You will be abandoned from all the services of Jobpilot.com.
            </p>
            
            <button className="flex items-center px-4 py-2 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Close Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountSettings;