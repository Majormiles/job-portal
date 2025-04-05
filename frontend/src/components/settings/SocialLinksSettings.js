import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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

// List of available social platforms
const SOCIAL_PLATFORMS = [
  { name: 'Facebook', icon: 'facebook', color: 'text-blue-600', pattern: /^(https?:\/\/)?(www\.|web\.|m\.)?facebook\.com(\/.*)?$/ },
  { name: 'Twitter', icon: 'twitter', color: 'text-blue-400', pattern: /^(https?:\/\/)?(www\.|mobile\.)?((twitter|x)\.com)(\/.*)?$/ },
  { name: 'Instagram', icon: 'instagram', color: 'text-pink-600', pattern: /^(https?:\/\/)?(www\.|m\.)?instagram\.com(\/.*)?$/ },
  { name: 'LinkedIn', icon: 'linkedin', color: 'text-blue-700', pattern: /^(https?:\/\/)?(www\.|mobile\.)?linkedin\.com(\/.*)?$/ },
  { name: 'YouTube', icon: 'youtube', color: 'text-red-600', pattern: /^(https?:\/\/)?(www\.|m\.)?youtube\.com(\/.*)?$/ },
  { name: 'GitHub', icon: 'github', color: 'text-gray-800', pattern: /^(https?:\/\/)?(www\.)?github\.com(\/.*)?$/ },
  { name: 'TikTok', icon: 'tiktok', color: 'text-black', pattern: /^(https?:\/\/)?(www\.|m\.)?tiktok\.com(\/.*)?$/ },
  { name: 'Pinterest', icon: 'pinterest', color: 'text-red-700', pattern: /^(https?:\/\/)?(www\.|m\.)?pinterest\.(com|ca|co\.uk)(\/.*)?$/ },
  { name: 'Snapchat', icon: 'snapchat', color: 'text-yellow-400', pattern: /^(https?:\/\/)?(www\.|accounts\.)?snapchat\.com(\/.*)?$/ },
  { name: 'Reddit', icon: 'reddit', color: 'text-orange-600', pattern: /^(https?:\/\/)?(www\.|old\.|new\.)?reddit\.com(\/.*)?$/ },
  { name: 'Medium', icon: 'medium', color: 'text-gray-800', pattern: /^(https?:\/\/)?(www\.)?medium\.com(\/.*)?$/ },
  { name: 'Discord', icon: 'discord', color: 'text-indigo-500', pattern: /^(https?:\/\/)?(www\.|invite\.)?discord\.(com|gg)(\/.*)?$/ },
  { name: 'Twitch', icon: 'twitch', color: 'text-purple-600', pattern: /^(https?:\/\/)?(www\.|m\.)?twitch\.tv(\/.*)?$/ },
  { name: 'Other', icon: 'link', color: 'text-gray-600', pattern: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+(\/.*)??$/ }
];

