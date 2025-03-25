import React, { useState } from 'react';
import { Search, Users, Briefcase, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JobSeekers = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Sample data for job categories and their applicants
  const jobCategories = [
    {
      id: 1,
      name: 'Software Development',
      icon: 'code',
      totalApplicants: 156,
      jobs: [
        { id: 101, name: 'Software Engineer', applicants: 89 },
        { id: 102, name: 'Full Stack Developer', applicants: 45 },
        { id: 103, name: 'DevOps Engineer', applicants: 22 }
      ]
    },
    {
      id: 2,
      name: 'Design & Creative',
      icon: 'palette',
      totalApplicants: 98,
      jobs: [
        { id: 201, name: 'UI/UX Designer', applicants: 45 },
        { id: 202, name: 'Graphic Designer', applicants: 33 },
        { id: 203, name: 'Product Designer', applicants: 20 }
      ]
    },
    {
      id: 3,
      name: 'Business & Management',
      icon: 'briefcase',
      totalApplicants: 145,
      jobs: [
        { id: 301, name: 'Project Manager', applicants: 65 },
        { id: 302, name: 'Business Analyst', applicants: 45 },
        { id: 303, name: 'Product Manager', applicants: 35 }
      ]
    },
    {
      id: 4,
      name: 'Marketing & Sales',
      icon: 'trending-up',
      totalApplicants: 112,
      jobs: [
        { id: 401, name: 'Marketing Manager', applicants: 45 },
        { id: 402, name: 'Sales Executive', applicants: 42 },
        { id: 403, name: 'Digital Marketing', applicants: 25 }
      ]
    }
  ];

  const filteredCategories = jobCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJobClick = (categoryId, jobId) => {
    navigate(`/job-applicants/${categoryId}/${jobId}`);
  };

  return (
    <div className="section">
      <div className="section-header">
        <h1>Job Categories</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item active">Dashboard</div>
          <div className="breadcrumb-item">Categories</div>
        </div>
      </div>

      <div className="section-body">
        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary">
                      <Search size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="row">
          {filteredCategories.map((category) => (
            <div key={category.id} className="col-12 col-md-6 col-lg-3">
              <div 
                className={`card ${selectedCategory?.id === category.id ? 'card-primary' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedCategory(selectedCategory?.id === category.id ? null : category)}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="card-icon-wrapper mr-3">
                      <i className={`fas fa-${category.icon} fa-2x`}></i>
                    </div>
                    <div>
                      <h6 className="card-title mb-0">{category.name}</h6>
                      <div className="text-muted small">
                        {category.totalApplicants} Total Applicants
                      </div>
                    </div>
                  </div>

                  {/* Show job breakdown when category is selected */}
                  {selectedCategory?.id === category.id && (
                    <div className="mt-3">
                      <div className="text-muted small mb-2">Applicants by Job:</div>
                      {category.jobs.map((job) => (
                        <div 
                          key={job.id} 
                          className="d-flex justify-content-between align-items-center mb-2 job-item"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJobClick(category.id, job.id);
                          }}
                        >
                          <span className="text-muted">{job.name}</span>
                          <span className="badge badge-primary">{job.applicants}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobSeekers; 