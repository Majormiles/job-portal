import React from 'react';
import { Users, Briefcase, Building2, GraduationCap, Award, Clock } from 'lucide-react';

const EmployeeCategories = () => {
  // Sample data for employee categories
  const categories = [
    {
      id: 1,
      name: 'Software Development',
      totalEmployees: 45,
      activeJobs: 12,
      departments: ['Frontend', 'Backend', 'DevOps'],
      icon: <Briefcase className="text-blue-500" />,
      color: '#eff6ff'
    },
    {
      id: 2,
      name: 'Design & UI/UX',
      totalEmployees: 28,
      activeJobs: 8,
      departments: ['UI Design', 'UX Research', 'Graphic Design'],
      icon: <Award className="text-purple-500" />,
      color: '#f3e8ff'
    },
    {
      id: 3,
      name: 'Marketing & Sales',
      totalEmployees: 35,
      activeJobs: 10,
      departments: ['Digital Marketing', 'Content Writing', 'Sales'],
      icon: <Building2 className="text-green-500" />,
      color: '#dcfce7'
    },
    {
      id: 4,
      name: 'Human Resources',
      totalEmployees: 15,
      activeJobs: 4,
      departments: ['Recruitment', 'Training', 'Employee Relations'],
      icon: <Users className="text-orange-500" />,
      color: '#fff7ed'
    },
    {
      id: 5,
      name: 'Finance & Accounting',
      totalEmployees: 20,
      activeJobs: 6,
      departments: ['Accounting', 'Financial Planning', 'Payroll'],
      icon: <GraduationCap className="text-red-500" />,
      color: '#fee2e2'
    },
    {
      id: 6,
      name: 'Customer Support',
      totalEmployees: 25,
      activeJobs: 7,
      departments: ['Technical Support', 'Customer Service', 'Quality Assurance'],
      icon: <Clock className="text-cyan-500" />,
      color: '#ecfeff'
    }
  ];

  // Styles
  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    border: 'none',
    marginBottom: '24px',
    cursor: 'pointer'
  };

  const cardHeaderStyle = {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const iconWrapperStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const titleStyle = {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0
  };

  const cardBodyStyle = {
    padding: '24px'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  };

  const statItemStyle = {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '8px'
  };

  const statLabelStyle = {
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '8px'
  };

  const statValueStyle = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b'
  };

  const departmentsListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const departmentItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
    color: '#64748b',
    fontSize: '0.95rem'
  };

  const dotStyle = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#94a3b8',
    marginRight: '8px'
  };

  return (
    <div>
      <div className="row">
        {categories.map((category) => (
          <div key={category.id} className="col-xl-6 col-lg-6 col-md-12">
            <div className="card" style={cardStyle}>
              <div className="card-header" style={cardHeaderStyle}>
                <div style={{...iconWrapperStyle, background: category.color}}>
                  {category.icon}
                </div>
                <h4 style={titleStyle}>{category.name}</h4>
              </div>
              <div className="card-body" style={cardBodyStyle}>
                <div style={statsGridStyle}>
                  <div style={statItemStyle}>
                    <div style={statLabelStyle}>Total Employees</div>
                    <div style={statValueStyle}>{category.totalEmployees}</div>
                  </div>
                  <div style={statItemStyle}>
                    <div style={statLabelStyle}>Active Jobs</div>
                    <div style={statValueStyle}>{category.activeJobs}</div>
                  </div>
                </div>
                <div>
                  <div style={{...statLabelStyle, marginBottom: '12px'}}>Departments</div>
                  <ul style={departmentsListStyle}>
                    {category.departments.map((dept, index) => (
                      <li key={index} style={departmentItemStyle}>
                        <span style={dotStyle}></span>
                        {dept}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeCategories; 