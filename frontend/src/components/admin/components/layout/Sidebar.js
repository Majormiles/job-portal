import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Monitor, 
  Command,
  Mail,
  Anchor,
  ChevronRight,
  ChevronLeft,
  FileText,
  Users,
  Settings,
  LogOut,
  Calendar,
  List,
  Eye,
  User,
  Grid,
  Menu,
  X,
  ChevronDown,
  DollarSign,
  CreditCard,
  PieChart,
  Bell
} from 'lucide-react';
import '../../css/scrollbar.css';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const sidebarRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
  // Initialize openMenus based on current path
  useEffect(() => {
    const path = location.pathname;
    const newOpenMenus = { ...openMenus };
    
    if (path.includes('/admin/resume') || path.includes('/admin/calendar')) {
      newOpenMenus.manageResumes = true;
    }
    if (path.includes('/admin/jobs') || path.includes('/admin/profile') || path.includes('/admin/invoice')) {
      newOpenMenus.manageJobs = true;
    }
    if (path.includes('/admin/payments')) {
      newOpenMenus.managePayments = true;
    }
    
    setOpenMenus(newOpenMenus);
  }, [location.pathname]);

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
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    // Clear admin tokens and data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Redirect to admin login
    navigate('/admin/login');
  };

  const menuItems = [
    {
      icon: Monitor,
      text: 'Dashboard',
      path: '/admin/dashboard',
      subItems: []
    },
    {
      icon: Bell,
      text: 'Notifications',
      path: '/admin/notifications',
      subItems: []
    },
    {
      icon: Command,
      text: 'Manage Resumes',
      path: '/admin/resume',
      menuKey: 'manageResumes',
      subItems: [
        { text: 'Resumes', path: '/admin/resume' },
        { text: 'Calendar', path: '/admin/calendar' }
      ]
    },
    {
      icon: DollarSign,
      text: 'Payment Portal',
      path: '/admin/payments',
      menuKey: 'managePayments',
      isNew: true,
      subItems: [
        { text: 'Overview', path: '/admin/payments' },
        { text: 'Transactions', path: '/admin/payments/transactions' },
        { text: 'Analytics', path: '/admin/payments/analytics' },
        { text: 'Reports', path: '/admin/payments/reports' },
        { text: 'Payment Settings', path: '/admin/payments/settings' }
      ]
    },
    {
      icon: Anchor,
      text: 'Manage Jobs',
      path: '/admin/jobs',
      menuKey: 'manageJobs',
      disabled: true,
      isNew: true,
      subItems: [
        { text: 'All Jobs', path: '/admin/jobs' },
        { text: 'Create Job', path: '/admin/jobs/create' },
        { text: 'Invoice', path: '/admin/invoice' }
      ]
    },
    {
      icon: Users,
      text: 'Job Seekers',
      path: '/admin/job-seekers',
      disabled: true,
      isNew: true,
      subItems: []
    }
  ];

  const renderMenuItem = (item) => {
    const { icon: Icon, text, path, subItems, menuKey, onClick, disabled, isNew } = item;
    const hasSubItems = subItems && subItems.length > 0;
    const isMenuOpen = menuKey ? openMenus[menuKey] : false;
    const isPathActive = isActive(path);

    return (
      <div key={text} className="mb-1">
        {onClick ? (
          <button 
            className={`flex items-center p-2 w-full text-left rounded-md transition-colors duration-200
              ${isCollapsed ? 'justify-center' : ''}
              ${isPathActive ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-100'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (!disabled) {
                onClick();
                onClose?.();
              }
            }}
            disabled={disabled}
          >
            <Icon className={`w-5 h-5 ${isPathActive ? 'text-blue-600' : 'text-gray-500'}`} />
            {!isCollapsed && (
              <span className="ml-3 flex-1">{text}</span>
            )}
            {!isCollapsed && isNew && (
              <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-500">New</span>
            )}
          </button>
        ) : (
          <div
            className={`flex items-center p-2 rounded-md transition-colors duration-200
              ${isCollapsed ? 'justify-center' : ''}
              ${isPathActive ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-100'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={(e) => {
              if (disabled) return;
              
              if (hasSubItems) {
                e.preventDefault();
                toggleMenu(menuKey);
              } else {
                navigate(path);
                onClose?.();
              }
            }}
          >
            <Icon className={`flex-shrink-0 w-5 h-5 ${isPathActive ? 'text-blue-600' : 'text-gray-500'}`} />
            
            {!isCollapsed && (
              <>
                <span className="ml-3 flex-1">{text}</span>
                {isNew && (
                  <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-500">New</span>
                )}
                {hasSubItems && (
                  <ChevronDown 
                    className={`transition-transform duration-300 ease-in-out ml-1 ${isMenuOpen ? 'rotate-180' : ''}`} 
                    size={18} 
                  />
                )}
              </>
            )}
          </div>
        )}
        
        {/* Submenu with transition */}
        {!isCollapsed && hasSubItems && (
          <div 
            className={`pl-10 overflow-hidden transition-all duration-300 ease-in-out scrollbar-extra-light ${
              isMenuOpen ? 'max-h-48 mt-1 mb-1' : 'max-h-0'
            }`}
          >
            {subItems.map((subItem, index) => (
              <Link 
                key={index}
                to={subItem.path} 
                className={`block py-2 text-sm transition-colors duration-200 hover:text-blue-600 ${
                  isActive(subItem.path) 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-600'
                } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
                onClick={(e) => {
                  console.log(`Submenu item clicked: ${subItem.text} with path: ${subItem.path}`);
                  console.log(`Current location:`, location.pathname);
                  console.log('Submenu item details:', subItem);
                  
                  if (disabled) {
                    console.log('Menu item is disabled, preventing navigation');
                    e.preventDefault();
                    return;
                  }
                  
                  // If this is a forceReload item, use window.location.href instead
                  if (subItem.forceReload) {
                    console.log(`ForceReload menu item clicked: ${subItem.text}, using window.location.href`);
                    e.preventDefault();
                    window.location.href = subItem.path;
                    return;
                  }
                  
                  // Otherwise just close the sidebar
                  console.log('Regular menu item, using default Link navigation');
                  onClose?.();
                }}
              >
                {subItem.text}
                {subItem.isNew && (
                  <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-500">New</span>
                )}
              </Link>
            ))}
          </div>
        )}
        
        {/* Tooltip for collapsed menu */}
        {isCollapsed && hasSubItems && (
          <div className="relative group">
            <div className="absolute left-full ml-2 top-0 z-50 transform -translate-y-1/2 hidden group-hover:block">
              <div className="bg-white border shadow-md rounded-md py-2 px-3 min-w-[160px]">
                {isNew && (
                  <div className="mb-1 px-2 py-1">
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-500">New</span>
                  </div>
                )}
                {subItems.map((subItem, index) => (
                  <Link 
                    key={index}
                    to={subItem.path} 
                    className={`block py-2 text-sm transition-colors hover:text-blue-600 ${
                      isActive(subItem.path) ? 'text-blue-600 font-medium' : 'text-gray-600'
                    }`}
                    onClick={(e) => {
                      console.log(`Collapsed submenu item clicked: ${subItem.text} with path: ${subItem.path}`);
                      console.log(`Current location:`, location.pathname);
                      console.log('Collapsed submenu item details:', subItem);
                      
                      // If this is a forceReload item, use window.location.href instead
                      if (subItem.forceReload) {
                        console.log(`ForceReload menu item clicked in collapsed menu: ${subItem.text}`);
                        e.preventDefault();
                        window.location.href = subItem.path;
                        return;
                      }
                      
                      // Otherwise just close the sidebar
                      console.log('Regular menu item in collapsed menu, using default Link navigation');
                      onClose?.();
                    }}
                  >
                    {subItem.text}
                    {subItem.isNew && (
                      <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-500">New</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`bg-white h-screen border-r shadow-md transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0' : 'fixed -translate-x-full lg:translate-x-0 lg:sticky lg:top-0 z-30'
        } flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b h-16 flex-shrink-0">
          {!isCollapsed && (
            <div className="font-bold text-lg text-blue-600">Job Portal</div>
          )}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors lg:block hidden"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors lg:hidden ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto sidebar-scroll scrollbar-extra-light p-3"
        >
          <nav className="space-y-1">
            {menuItems.map(renderMenuItem)}
          </nav>
        </div>
        
        {/* Logout button at the bottom */}
        <div className="p-3 border-t mt-auto">
          <button
            onClick={handleLogout}
            className={`flex items-center p-2 w-full text-left rounded-md hover:bg-red-50 hover:text-red-600 transition-colors duration-200 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 text-gray-500" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;