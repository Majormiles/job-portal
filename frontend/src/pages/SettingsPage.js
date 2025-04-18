import React, { useState, useEffect } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Sidebar from '../components/ui/Sidebar';
import PersonalSettings from '../components/settings/PersonalSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import SocialLinksSettings from '../components/settings/SocialLinksSettings';
import '../components/css/Settings.css';

const SettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab] = useState('personal');
  const [tabsCollapsed, setTabsCollapsed] = useState(window.innerWidth <= 480);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
      setTabsCollapsed(window.innerWidth <= 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTabsCollapse = () => {
    setTabsCollapsed(!tabsCollapsed);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'social':
        return <SocialLinksSettings />;
      default:
        return <PersonalSettings />;
    }
  };

  const getActiveTabName = () => {
    switch (activeTab) {
      case 'personal':
        return 'Personal';
      case 'profile':
        return 'Profile';
      case 'social':
        return 'Social Links';
      default:
        return 'Personal';
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth <= 480) {
      setTabsCollapsed(true);
    }
  };

  return (
    <div className="page-container">
      {/* <Header />
      <div className="hero"></div> */}

      <div className="dashboard-layout">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`dashboard-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
          <div className="content-area">
            <div className="settings-container">
              <h1 className="settings-title">Setting</h1>

              <div className="settings-tabs-container">
                {/* Mobile tabs dropdown trigger */}
                <div className="mobile-tabs-header">
                  <button
                    className="mobile-tabs-toggle"
                    onClick={toggleTabsCollapse}
                  >
                    <span className={`tab-icon ${activeTab}-icon`}></span>
                    {getActiveTabName()}
                    <span className={`dropdown-arrow ${tabsCollapsed ? 'collapsed' : 'expanded'}`}>
                      ▼
                    </span>
                  </button>
                </div>

                {/* Tabs - either shown or hidden based on tabsCollapsed state */}
                <div className={`settings-tabs ${tabsCollapsed ? 'collapsed' : ''}`}>
                  <button
                    className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => handleTabClick('personal')}
                  >
                    <span className="tab-icon personal-icon"></span>
                    Personal
                  </button>
                  {/* <button
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => handleTabClick('profile')}
                  >
                    <span className="tab-icon profile-icon"></span>
                    Profile
                  </button>
                   */}
                  <button
                    className={`tab-button ${activeTab === 'social' ? 'active' : ''}`}
                    onClick={() => handleTabClick('social')}
                  >
                    <span className="tab-icon social-icon"></span>
                    Social Links
                  </button>
                </div>
              </div>

              <div className="settings-content">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;