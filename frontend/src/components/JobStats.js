import React from 'react';
import './css/JobStats.css';

const JobStats = ({ isBottom = false }) => {
  const stats = isBottom 
    ? [
        { count: '12k+', label: 'Clients worldwide', description: 'Trusted by thousands of companies across the globe' },
        { count: '20k+', label: 'Active resumes', description: 'Qualified candidates ready to fill your positions' },
        { count: '18k+', label: 'Companies', description: 'From startups to Fortune 500s using our platform' },
      ]
    : [
        { count: '25,000', label: 'Jobs Added', icon: 'fa-briefcase' },
        { count: '15,200', label: 'Active Users', icon: 'fa-users' },
        { count: '10,800', label: 'Jobs Filled', icon: 'fa-check-circle' },
      ];

  return (
    <section className={`job-stats ${isBottom ? 'bottom-stats' : ''}`}>
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-item" key={index}>
              {!isBottom && <i className={`fas ${stat.icon}`}></i>}
              <h3>{stat.count}</h3>
              <p className="stat-label">{stat.label}</p>
              {isBottom && <p className="stat-description">{stat.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobStats;