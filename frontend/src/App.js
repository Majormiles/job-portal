// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import HeaderOne from './components/ui/Header-one';
import Header from './components/ui/Header';
import Sidebar from './components/ui/Sidebar';
import RegisterPopup from './components/ui/RegisterPopup';
import ChatbotWidget from './components/ui/ChatbotWidget';
import Home from './pages/Home';
import About from './pages/About';
import CompanyGallery from './pages/CompanyGallery';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import PrivateRoute from './components/PrivateRoute';
import GoogleOAuthTest from './components/GoogleOAuthTest';
import { GoogleOAuthProvider } from './contexts/GoogleOAuthContext';
import EmailVerificationTest from './components/EmailVerificationTest';
import VerifyEmail from './pages/VerifyEmail';
import { NotificationProvider } from './contexts/NotificationContext';
import PaymentPage from './pages/PaymentPage';

// Dashboard Components for different user roles
import DashboardEmployer from './components/ui/DashboardEmployer';
import DashboardJobSeeker from './components/ui/DashboardJobSeeker';
import DashboardTrainer from './components/ui/DashboardTrainer';
import DashboardTrainee from './components/ui/DashboardTrainee';

// Onboarding Components
import PersonalInfo from './pages/onboarding/PersonalInfo';
import Skills from './pages/onboarding/Skills';
import Complete from './pages/onboarding/Complete';

// Admin Components
import MainLayout from './components/admin/components/layout/MainLayout';
import AdminLogin from './components/admin/pages/auth/adminLogin';
import AdminDashboard from './components/admin/pages/Dashboard';
import AdminResume from './components/admin/pages/Resume';
import AdminCalendar from './components/admin/pages/Calendar';
import AdminCategories from './components/admin/pages/categories/Categories';
import AdminCreateCategory from './components/admin/pages/categories/CreateCategory';
import AdminViewCategory from './components/admin/pages/categories/ViewCategory';
import AdminJobs from './components/admin/pages/jobs/Jobs';
import AdminCreateJob from './components/admin/pages/jobs/CreateJob';
import AdminViewJob from './components/admin/pages/jobs/ViewJob';
import AdminEditJob from './components/admin/pages/jobs/EditJob';
import AdminProfile from './components/admin/pages/Profile';
import AdminInvoice from './components/admin/pages/Invoice';
import AdminTimeline from './components/admin/pages/Timeline';
import AdminJobSeekers from './components/admin/pages/JobSeekers';
import AdminManageApplications from './components/admin/pages/ManageApplications';
import AdminJobApplicants from './components/admin/pages/JobApplicants';

// Import payment components
import { 
  PaymentDashboard,
  TransactionsPage,
  AnalyticsPage,
  ReportsPage,
  TransactionDetails,
  PaymentSettingsPage
} from './components/admin/pages/payments';

