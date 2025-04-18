import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Download, Mail, Phone, Briefcase, GraduationCap, Calendar } from 'lucide-react';

const JobApplicants = () => {
  const { categoryId, jobId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for applicants
  const applicants = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234 567 890',
      avatar: '/assets/img/avatar/avatar-1.png',
      experience: '5 years',
      education: 'BS in Computer Science',
      appliedDate: '2024-03-15',
      status: 'new',
      resume: '/path/to/resume.pdf',
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      currentCompany: 'Tech Corp',
      expectedSalary: '$80,000 - $100,000'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 234 567 891',
      avatar: '/assets/img/avatar/avatar-2.png',
      experience: '3 years',
      education: 'Master in UI/UX Design',
      appliedDate: '2024-03-14',
      status: 'review',
      resume: '/path/to/resume.pdf',
      skills: ['UI/UX', 'Figma', 'Adobe XD', 'Prototyping'],
      currentCompany: 'Design Studio',
      expectedSalary: '$70,000 - $90,000'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1 234 567 892',
      avatar: '/assets/img/avatar/avatar-3.png',
      experience: '8 years',
      education: 'MBA',
      appliedDate: '2024-03-13',
      status: 'shortlisted',
      resume: '/path/to/resume.pdf',
      skills: ['Project Management', 'Agile', 'Leadership', 'Risk Management'],
      currentCompany: 'Business Solutions',
      expectedSalary: '$100,000 - $120,000'
    }
  ];

  const filteredApplicants = applicants.filter(applicant =>
    applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    applicant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'info', text: 'New' },
      review: { color: 'warning', text: 'In Review' },
      shortlisted: { color: 'success', text: 'Shortlisted' },
      rejected: { color: 'danger', text: 'Rejected' },
      accepted: { color: 'primary', text: 'Accepted' }
    };

    const config = statusConfig[status];
    return <span className={`badge badge-${config.color}`}>{config.text}</span>;
  };

  return (
    <div className="section-body">
      <div className="section-header">
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-link mr-3"
            onClick={() => navigate('/job-seekers')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Job Applicants</h1>
            <div className="section-header-breadcrumb">
              <div className="breadcrumb-item active">Dashboard</div>
              <div className="breadcrumb-item">Categories</div>
              <div className="breadcrumb-item">Applicants</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-body">
        {/* Search and Filter */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search applicants..."
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

        {/* Applicants List */}
        <div className="row">
          <div className="col-12">
            {filteredApplicants.map((applicant) => (
              <div key={applicant.id} className="card mb-4">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <img
                      alt="avatar"
                      src={applicant.avatar}
                      className="rounded-circle mr-3"
                      width="64"
                      height="64"
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-1">{applicant.name}</h5>
                        {getStatusBadge(applicant.status)}
                      </div>
                      <div className="text-muted">
                        <Mail size={14} className="mr-1" />
                        {applicant.email}
                        <Phone size={14} className="ml-3 mr-1" />
                        {applicant.phone}
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.open(applicant.resume, '_blank')}
                    >
                      <Download size={16} className="mr-1" />
                      Resume
                    </button>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <Briefcase size={16} className="mr-1" />
                          Experience
                        </h6>
                        <p className="mb-1">{applicant.experience}</p>
                        <p className="text-muted small">Current: {applicant.currentCompany}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <GraduationCap size={16} className="mr-1" />
                          Education
                        </h6>
                        <p>{applicant.education}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">Skills</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {applicant.skills.map((skill, index) => (
                            <span key={index} className="badge badge-light">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <Calendar size={16} className="mr-1" />
                          Application Details
                        </h6>
                        <p className="mb-1">Applied: {applicant.appliedDate}</p>
                        <p className="mb-1">Expected Salary: {applicant.expectedSalary}</p>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-3">
                    <button className="btn btn-success mr-2">
                      Accept
                    </button>
                    <button className="btn btn-warning mr-2">
                      Shortlist
                    </button>
                    <button className="btn btn-danger">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  
    </div>
  );
};

export default JobApplicants; 