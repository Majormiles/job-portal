import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Monitor, 
  Command,
  Mail,
  Anchor,
  ChevronsRight,
  ChevronsLeft,
  FileText,
  Clipboard,
  Users,
  Settings,
  LogOut,
  Calendar,
  List,
  Eye,
  User
} from 'react-feather';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    manageResumes: false,
    manageCategories: false,
    manageJobs: false
  });

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-100 text-blue-600' : '';
  };

  const renderMenuItem = (icon, text, path, subItems = []) => {
    const hasSubItems = subItems.length > 0;
    const isMenuOpen = openMenus[text.replace(/\s+/g, '').toLowerCase()];

    return (
      <div>
        <Link 
          to={path} 
          className={`flex items-center p-2 hover:bg-gray-100 ${isActive(path)} ${isCollapsed ? 'justify-center' : ''}`}
          onClick={hasSubItems ? (e) => {
            e.preventDefault();
            toggleMenu(text.replace(/\s+/g, '').toLowerCase());
          } : undefined}
        >
          {React.createElement(icon, { className: 'w-5 h-5' })}
          {!isCollapsed && (
            <span className="ml-3 flex-1">
              {text}
              {hasSubItems && (
                <ChevronsRight 
                  className={`inline-block ml-2 transform transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`} 
                  size={16} 
                />
              )}
            </span>
          )}
        </Link>
        {!isCollapsed && hasSubItems && isMenuOpen && (
          <div className="pl-8 mt-1">
            {subItems.map((item, index) => (
              <Link 
                key={index}
                to={item.path} 
                className={`block py-1 hover:text-blue-600 ${isActive(item.path)}`}
              >
                {item.text}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`bg-white h-screen border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && <span className="font-bold text-lg">Job Portal</span>}
        <button onClick={toggleSidebar} className="p-1 hover:bg-gray-100 rounded">
          {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {renderMenuItem(Monitor, 'Admin Dashboard', 'admin-dashboard')}
        
        {renderMenuItem(Command, 'Manage Resumes', '/resumes', [
          { text: 'Resumes', path: 'resume' },
          { text: 'Calendar', path: '/calendar' }
        ])}
        
        {renderMenuItem(Mail, 'Manage Categories', '/categories', [
          { text: 'Create Category', path: '/categories/create' },
          { text: 'Categories', path: '/categories' },
          { text: 'Read', path: '/categories/read' }
        ])}
        
        {renderMenuItem(Anchor, 'Manage Jobs', '/jobs', [
          { text: 'Create Jobs', path: '/jobs/create' },
          { text: 'Jobs', path: '/jobs' },
          { text: 'Profile', path: '/profile' },
          { text: 'Invoice', path: '/invoice' }
        ])}
        
        {renderMenuItem(Users, 'Job Seekers', 'job-seekers')}
        
        {renderMenuItem(Clipboard, 'Manage Applications', '/manage-applications')}
        
        {renderMenuItem(Settings, 'Settings', '/settings')}
        
        {renderMenuItem(LogOut, 'Logout', 'logout')}
      </nav>
    </div>
  );
};

export default Sidebar;