// Import NotificationsPage
import NotificationsPage from './components/admin/pages/NotificationsPage';

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
        // First check if payment is completed
        if (!user?.payment?.isPaid) {
          console.log("Payment not completed, redirecting to payment page");
          navigate('/payment', { replace: true });
          return;
        }

        // Always check status on mount
        const status = await checkOnboardingStatus(true);
        setOnboardingStatus(status);

        // If onboarding is complete, redirect to appropriate dashboard based on role
        if (status?.isComplete) {
          // Get the stored data first
          let userType = '';
          try {
            const storageStr = localStorage.getItem('registrationData');
            if (storageStr) {
              const storageData = JSON.parse(storageStr);
              userType = storageData.userType || storageData.talentType || '';
            }
          } catch (e) {
            console.error('Error checking storage for role:', e);
          }
          
          // Determine which dashboard to redirect to based on user role
          const isEmployer = user?.role === 'employer' || 
                           (typeof user?.role === 'object' && user?.role?.name === 'employer') ||
                           user?.userType === 'employer' ||
                           user?.roleName === 'employer' ||
                           userType === 'employer';
                           
          const isTrainer = user?.role === 'trainer' || 
                           (typeof user?.role === 'object' && user?.role?.name === 'trainer') ||
                           user?.userType === 'trainer' ||
                           user?.roleName === 'trainer' ||
                           userType === 'trainer';
                           
          const isTrainee = user?.role === 'trainee' || 
                           (typeof user?.role === 'object' && user?.role?.name === 'trainee') ||
                           user?.userType === 'trainee' ||
                           user?.roleName === 'trainee' ||
                           userType === 'trainee';
          
          console.log('OnboardingRoute redirecting to dashboard for role type:', 
                      isEmployer ? 'employer' : 
                      isTrainer ? 'trainer' : 
                      isTrainee ? 'trainee' : 'job seeker');
          
          // Navigate to the appropriate dashboard
          if (isEmployer) {
            navigate('/dashboard-employer', { replace: true });
          } else if (isTrainer) {
            navigate('/dashboard-trainer', { replace: true });
          } else if (isTrainee) {
            navigate('/dashboard-trainee', { replace: true });
          } else {
            navigate('/dashboard-jobseeker', { replace: true });
          }
          return;
        }

        const sections = [
          { path: '/onboarding/personal-info', key: 'personalInfo' },
          { path: '/onboarding/skills', key: 'skills' },
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
        console.error("Error in onboarding route check:", error);
      } finally {
        isCheckingRef.current = false;
      }
    };

    verifyOnboardingStatus();
  }, [loading, isAuthenticated, user, location.pathname, navigate, checkOnboardingStatus]);

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

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Check for admin token
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsAuthorized(false);
          setLoading(false);
          return;
        }
        
        // Validate token by making a request to a protected admin endpoint
        try {
          // Make a simple request to verify admin access - use a simple GET request to dashboard
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/stats`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            setIsAuthenticated(true);
            setIsAuthorized(true);
          } else if (response.status === 403) {
            // User is authenticated but not admin
            setIsAuthenticated(true);
            setIsAuthorized(false);
            // Clear admin token as it might be a regular user token
            localStorage.removeItem('adminToken');
            // Show error message
            alert('You do not have permission to access the admin area');
            // Redirect to home
            navigate('/');
          } else {
            // Any other error means token is invalid
            setIsAuthenticated(false);
            setIsAuthorized(false);
            localStorage.removeItem('adminToken');
          }
        } catch (error) {
          console.error('Admin access verification failed:', error);
          // Don't fallback to token check - assume auth failed if request fails
          setIsAuthenticated(false);
          setIsAuthorized(false);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAuthorized) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

// This wrapper component checks if we're on the home route
const AppContent = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isHomePage = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminLoginRoute = location.pathname === '/admin/login';
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const isPublicRoute = location.pathname === '/about' || location.pathname === '/contact' || location.pathname === '/gallery';
  
  return (
    <div className="App">
      {/* Show Header-one only on home page */}
      {isHomePage && !isAuthRoute && !isOnboardingRoute && !isAdminRoute && <HeaderOne />}
      {/* Show Header on other public pages */}
      {isPublicRoute && !isAuthRoute && !isOnboardingRoute && !isAdminRoute && <Header />}
      
      {/* Show RegisterPopup only for non-authenticated users on public pages */}
      {!isAuthenticated && (isHomePage || isPublicRoute) && !isAuthRoute && !isAdminRoute && <RegisterPopup />}
      
      <Routes>
        {/* Public Routes - Always accessible */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<CompanyGallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/payment" element={<PaymentPage />} />
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
        
        {/* Role-specific Dashboard routes */}
        <Route
          path="/dashboard-employer"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard-jobseeker"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* New Trainer Dashboard Route */}
        <Route
          path="/dashboard-trainer"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* New Trainee Dashboard Route */}
        <Route
          path="/dashboard-trainee"
          element={
            <ProtectedRoute>
              <Dashboard />
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
          path="/onboarding/skills"
          element={
            <OnboardingRoute>
              <Skills />
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
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* All other admin routes wrapped in AdminProtectedRoute and MainLayout */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <MainLayout />
          </AdminProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="resume" element={<AdminResume />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/create" element={<AdminCreateCategory />} />
          <Route path="categories/view/:id" element={<AdminViewCategory />} />
          <Route path="categories/edit/:id" element={<AdminCreateCategory />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="jobs/create" element={<AdminCreateJob />} />
          <Route path="jobs/view/:id" element={<AdminViewJob />} />
          <Route path="jobs/edit/:id" element={<AdminEditJob />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="invoice" element={<AdminInvoice />} />
          <Route path="timeline" element={<AdminTimeline />} />
          <Route path="job-seekers" element={<AdminJobSeekers />} />
          <Route path="manage-applications" element={<AdminManageApplications />} />
          <Route path="job-applicants" element={<AdminJobApplicants />} />
          
          {/* Payment Portal Routes */}
          <Route path="payments" element={<PaymentDashboard />} />
          <Route path="payments/transactions" element={<TransactionsPage />} />
          <Route path="payments/transactions/:id" element={<TransactionDetails />} />
          <Route path="payments/analytics" element={<AnalyticsPage />} />
          <Route path="payments/reports" element={<ReportsPage />} />
          <Route path="payments/settings" element={<PaymentSettingsPage />} />

          {/* Notifications Route */}
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Add ChatbotWidget to all pages except admin section */}
      {!isAdminRoute && <ChatbotWidget />}
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <ErrorBoundary fallback={<ErrorBoundaryComponent />}>
      <Router>
        <GoogleOAuthProvider>
          <AuthProvider>
            <SettingsWrappedRoutes />
          </AuthProvider>
        </GoogleOAuthProvider>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Toaster position="top-right" />
    </ErrorBoundary>
  );
};

// Component that conditionally wraps routes with SettingsProvider
const SettingsWrappedRoutes = () => {
  const { pathname } = useLocation();
  
  // Define which routes need the SettingsProvider
  const needsSettingsProvider = (path) => {
    return path.startsWith('/settings') || path.includes('settings');
  };
  
  return needsSettingsProvider(pathname) ? (
    <SettingsProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </SettingsProvider>
  ) : (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;