const SocialLinksSettings = () => {
  const { user, updateUserSettings } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const dropdownRef = useRef(null);

  // Load user social links when user data changes
  useEffect(() => {
    let isMounted = true;
    
    const loadSocialLinks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('User data changed, fetching social links:', user?.socialLinks);
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Initialize with user's social links or defaults
          if (user.socialLinks && Array.isArray(user.socialLinks) && user.socialLinks.length > 0) {
            console.log('Setting social links from user data:', user.socialLinks);
            setSocialLinks([...user.socialLinks]); // Create a new array to avoid reference issues
          } else {
            // Default initial social links if user doesn't have any
            const defaultLinks = [
              { id: 1, name: 'Facebook', icon: 'facebook', url: '' },
              { id: 2, name: 'Twitter', icon: 'twitter', url: '' }
            ];
            console.log('No social links found, using defaults:', defaultLinks);
            setSocialLinks(defaultLinks);
          }
        }
      } catch (error) {
        console.error('Error loading social links:', error);
        if (isMounted) {
          toast.error('Failed to load social links');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadSocialLinks();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [user]); // Only re-run if user object changes

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPlatformDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleUrlChange = (id, value) => {
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }

    setSocialLinks(socialLinks.map(link => 
      link.id === id ? { ...link, url: value } : link
    ));
  };

  const handleRemoveLink = (id) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
    
    // Remove any errors for this link
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const addNewSocialLink = () => {
    const newId = socialLinks.length > 0 ? Math.max(...socialLinks.map(link => link.id)) + 1 : 1;
    setSocialLinks([...socialLinks, { id: newId, name: 'Facebook', icon: 'facebook', url: '' }]);
  };

  const handleChangePlatform = (id, platform) => {
    // Get current link
    const currentLink = socialLinks.find(link => link.id === id);
    
    // If the platform has changed, clear the URL to prevent mismatches
    const needsUrlReset = currentLink && currentLink.name !== platform.name;
    
    setSocialLinks(socialLinks.map(link => 
      link.id === id ? { 
        ...link, 
        name: platform.name, 
        icon: platform.icon,
        url: needsUrlReset ? '' : link.url 
      } : link
    ));
    
    // Remove any errors for this link as the platform has changed
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    
    setShowPlatformDropdown(null);
  };

  // Get platform info
  const getPlatform = (platformName) => {
    return SOCIAL_PLATFORMS.find(p => p.name === platformName) || SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1];
  };

  // Validate URL format and platform match
  const validateUrl = (url, platformName) => {
    if (!url || url.trim() === '') return true; // Empty URLs are valid (but will be skipped on save)
    
    try {
      // Get the platform pattern
      const platform = getPlatform(platformName);
      const pattern = platform.pattern;
      
      // Check if URL matches the platform pattern
      if (!pattern.test(url)) {
        return false;
      }
      
      // Also try to create a URL object - if it fails, the URL is invalid
      try {
        new URL(url);
        return true;
      } catch (e) {
        // If URL doesn't start with http:// or https://, try prepending https://
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          try {
            new URL(`https://${url}`);
            return true;
          } catch (e) {
            return false;
          }
        }
        return false;
      }
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const validateAllUrls = () => {
    const newErrors = {};
    let isValid = true;

    socialLinks.forEach(link => {
      if (link.url) {
        // Skip validation for empty URLs (they're allowed but will be filtered out)
        if (link.url.trim() === '') return;
        
        if (!validateUrl(link.url, link.name)) {
          const platform = getPlatform(link.name);
          newErrors[link.id] = `This doesn't look like a valid ${link.name} URL`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Format URL to ensure it has the correct protocol
  const formatUrl = (url) => {
    if (!url || url.trim() === '') return '';
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const handleSaveChanges = async () => {
    // Validate URLs first
    if (!validateAllUrls()) {
      toast.error('Please correct the invalid URLs');
      return;
    }
    
    try {
      setSaving(true);
      setSaveSuccess(false);
      
      // Format URLs and filter out empty ones
      const formattedLinks = socialLinks
        .map(link => ({
          ...link,
          url: formatUrl(link.url)
        }))
        .filter(link => link.url.trim() !== '');
      
      console.log('Saving formatted social links:', formattedLinks);
      
      // Prepare settings data
      const settingsData = {
        socialLinks: formattedLinks
      };
      
      // Use the updateUserSettings function from context
      const response = await updateUserSettings(settingsData);
      
      console.log('Response from updateUserSettings:', response);
      
      if (response && response.success) {
        toast.success('Social links updated successfully!');
        setSaveSuccess(true);
        
        // Wait a short time to ensure user state is updated in AuthContext
        setTimeout(() => {
          if (user?.socialLinks) {
            console.log('Social links from updated user:', user.socialLinks);
          } else {
            console.log('No social links available in user object, using formatted links');
            setSocialLinks(formattedLinks);
          }
        }, 500);
        
        // Clear any errors
        setErrors({});
      } else {
        toast.error('Failed to save social links: ' + (response?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving social links:', error);
      toast.error('Failed to save social links: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
      
      // Hide success message after a delay
      if (saveSuccess) {
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    }
  };

  const getIconClass = (icon) => {
    const platform = SOCIAL_PLATFORMS.find(p => p.icon === icon);
    return platform ? platform.color : 'text-gray-600';
  };

  // Get placeholder for URL input based on platform
  const getUrlPlaceholder = (platformName) => {
    switch (platformName) {
      case 'Facebook':
        return 'facebook.com/yourprofile';
      case 'Twitter':
        return 'twitter.com/yourusername';
      case 'Instagram':
        return 'instagram.com/yourusername';
      case 'LinkedIn':
        return 'linkedin.com/in/yourprofile';
      case 'YouTube':
        return 'youtube.com/c/yourchannel';
      case 'GitHub':
        return 'github.com/yourusername';
      case 'TikTok':
        return 'tiktok.com/@yourusername';
      case 'Pinterest':
        return 'pinterest.com/yourusername';
      case 'Snapchat':
        return 'snapchat.com/add/yourusername';
      case 'Reddit':
        return 'reddit.com/user/yourusername';
      case 'Medium':
        return 'medium.com/@yourusername';
      case 'Discord':
        return 'discord.gg/yourserver';
      case 'Twitch':
        return 'twitch.tv/yourusername';
      default:
        return 'your-profile-url.com';
    }
  };

  const getIconSvg = (icon) => {
    switch (icon) {
      case 'facebook':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 320 512">
            <path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
          </svg>
        );
      case 'twitter':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512">
            <path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512">
            <path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 576 512">
            <path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512">
            <path fill="currentColor" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
          </svg>
        );
      case 'github':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 496 512">
            <path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1.6 1.6-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512">
            <path fill="currentColor" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
          </svg>
        );
      case 'pinterest':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 496 512">
            <path fill="currentColor" d="M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.6-78 113.6-24.3 0-42.6-20.1-36.7-44.8 7-29.5 20.5-61.3 20.5-82.6 0-19-10.2-34.9-31.4-34.9-24.9 0-44.9 25.7-44.9 60.2 0 22 7.4 36.8 7.4 36.8s-24.5 103.8-29 123.2c-5 21.4-3 51.6-.9 71.2C65.4 450.9 0 361.1 0 256 0 119 111 8 248 8s248 111 248 248z" />
          </svg>
        );
      case 'snapchat':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512">
            <path fill="currentColor" d="M496.926,366.6c-3.373-9.176-9.8-14.086-17.112-18.153-1.376-.806-2.641-1.451-3.72-1.947-2.182-1.128-4.414-2.22-6.634-3.373-22.8-12.09-40.609-27.341-52.959-45.42a102.889,102.889,0,0,1-9.089-16.12c-1.054-3.013-1-4.724-.248-6.287a10.221,10.221,0,0,1,2.914-3.038c3.918-2.591,7.96-5.22,10.7-6.993,4.885-3.162,8.754-5.667,11.246-7.44,9.362-6.547,15.909-13.5,20-21.278a42.371,42.371,0,0,0,2.1-35.191c-6.2-16.318-21.613-26.449-40.287-26.449a55.543,55.543,0,0,0-11.718,1.24c-1.806.4-3.019.667-3.812.878.012-.285.022-.564.034-.937.035-.808.093-1.679.141-2.616s.09-1.733.09-2.6c0-11.2-1.528-20.313-4.6-27.3-3.246-7.378-8.53-13.781-15.417-18.76-6.556-4.724-16.847-10.16-31.889-10.16a67.963,67.963,0,0,0-25.678,4.776,98.376,98.376,0,0,0-35.177,22.119,101.686,101.686,0,0,0-25.342,40,108.834,108.834,0,0,0-5.724,34.788,152.777,152.777,0,0,0,4.394,40.1c1.226,5.133,2.63,8.562,4.648,11.535,2.37,3.5,6.614,7.546,12.961,7.546,4.642,0,9.91-1.7,15.05-3.317,4.383-1.43,8.508-2.782,12.17-3.525a30.483,30.483,0,0,1,6.287-.645c6.709,0,10.9,3.071,13.29,9.743,1.633,4.546,1.1,4.828,2.42,11.061.663,3.144,1.324,6.3,2.208,9.441,3.377,11.861,7.4,14.2,12.5,14.2,3.576,0,7.935-1.418,14.019-4.48,5.7-2.9,13.718-6.777,23.548-6.777a40.987,40.987,0,0,1,17.018,3.5c5.631,2.927,11.6,6.97,17.3,10.828,4.6,3.187,9.347,6.362,14.262,9.388,5.969,3.664,9.651,5.821,14.6,5.821,6.932,0,12.047-5.3,13.895-9.5,2.06-4.656,2.5-10.7,1.345-16.677ZM477.17,64.813,466.383,71.44c-10.7,6.158-54.5,31.933-62.913,37.6-7.835,5.339-32.16,22.316-38.983,27.01l-1.541,1.083c-7.626,5.316-23.159,16.147-23.414,36.949-.087,5.776,1.181,11.966,3.762,18.482a89.458,89.458,0,0,0,7.864,14.622c23.583,34.286,51.166,50.916,82.12,49.121,9.882-.576,22.333-5.385,32.417-9.908l6.922-3.161c20.100-9.2,21.557-9.839,24.8-9.839a38.179,38.179,0,0,1,5.269.43,43.341,43.341,0,0,1,8,1.98l2.236.9c4.12,1.709,7.235,3.008,10.363,5.139,3.38,2.4,5.882,5.675,7.283,9.754a26.9,26.9,0,0,1,.907,14.65c-.6,2.145-1.027,4.336-1.4,6.506-1.824,10.156-3.7,20.662-13.852,26.33a29.953,29.953,0,0,1-14.089,3.5,51.524,51.524,0,0,1-12.965-1.78l-2.446-.673c-10-2.8-20.342-5.7-30.717-5.7a86.118,86.118,0,0,0-12.681.869,107.722,107.722,0,0,0-24.08,5.94,82.136,82.136,0,0,1-20.334,4.511,34.787,34.787,0,0,1-4.026.227,14.541,14.541,0,0,1-8.847-2.878c-3.347-2.44-6.378-6.877-9.019-13.2-2.009-4.766-3.6-10.153-5.131-15.354l-.944-3.2c-2.778-9.306-3.072-10.3-4.037-13.1-.685-2.356-1.333-3.667-1.985-4.527-1.273-1.672-3.3-2.458-6.679-2.777a44.1,44.1,0,0,0-9.68.411c-4.234.56-8.82,1.926-13.686,3.371-5.941,1.763-12.784,3.773-19.832,4.067a27.329,27.329,0,0,1-3.308.017l-.295-.025c-8.634-.451-15.264-5.884-18.563-9.709-4.867-5.649-8.795-13.6-11.088-22.343-2.361-8.9-3.892-19.023-4.741-31.055a139.314,139.314,0,0,1-.332-15.517c.089-2.725.272-5.449.543-8.095a102.58,102.58,0,0,1,5.569-25.66A89.227,89.227,0,0,1,195.116,89.6a89.006,89.006,0,0,1,30.692-19.885l1.089-.38a54.07,54.07,0,0,1,19.519-3.8c12.246,0,20.518,4.7,25.9,8.676,5.2,3.87,9.273,9.006,11.879,14.94,2.573,5.93,3.876,14.013,3.876,24.039,0,1.186-.04,2.359-.105,3.519-.117,1.953-.278,3.856-.428,5.688l-.211,2.668c-.48.495-.279,3.087.867,4.886a7.1,7.1,0,0,0,5.44,3.323c2.479.279,5.876.32,10.9-1.65,2.708-1.05,5.568-1.55,8.731-1.55a27.843,27.843,0,0,1,6.947.907,27.671,27.671,0,0,1,20.562,23.2,36.18,36.18,0,0,1-1.231,14.927,33.633,33.633,0,0,1-3.7,8.875c-5.715,10.09-13.442,16.236-24.474,21.262-11.346,5.259-19.049,8.817-23.277,12.38-1.537,1.246-6.222,5.034-.943,15.627a111.236,111.236,0,0,0,10.006,17.661c14.859,21.416,35.541,39.012,61.471,52.356,2.009,1.026,4.073,2.03,6.095,3.046l1.325.67c6.7,3.392,14.26,7.252,19.034,13.693,4.843,6.52,5.082,14.007,4.082,21.047a93.242,93.242,0,0,1-2.1,10.463c-1.5,6.05-2.92,11.763-2.92,17.275,0,7.376,1.653,12.025,5.361,15.057,3.918,3.208,8.947,3.867,14.541,3.867,10.775,0,22.973-4.256,27.306-5.678,10.473-3.393,36.012-16.9,57.7-28.34l2.442-1.3c11.033-5.9,20.1-10.735,25.308-13.644,7.843-4.339,18.683-8.589,32.069-12.553,6.514-1.808,7.073-10.387.832-12.587ZM269.151,433.848a7.055,7.055,0,0,0-3.95-2.007,7.769,7.769,0,0,0-4.282.466,22.328,22.328,0,0,1-8.744,1.639c-6.5,0-13.038-2.447-19.078-7.3-21.435-17.085-45.118-26.158-70.342-26.907-26.637-.8-50.226,8.19-70.281,26.728-6.038,5.574-12.861,8.281-19.076,8.281a20.742,20.742,0,0,1-7.8-1.417,8.243,8.243,0,0,0-8.318,1.572,8.483,8.483,0,0,0-2.878,6.457,8.626,8.626,0,0,0,3,6.482,83.254,83.254,0,0,0,42.109,21.756,128.688,128.688,0,0,0,25.062,2.572c43.135,0,80.975-20.2,107.075-57.042a8.356,8.356,0,0,0-3.508-10.279Z"/>
          </svg>
        );
      case 'reddit':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512">
            <path fill="currentColor" d="M201.5 305.5c-13.8 0-24.9-11.1-24.9-24.6 0-13.8 11.1-24.9 24.9-24.9 13.6 0 24.6 11.1 24.6 24.9 0 13.6-11.1 24.6-24.6 24.6zM504 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.6-78 113.6-24.3 0-42.6-20.1-36.7-44.8 7-29.5 20.5-61.3 20.5-82.6 0-19-10.2-34.9-31.4-34.9-24.9 0-44.9 25.7-44.9 60.2 0 22 7.4 36.8 7.4 36.8s-24.5 103.8-29 123.2c-5 21.4-3 51.6-.9 71.2C65.4 450.9 0 361.1 0 256 0 119 111 8 248 8s248 111 248 248z" />
          </svg>
        );
      case 'discord':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 640 512">
            <path fill="currentColor" d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"/>
          </svg>
        );
      case 'twitch':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512">
            <path fill="currentColor" d="M391.17,103.47H352.54v109.7h38.63ZM285,103H246.37V212.75H285ZM120.83,0,24.31,91.42V420.58H140.14V512l96.53-91.42h77.25L487.69,256V0M449.07,237.75l-77.22,73.12H294.61l-67.6,64v-64H140.14V36.58H449.07Z"/>
          </svg>
        );
      case 'medium':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 640 512">
            <path fill="currentColor" d="M180.5,74.262C80.813,74.262,0,155.633,0,256S80.819,437.738,180.5,437.738,361,356.373,361,256,280.191,74.262,180.5,74.262Zm288.25,10.646c-49.845,0-90.245,76.619-90.245,171.095s40.406,171.1,90.251,171.1,90.251-76.619,90.251-171.1H559C559,161.5,518.6,84.908,468.752,84.908Zm139.506,17.821c-17.526,0-31.735,68.628-31.735,153.274s14.2,153.274,31.735,153.274S640,340.631,640,256C640,171.351,625.785,102.729,608.258,102.729Z"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4">
      <ScrollToTop />
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-md p-4 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Social Media Profiles</h3>
              <p className="text-gray-600 text-sm mb-6">
                Add your social media profiles below. Make sure each URL matches its platform.
              </p>
              
              {saveSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Your social links have been saved successfully!</span>
                </div>
              )}
              
              {socialLinks.map((link, index) => (
                <div key={link.id} className="w-full mb-4">
                  <div className="text-gray-700 mb-2">
                    Social Link {index + 1}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <div 
                        onClick={() => setShowPlatformDropdown(showPlatformDropdown === link.id ? null : link.id)}
                        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md w-full sm:w-64 cursor-pointer"
                      >
                        <span className={`mr-2 ${getIconClass(link.icon)}`}>
                          {getIconSvg(link.icon)}
                        </span>
                        <span className="text-gray-700">{link.name}</span>
                        <span className="ml-auto">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                      
                      {/* Platform dropdown */}
                      {showPlatformDropdown === link.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        >
                          {SOCIAL_PLATFORMS.map((platform) => (
                            <div
                              key={platform.icon}
                              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleChangePlatform(link.id, platform)}
                            >
                              <span className={`mr-2 ${platform.color}`}>
                                {getIconSvg(platform.icon)}
                              </span>
                              <span className="text-gray-700">{platform.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleUrlChange(link.id, e.target.value)}
                        placeholder={getUrlPlaceholder(link.name)}
                        className={`w-full px-3 py-2 border ${errors[link.id] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-md focus:outline-none focus:ring-2`}
                      />
                      {errors[link.id] && (
                        <p className="mt-1 text-sm text-red-600">{errors[link.id]}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveLink(link.id)}
                      className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-md"
                    >
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addNewSocialLink}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center"
              >
                <svg className="h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Social Link
              </button>

              <div className="mt-8">
                <button 
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className={`px-6 py-3 ${saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md flex items-center`}
                >
                  {saving && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SocialLinksSettings;