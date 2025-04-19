import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, ExternalLink, Menu, X, User } from 'react-feather';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';
// CSS is handled via Tailwind classes, no need for a separate CSS file

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [dashboardPath, setDashboardPath] = useState('/dashboard-jobseeker');
  const { user } = useAuth();

  // Determine appropriate dashboard path based on user role
  useEffect(() => {
    const isEmployer = user?.role === 'employer' ||
      (typeof user?.role === 'object' && user?.role?.name === 'employer') ||
      user?.userType === 'employer' ||
      localStorage.getItem('registrationData') &&
      JSON.parse(localStorage.getItem('registrationData'))?.userType === 'employer';

    setDashboardPath(isEmployer ? '/dashboard-employer' : '/dashboard-jobseeker');
  }, [user]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search for:', searchValue);
    // Implement search functionality
  };

  return (
    <header className={`header fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-gradient-to-r '}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <nav className="hidden md:flex items-center justify-between flex-1 ml-10">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative ml-20">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search..."
                className={`w-64 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isScrolled
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-white/20 text-white placeholder-white/80 backdrop-blur-sm'
                  }`}
              />
              <Search
                className={`absolute left-3 top-2.5 w-5 h-5 ${isScrolled ? 'text-gray-500' : 'text-white/80'
                  }`}
              />
            </form>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <NavLink
                to={dashboardPath}
                className={({ isActive }) => `font-medium hover:opacity-80 transition-opacity ${isScrolled ? 'text-gray-700' : 'text-white'} ${isActive ? 'opacity-100' : 'opacity-80'}`}
              >
                Home
              </NavLink>
              <NavLink
                to="/features"
                className={({ isActive }) => `font-medium hover:opacity-80 transition-opacity ${isScrolled ? 'text-gray-700' : 'text-white'} ${isActive ? 'opacity-100' : 'opacity-80'}`}
              >
                Features
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) => `font-medium hover:opacity-80 transition-opacity ${isScrolled ? 'text-gray-700' : 'text-white'} ${isActive ? 'opacity-100' : 'opacity-80'}`}
              >
                About
              </NavLink>

              {/* Add NotificationBell */}
              <div className={isScrolled ? 'text-gray-700' : 'text-white'}>
                <NotificationBell />
              </div>

              <Link to="/"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
              >
                <span>Visit Site</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-md focus:outline-none ${isScrolled ? 'text-gray-800' : 'text-white'
                }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative mt-2">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
            </form>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-3 pt-2">
              <NavLink
                to={dashboardPath}
                className={({ isActive }) => `font-medium px-3 py-2 rounded-md ${isActive ? 'bg-gray-100' : ''}`}
              >
                Home
              </NavLink>
              <NavLink
                to="/features"
                className={({ isActive }) => `font-medium px-3 py-2 rounded-md ${isActive ? 'bg-gray-100' : ''}`}
              >
                Features
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) => `font-medium px-3 py-2 rounded-md ${isActive ? 'bg-gray-100' : ''}`}
              >
                About
              </NavLink>

              {/* Add NotificationBell to mobile menu */}
              <div className="flex items-center px-3 py-2">
                <span className="mr-2">Notifications</span>
                <NotificationBell />
              </div>

              <Link to="/"
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-md font-medium"
              >
                <span>Visit Site</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;