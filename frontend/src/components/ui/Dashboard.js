import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardTrainer from './DashboardTrainer';
import DashboardTrainee from './DashboardTrainee';
import DashboardEmployer from './DashboardEmployer';
import DashboardJobSeeker from './DashboardJobSeeker';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const determineUserRole = () => {
      setLoading(true);
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      // Check for user roles - first look for role property
      if (user.role) {
        if (typeof user.role === 'string') {
          setUserRole(user.role.toLowerCase());
        } else if (user.role.name) {
          setUserRole(user.role.name.toLowerCase());
        }
      } 
      // Then check for userType property
      else if (user.userType) {
        setUserRole(user.userType.toLowerCase());
      } 
      // Then check for type property
      else if (user.type) {
        setUserRole(user.type.toLowerCase());
      }
      // Fallback to checking local storage tags
      else {
        const isEmployer = localStorage.getItem('isEmployer') === 'true';
        const isTrainer = localStorage.getItem('isTrainer') === 'true';
        const isTrainee = localStorage.getItem('isTrainee') === 'true';
        
        if (isEmployer) {
          setUserRole('employer');
        } else if (isTrainer) {
          setUserRole('trainer');
        } else if (isTrainee) {
          setUserRole('trainee');
        } else {
          // Default fallback
          setUserRole('jobseeker');
        }
      }
      
      setLoading(false);
    };

    determineUserRole();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Please Sign In</h2>
        <p className="text-gray-600">You need to be logged in to view the dashboard.</p>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (userRole) {
      case 'trainer':
        return <DashboardTrainer />;
      case 'trainee':
        return <DashboardTrainee />;
      case 'employer':
        return <DashboardEmployer />;
      case 'jobseeker':
      case 'job_seeker':
      case 'job-seeker':
        return <DashboardJobSeeker />;
      default:
        // Fallback to job seeker dashboard if role is unknown
        return <DashboardJobSeeker />;
    }
  };

  return (
    <div className="dashboard-wrapper">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard; 