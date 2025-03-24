import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlignJustify, 
  Maximize, 
  Mail, 
  Bell, 
  User,
  Menu
} from 'react-feather';

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="navbar navbar-expand-lg main-navbar sticky">
      <div className="form-inline mr-auto">
        <ul className="navbar-nav mr-3">
          <li>
            <button className="menu-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
          </li>
          <li>
            <a href="#" className="nav-link nav-link-lg fullscreen-btn">
              <Maximize />
            </a>
          </li>
          <li>
            <form className="form-inline mr-auto">
              <div className="search-element">
                <input className="form-control" type="search" placeholder="Search" aria-label="Search" data-width="200" />
                <button className="btn" type="submit">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
          </li>
        </ul>
      </div>
      <ul className="navbar-nav navbar-right">
        <li className="dropdown dropdown-list-toggle">
          <a href="#" data-toggle="dropdown" className="nav-link nav-link-lg message-toggle">
            <Mail />
            <span className="badge headerBadge1">6</span>
          </a>
          <div className="dropdown-menu dropdown-list dropdown-menu-right pullDown">
            <div className="dropdown-header">
              Messages
              <div className="float-right">
                <a href="#">Mark All As Read</a>
              </div>
            </div>
            <div className="dropdown-list-content dropdown-list-message">
              {/* Message items will be mapped here */}
            </div>
            <div className="dropdown-footer text-center">
              <a href="#">View All <i className="fas fa-chevron-right"></i></a>
            </div>
          </div>
        </li>
        <li className="dropdown dropdown-list-toggle">
          <div className="dropdown-menu dropdown-list dropdown-menu-right pullDown">
            <div className="dropdown-header">
              Notifications
              <div className="float-right">
                <a href="#">Mark All As Read</a>
              </div>
            </div>
            <div className="dropdown-list-content dropdown-list-icons">
              {/* Notification items will be mapped here */}
            </div>
            <div className="dropdown-footer text-center">
              <a href="#">View All <i className="fas fa-chevron-right"></i></a>
            </div>
          </div>
        </li>
        <li className="dropdown">
          <a href="#" data-toggle="dropdown" className="nav-link dropdown-toggle nav-link-lg nav-link-user">
            <img alt="image" src="/assets/img/user.png" className="user-img-radious-style" />
            <span className="d-sm-none d-lg-inline-block"></span>
          </a>
          <div className="dropdown-menu dropdown-menu-right pullDown">
            <div className="dropdown-title">Hello Sarah Smith</div>
            <Link to="/profile" className="dropdown-item has-icon">
              <i className="far fa-user"></i> Profile
            </Link>
            <Link to="/timeline" className="dropdown-item has-icon">
              <i className="fas fa-bolt"></i> Activities
            </Link>
            <a href="#" className="dropdown-item has-icon">
              <i className="fas fa-cog"></i> Settings
            </a>
            <div className="dropdown-divider"></div>
            <Link to="/auth/login" className="dropdown-item has-icon text-danger">
              <i className="fas fa-sign-out-alt"></i> Logout
            </Link>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 