// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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

// Admin Components
import AdminMainLayout from './components/admin/src/components/layout/MainLayout';
import AdminLogin from './components/admin/src/pages/auth/Login';
import AdminDashboard from './components/admin/src/pages/Dashboard';
import AdminResume from './components/admin/src/pages/Resume';
import AdminCalendar from './components/admin/src/pages/Calendar';
import AdminCategories from './components/admin/src/pages/categories/Categories';
import AdminCreateCategory from './components/admin/src/pages/categories/CreateCategory';
import AdminReadCategory from './components/admin/src/pages/categories/ReadCategory';
import AdminJobs from './components/admin/src/pages/jobs/Jobs';
import AdminCreateJob from './components/admin/src/pages/jobs/CreateJob';
import AdminProfile from './components/admin/src/pages/Profile';
import AdminInvoice from './components/admin/src/pages/Invoice';
import AdminTimeline from './components/admin/src/pages/Timeline';
import AdminJobSeekers from './components/admin/src/pages/JobSeekers';
import AdminManageApplications from './components/admin/src/pages/ManageApplications';
import AdminJobApplicants from './components/admin/src/pages/JobApplicants';

import './App.css';

// This wrapper component checks if we're on the home route
const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="App">
      {isHomePage && <Header />}
      <Routes>
        {/* Frontend Routes */}
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
        <Route path="/dashboard_employee" element={<Dashboard />} />
        <Route path="/applied-jobs" element={<JobsApplied />} />
        <Route path="/favorite-jobs" element={<FavoriteJobs />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Admin Routes */}
        <Route path="/admin">
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route element={<AdminMainLayout />}>
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

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;