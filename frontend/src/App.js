// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/ui/Header-one';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import About from './pages/AboutPage';
import Contact from './pages/Contact';
import Companies from './pages/Companies';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import PricingPlan from './pages/PricingPlan';
import CheckoutPage from './pages/CheckoutPage';
import JobDetail from './pages/JobDetails';
import Dashboard from './pages/Dashboard';
import JobsApplied from './pages/JobsApplied';
import FavoriteJobs from './pages/FavoriteJobs';
import SettingsPage from './pages/SettingsPage';

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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, onboardingStatus, currentOnboardingStep } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user needs to complete onboarding
  if (!onboardingStatus?.isComplete) {
    const onboardingPath = `/onboarding/${currentOnboardingStep}`;
    return <Navigate to={onboardingPath} replace />;
  }

  return children;
};

// This wrapper component checks if we're on the home route
const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  
  return (
    <div className="App">
      {isHomePage && !isOnboardingRoute && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/job-detail" element={<JobDetail />} />
        <Route path="/pricing-plan" element={<PricingPlan />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Protected Routes */}
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
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Onboarding Routes */}
        <Route path="/onboarding">
          <Route path="personal-info" element={<PersonalInfo />} />
          <Route path="professional-info" element={<ProfessionalInfo />} />
          <Route path="skills" element={<Skills />} />
          <Route path="preferences" element={<Preferences />} />
          <Route path="complete" element={<Complete />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="resume" element={<AdminResume />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/create" element={<AdminCreateCategory />} />
            <Route path="categories/read" element={<AdminReadCategory />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="jobs/create" element={<AdminCreateJob />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="invoice" element={<AdminInvoice />} />
            <Route path="timeline" element={<AdminTimeline />} />
            <Route path="job-seekers" element={<AdminJobSeekers />} />
            <Route path="manage-applications" element={<AdminManageApplications />} />
            <Route path="job-applicants/:categoryId/:jobId" element={<AdminJobApplicants />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;