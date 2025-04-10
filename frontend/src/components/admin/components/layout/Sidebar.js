import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    // Clear admin tokens and data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Redirect to admin login
    navigate('/admin/login');
  };

  const renderMenuItem = (Icon, text, path, subItems = [], onClick = null) => {
    const hasSubItems = subItems.length > 0;
    const isMenuOpen = openMenus[text.replace(/\s+/g, '').toLowerCase()];

    return (
      <div>
        {onClick ? (
          <button 
            className={`flex items-center p-2 w-full text-left hover:bg-gray-100 ${isCollapsed ? 'justify-center' : ''}`}
            onClick={() => {
              onClick();
              onClose?.();
            }}
          >
            <Icon className="w-5 h-5" />
            {!isCollapsed && (
              <span className="ml-3 flex-1">{text}</span>
            )}
          </button>
        ) : (
          <Link 
            to={path} 
            className={`flex items-center p-2 hover:bg-gray-100 ${isActive(path)} ${isCollapsed ? 'justify-center' : ''}`}
            onClick={(e) => {
              if (hasSubItems) {
                e.preventDefault();
                toggleMenu(text.replace(/\s+/g, '').toLowerCase());
              }
              onClose?.();
            }}
          >
            <Icon className="w-5 h-5" />
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
        )}
        {!isCollapsed && hasSubItems && isMenuOpen && (
          <div className="pl-8 mt-1">
            {subItems.map((item, index) => (
              <Link 
                key={index}
                to={item.path} 
                className={`block py-1 hover:text-blue-600 ${isActive(item.path)}`}
                onClick={onClose}
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
      className={`bg-white h-screen border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} ${
        // Always show on large screens, show/hide based on isOpen prop on small screens
        isOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:block'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && <span className="font-bold text-lg">Job Portal</span>}
        <button onClick={toggleSidebar} className="p-1 hover:bg-gray-100 rounded">
          {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {renderMenuItem(Monitor, 'Admin Dashboard', '/admin/dashboard')}
        
        {renderMenuItem(Command, 'Manage Resumes', '/admin/resume', [
          { text: 'Resumes', path: '/admin/resume' },
          { text: 'Calendar', path: '/admin/calendar' }
        ])}
        
        {renderMenuItem(Mail, 'Manage Categories', '/admin/categories', [
          { text: 'Create Category', path: '/admin/categories/create' },
          { text: 'Categories', path: '/admin/categories' },
          { text: 'Read', path: '/admin/categories/read' }
        ])}
        
        {renderMenuItem(Anchor, 'Manage Jobs', '/admin/jobs', [
          { text: 'Create Jobs', path: '/admin/jobs/create' },
          { text: 'Jobs', path: '/admin/jobs' },
          { text: 'Profile', path: '/admin/profile' },
          { text: 'Invoice', path: '/admin/invoice' }
        ])}
        
        {renderMenuItem(Users, 'Job Seekers', '/admin/job-seekers')}
        
        {renderMenuItem(Clipboard, 'Manage Applications', '/admin/manage-applications')}
        
        {renderMenuItem(Settings, 'Settings', '/admin/settings')}
        
        {renderMenuItem(LogOut, 'Logout', '', [], handleLogout)}
      </nav>
    </div>
  );
}

export default Sidebar;