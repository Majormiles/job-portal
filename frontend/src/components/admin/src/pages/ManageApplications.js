import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Star, Clock, Download, Eye } from 'lucide-react';

const ManageApplications = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');


  const applications = [
    {
      id: 1,
      applicant: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 234 567 890',
        avatar: '/assets/img/users/user-1.png'
      },
      job: {
        title: 'Senior Software Engineer',
        category: 'Software Development',
        postedDate: '2024-03-01'
      },
      application: {
        date: '2024-03-15',
        status: 'new',
        resume: '/path/to/resume.pdf'
      },
      experience: '5 years',
      education: 'BS in Computer Science'
    },
    {
      id: 2,
      applicant: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 234 567 891',
        avatar: '/assets/img/users/user-2.png'
      },
      job: {
        title: 'UI/UX Designer',
        category: 'Design & Creative',
        postedDate: '2024-03-05'
      },
      application: {
        date: '2024-03-14',
        status: 'review',
        resume: '/path/to/resume.pdf'
      },
      experience: '3 years',
      education: 'Master in UI/UX Design'
    },
    {
      id: 3,
      applicant: {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1 234 567 892',
        avatar: '/assets/img/users/user-3.png'
      },
      job: {
        title: 'Project Manager',
        category: 'Business & Management',
        postedDate: '2024-03-10'
      },
      application: {
        date: '2024-03-13',
        status: 'shortlisted',
        resume: '/path/to/resume.pdf'
      },
      experience: '8 years',
      education: 'MBA'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'info', icon: Clock, text: 'New' },
      review: { color: 'warning', icon: Eye, text: 'In Review' },
      shortlisted: { color: 'success', icon: Star, text: 'Shortlisted' },
      rejected: { color: 'danger', icon: XCircle, text: 'Rejected' },
      accepted: { color: 'primary', icon: CheckCircle, text: 'Accepted' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`badge badge-${config.color}`}>
        <Icon size={14} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const handleStatusChange = (applicationId, newStatus) => {
    // Here you would typically make an API call to update the status
    console.log(`Updating application ${applicationId} to status ${newStatus}`);
  };

  return (
    <div className="section">
      <div className="section-header">
        <h1>Manage Applications</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item active">Dashboard</div>
          <div className="breadcrumb-item">Applications</div>
        </div>
      </div>

      <div className="section-body">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h4>All Applications</h4>
                <div className="card-header-form">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search applications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="input-group-btn">
                      <button className="btn btn-primary">
                        <Search size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Job Details</th>
                        <th>Experience</th>
                        <th>Education</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                alt="avatar"
                                src={app.applicant.avatar}
                                className="rounded-circle mr-2"
                                width="32"
                                height="32"
                              />
                              <div>
                                <div className="font-weight-bold">{app.applicant.name}</div>
                                <div className="text-muted small">{app.applicant.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="font-weight-bold">{app.job.title}</div>
                            <div className="text-muted small">{app.job.category}</div>
                          </td>
                          <td>{app.experience}</td>
                          <td>{app.education}</td>
                          <td>{app.application.date}</td>
                          <td>{getStatusBadge(app.application.status)}</td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-success mr-1"
                                onClick={() => handleStatusChange(app.id, 'accepted')}
                                title="Accept"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                className="btn btn-sm btn-warning mr-1"
                                onClick={() => handleStatusChange(app.id, 'shortlisted')}
                                title="Shortlist"
                              >
                                <Star size={16} />
                              </button>
                              <button
                                className="btn btn-sm btn-danger mr-1"
                                onClick={() => handleStatusChange(app.id, 'rejected')}
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => window.open(app.application.resume, '_blank')}
                                title="View Resume"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageApplications; 