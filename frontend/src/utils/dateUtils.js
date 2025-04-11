/**
 * Format a date string to a human-readable format
 * @param {string|Date} dateString - The date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Default formatting options
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString.toString();
  }
};

/**
 * Calculate time elapsed since a given date
 * @param {string|Date} dateString - The date to calculate from
 * @returns {string} Human-readable time elapsed (e.g., "2 days ago")
 */
export const timeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  // Time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (diffInSeconds < minute) {
    return diffInSeconds === 1 ? '1 second ago' : `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffInSeconds / year);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
};

/**
 * Format a date as a relative time (today, yesterday, or date)
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted relative date
 */
export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time portion for accurate date comparison
  const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayWithoutTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  if (dateWithoutTime.getTime() === nowWithoutTime.getTime()) {
    return 'Today';
  } else if (dateWithoutTime.getTime() === yesterdayWithoutTime.getTime()) {
    return 'Yesterday';
  } else {
    return formatDate(date);
  }
};

export default {
  formatDate,
  timeAgo,
  formatRelativeDate
}; 