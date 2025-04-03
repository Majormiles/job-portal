// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import HeaderOne from './components/ui/Header-one';
import Header from './components/ui/Header';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import About from './pages/AboutPage';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import PricingPlan from './pages/PricingPlan';
import CheckoutPage from './pages/CheckoutPage';
import JobDetail from './pages/JobDetails';
import Dashboard from './pages/Dashboard';
import JobalertPage from './pages/JobalertPage';
import JobsApplied from './pages/JobsApplied';
import FavoriteJobs from './pages/FavoriteJobs';
import SettingsPage from './pages/SettingsPage';
import VerifyEmail from './pages/VerifyEmail';
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GoogleOAuthTest from './components/GoogleOAuthTest';
import { GoogleOAuthProvider } from './contexts/GoogleOAuthContext';
import EmailVerificationTest from './components/EmailVerificationTest';

// Onboarding Components
import PersonalInfo from './pages/onboarding/PersonalInfo';
import ProfessionalInfo from './pages/onboarding/ProfessionalInfo';
import Skills from './pages/onboarding/Skills';
import Preferences from './pages/onboarding/Preferences';
import Complete from './pages/onboarding/Complete';

// Admin Components
import MainLayout from './components/admin/components/layout/MainLayout';
import AdminLogin from './components/admin/pages/auth/Login';
import AdminDashboard from './components/admin/pages/Dashboard';
import AdminResume from './components/admin/pages/Resume';
import AdminCalendar from './components/admin/pages/Calendar';
import AdminCategories from './components/admin/pages/categories/Categories';
import AdminCreateCategory from './components/admin/pages/categories/CreateCategory';
import AdminReadCategory from './components/admin/pages/categories/ReadCategory';
import AdminJobs from './components/admin/pages/jobs/Jobs';
import AdminCreateJob from './components/admin/pages/jobs/CreateJob';
import AdminProfile from './components/admin/pages/Profile';
import AdminInvoice from './components/admin/pages/Invoice';
import AdminTimeline from './components/admin/pages/Timeline';
import AdminJobSeekers from './components/admin/pages/JobSeekers';
import AdminManageApplications from './components/admin/pages/ManageApplications';
import AdminJobApplicants from './components/admin/pages/JobApplicants';

import './App.css';

// Error Boundary Component
const ErrorBoundaryComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-4">We're sorry, but there was an error loading this page.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

// Onboarding Route Component
const OnboardingRoute = ({ children }) => {
  const { user, checkOnboardingStatus, isAuthenticated, loading } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isCheckingRef = useRef(false);

  useEffect(() => {
    const verifyOnboardingStatus = async () => {
      if (loading || !isAuthenticated) {
        return;
      }

      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        // Always check status on mount
        const status = await checkOnboardingStatus(true);
        setOnboardingStatus(status);

        // If onboarding is complete, redirect to dashboard
        if (status?.isComplete) {
          navigate('/dashboard_employee', { replace: true });
          return;
        }

        const sections = [
          { path: '/onboarding/personal-info', key: 'personalInfo' },
          { path: '/onboarding/professional-info', key: 'professionalInfo' },
          { path: '/onboarding/skills', key: 'skills' },
          { path: '/onboarding/preferences', key: 'preferences' },
          { path: '/onboarding/complete', key: 'complete' }
        ];

        const currentSectionIndex = sections.findIndex(section => section.path === location.pathname);
        
        // If we're not on a valid onboarding path, redirect to the first section
        if (currentSectionIndex === -1) {
          navigate(sections[0].path, { replace: true });
          return;
        }

        // Check if previous sections are complete
        for (let i = 0; i < currentSectionIndex; i++) {
          const section = sections[i];
          if (!status?.[section.key]?.completed) {
            navigate(section.path, { replace: true });
            return;
          }
        }

        // Check if current section is complete
        const currentSection = sections[currentSectionIndex];
        const currentSectionStatus = status?.[currentSection.key];

        if (currentSectionStatus?.completed && currentSectionIndex < sections.length - 1) {
          const nextSection = sections[currentSectionIndex + 1];
          navigate(nextSection.path, { replace: true });
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // If there's an error, redirect to login
        navigate('/login', { replace: true });
      } finally {
        isCheckingRef.current = false;
      }
    };

    verifyOnboardingStatus();
  }, [location.pathname, checkOnboardingStatus, navigate, loading, isAuthenticated]);

  // Show loading spinner while checking auth or onboarding status
  if (loading || !onboardingStatus) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// This wrapper component checks if we're on the home route
const AppContent = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isHomePage = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const isPublicRoute = location.pathname === '/jobs' || location.pathname === '/about' || location.pathname === '/contact' || location.pathname === '/job-detail' || location.pathname === '/pricing-plan';
  
  return (
    <div className="App">
      {/* Show Header-one only on home page */}
      {isHomePage && !isAuthRoute && !isOnboardingRoute && <HeaderOne />}
      {/* Show Header on other public pages */}
      {isPublicRoute && !isAuthRoute && !isOnboardingRoute && <Header />}
      <Routes>
        {/* Public Routes - Always accessible */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/job-detail" element={<JobDetail />} />
        <Route path="/pricing-plan" element={<PricingPlan />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route 
          path="/test-email-verification" 
          element={
            <ErrorBoundary>
              <EmailVerificationTest />
            </ErrorBoundary>
          } 
        />

        {/* Protected Routes - Only accessible when authenticated */}
        <Route
          path="/dashboard_employee"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applied-jobs"
          element={
            <ProtectedRoute>
              <JobsApplied />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/favorite-jobs"
          element={
            <ProtectedRoute>
              <FavoriteJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-alerts"
          element={
            <ProtectedRoute>
              <JobalertPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Onboarding Routes */}
        <Route
          path="/onboarding/personal-info"
          element={
            <OnboardingRoute>
              <PersonalInfo />
            </OnboardingRoute>
          }
        />
        <Route
          path="/onboarding/professional-info"
          element={
            <OnboardingRoute>
              <ProfessionalInfo />
            </OnboardingRoute>
          }
        />
        <Route
          path="/onboarding/skills"
          element={
            <OnboardingRoute>
              <Skills />
            </OnboardingRoute>
          }
        />
        <Route
          path="/onboarding/preferences"
          element={
            <OnboardingRoute>
              <Preferences />
            </OnboardingRoute>
          }
        />
        <Route
          path="/onboarding/complete"
          element={
            <OnboardingRoute>
              <Complete />
            </OnboardingRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<MainLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="login" element={<AdminLogin />} />
          <Route path="resume" element={<AdminResume />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/create" element={<AdminCreateCategory />} />
          <Route path="categories/:id" element={<AdminReadCategory />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="jobs/create" element={<AdminCreateJob />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="invoice" element={<AdminInvoice />} />
          <Route path="timeline" element={<AdminTimeline />} />
          <Route path="job-seekers" element={<AdminJobSeekers />} />
          <Route path="applications" element={<AdminManageApplications />} />
          <Route path="applicants" element={<AdminJobApplicants />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
      <Toaster position="top-right" />
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <GoogleOAuthProvider>
            <AppContent />
          </GoogleOAuthProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;