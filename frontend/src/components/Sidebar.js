
// components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './css/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">CANDIDATE DASHBOARD</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard_employee" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <i className="far fa-layer-group"></i>
          </div>
          <span>Overview</span>
        </NavLink>
        <NavLink to="/applied-jobs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <i className="far fa-briefcase"></i>
          </div>
          <span>Applied Jobs</span>
        </NavLink>
        <NavLink to="/favorite-jobs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <i className="far fa-bookmark"></i>
          </div>
          <span>Favorite Jobs</span>
        </NavLink>
        <NavLink to="/job-alert" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <i className="far fa-bell"></i>
          </div>
          <span>Job Alert</span>
          <div className="alert-badge">09</div>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">
            <i className="far fa-cog"></i>
          </div>
          <span>Settings</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn">
          <i className="far fa-sign-out"></i>
          <span>Log-out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
