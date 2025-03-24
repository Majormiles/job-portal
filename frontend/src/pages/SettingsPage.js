// src/pages/SettingsPage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Sidebar from '../components/ui/Sidebar';
import PersonalSettings from '../components/settings/PersonalSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import SocialLinksSettings from '../components/settings/SocialLinksSettings';
import AccountSettings from '../components/settings/AccountSettings';
import '../components/css/Settings.css';

const SettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'social':
        return <SocialLinksSettings />;
      case 'account':
        return <AccountSettings />;
      default:
        return <PersonalSettings />;
    }
  };
  
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>
      
      <div className="dashboard-layout">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`dashboard-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
          <div className="settings-container">
            <h1 className="settings-title">Setting</h1>
            
            <div className="settings-tabs">
              <button 
                className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <span className="tab-icon personal-icon"></span>
                Personal
              </button>
              <button 
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span className="tab-icon profile-icon"></span>
                Profile
              </button>
              <button 
                className={`tab-button ${activeTab === 'social' ? 'active' : ''}`}
                onClick={() => setActiveTab('social')}
              >
                <span className="tab-icon social-icon"></span>
                Social Links
              </button>
              <button 
                className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <span className="tab-icon account-icon"></span>
                Account Setting
              </button>
            </div>
            
            <div className="settings-content">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;