// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header-one';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import About from './pages/About';
import Contact from './pages/Contact';
import Companies from './pages/Companies';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import PricingPlan from './pages/PricingPlan';
import JobDetail from './pages/JobDetails';
import './App.css';

// This wrapper component checks if we're on the home route
const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="App">
      {isHomePage && <Header />}
      <Routes>
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