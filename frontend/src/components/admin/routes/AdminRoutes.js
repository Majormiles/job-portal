import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Categories from '../pages/Categories';
import CategoryCreate from '../pages/CategoryCreate';
import CategoryEdit from '../pages/CategoryEdit';
import Profile from '../pages/Profile';
import Resume from '../pages/Resume';
import Calendar from '../pages/Calendar';
import Jobs from '../pages/Jobs';
import JobCreate from '../pages/JobCreate';
import JobEdit from '../pages/JobEdit';
import Invoice from '../pages/Invoice';

// Import payment portal components
import { 
  PaymentDashboard,
  TransactionsPage,
  AnalyticsPage,
  ReportsPage
} from '../pages/payments';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Categories Routes */}
        <Route path="categories">
          <Route index element={<Categories />} />
          <Route path="create" element={<CategoryCreate />} />
          <Route path="edit/:id" element={<CategoryEdit />} />
        </Route>

        {/* Resume Routes */}
        <Route path="resume" element={<Resume />} />
        <Route path="calendar" element={<Calendar />} />

        {/* Jobs Routes */}
        <Route path="jobs">
          <Route index element={<Jobs />} />
          <Route path="create" element={<JobCreate />} />
          <Route path="edit/:id" element={<JobEdit />} />
        </Route>
        <Route path="invoice" element={<Invoice />} />

        {/* Payment Portal Routes */}
        <Route path="payments">
          <Route index element={<PaymentDashboard />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes; 