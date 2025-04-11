import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getJobById, getRelatedJobs } from '../../services/jobService';
import { formatSalary, formatDate } from '../../utils/formatters';
import { Bookmark, MapPin, Calendar, Briefcase, DollarSign, GraduationCap, Clock } from 'lucide-react';
import '../css/DetailPage.css';

// Create a ScrollToTop component to handle route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const JobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch job details when component mounts or ID changes
  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        if (id) {
          const response = await getJobById(id);
          if (response.success && response.data) {
            setJob(response.data);
            
            // Fetch related jobs if we have category info
            if (response.data.category?._id) {
              const relatedResponse = await getRelatedJobs(id, response.data.category._id, 3);
              if (relatedResponse.success && relatedResponse.data) {
                setRelatedJobs(relatedResponse.data);
              }
            }
          } else {
            setError('Failed to load job details');
          }
        } else {
          setError('No job ID provided');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to load job details');
        
        // Fallback data for development/demo purposes
        setJob({
          title: "Corporate Solutions Executive",
          company: { name: "Leffler and Sons" },
          location: "Greater Accra, Ghana",
          salary: { min: 40000, max: 42000, currency: "USD" },
          type: "full-time",
          category: { name: "Commerce" },
          experience: "senior",
          requirements: [
            "Oversee daily operations and ensure all tasks are completed efficiently and on schedule.",
            "Collaborate with cross-functional teams to develop and implement best practices.",
            "Analyze workflow processes and recommend improvements for increased productivity.",
            "Ensure compliance with company policies and industry standards.",
            "Monitor project timelines, budgets, and deliverables to ensure goals are met.",
            "Develop reports, presentations, and documentation to communicate progress and findings.",
            "Provide guidance and support to team members, fostering a culture of collaboration and continuous improvement.",
            "Resolve operational issues promptly and implement preventive measures to avoid recurring challenges."
          ],
          skills: [
            "Strong analytical and problem-solving skills with a keen attention to detail.",
            "Excellent verbal and written communication abilities.",
            "Ability to manage multiple tasks efficiently and prioritize workload effectively.",
            "Proficiency in using relevant software and tools to streamline workflows.",
            "Experience in team collaboration and leadership.",
            "Ability to adapt to changes and embrace new technologies and methodologies.",
            "Strong time management and organizational skills.",
            "Commitment to continuous learning and professional development."
          ],
          createdAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // Function to handle scrolling to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Function to handle job details button click
  const handleJobDetailsClick = (e) => {
    e.preventDefault();
    scrollToTop();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/jobs" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Back to Jobs
        </Link>
      </div>
    );
  }

  // Format job details
  const formattedSalary = job?.salary ? formatSalary(job.salary.min, job.salary.max, job.salary.currency) : "Competitive";
  const formattedDate = job?.createdAt ? formatDate(job.createdAt) : "Recent";
  const experienceMap = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior Level"
  };
  const formattedExperience = job?.experience ? experienceMap[job.experience] || job.experience : "Not specified";

  return (
    <>
      <ScrollToTop />
      <div className="job-detail-container">
        <div className="job-detail-main">
          <div className="job-header">
            <div className="post-time">{formattedDate}</div>
            <button className="bookmark-btn">
              <Bookmark size={20} />
            </button>
          </div>

          <div className="job-title-section">
            <div className="company-logo">
              {job?.company?.logo ? (
                <img src={job.company.logo} alt={`${job.company.name} logo`} />
              ) : (
                <div className="placeholder-logo">
                  {job?.company?.name?.charAt(0) || 'C'}
                </div>
              )}
            </div>
            <div className="title-info">
              <h1>{job?.title}</h1>
              <p>{job?.company?.name}</p>
            </div>
          </div>

          <div className="job-meta-info">
            <div className="meta-item">
              <Briefcase size={16} />
              <span>{job?.category?.name || "General"}</span>
            </div>
            <div className="meta-item">
              <Clock size={16} />
              <span>{job?.type?.replace('-', ' ') || "Full time"}</span>
            </div>
            <div className="meta-item">
              <DollarSign size={16} />
              <span>{formattedSalary}</span>
            </div>
            <div className="meta-item">
              <MapPin size={16} />
              <span>{job?.location || "Not specified"}</span>
            </div>
            {job?.experience && (
              <div className="meta-item">
                <GraduationCap size={16} />
                <span>{formattedExperience}</span>
              </div>
            )}
          </div>

          <section className="job-description">
            <h2>Job Description</h2>
            {job?.description ? (
              <div dangerouslySetInnerHTML={{ __html: job.description }} className="description-content" />
            ) : (
              <div className="description-content">
                <p>
                  We are seeking a highly motivated and detail-oriented professional to join our team. The ideal candidate will be responsible for managing and overseeing key operational tasks, ensuring efficiency, and maintaining high-quality standards.
                </p>
                <p>
                  The role requires excellent problem-solving skills, strong communication abilities, and the capability to work both independently and collaboratively in a fast-paced environment.
                </p>
                <p>
                  As part of this role, you will work closely with various departments, contributing to strategic planning, workflow optimization, and process improvement. You will also be expected to analyze data, identify challenges, and implement solutions that enhance overall productivity.
                </p>
                <p>
                  Adaptability, a proactive approach, and a commitment to professional growth are essential qualities for success in this position.
                </p>
              </div>
            )}
          </section>

          {job?.requirements && job.requirements.length > 0 && (
            <section className="key-responsibilities">
              <h2>Requirements</h2>
              <ul>
                {job.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </section>
          )}

          {job?.skills && job.skills.length > 0 && (
            <section className="professional-skills">
              <h2>Professional Skills</h2>
              <ul>
                {job.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </section>
          )}

          <Link to={job?.applyUrl || '/pricing-plan'} onClick={scrollToTop}>
            <div className="apply-button-container">
              <button className="apply-button">Apply Now</button>
            </div>
          </Link>

          <section className="tags-section">
            <h3>Tags:</h3>
            <div className="tags">
              <span className="tag">{job?.type?.replace('-', ' ') || "Full time"}</span>
              <span className="tag">{job?.category?.name || "General"}</span>
              <span className="tag">{job?.location?.split(',')[0] || "Remote"}</span>
              {job?.tags?.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </section>

          <section className="share-job">
            <p>Share Job:</p>
            <div className="social-icons">
              <a href="#" className="social-icon" onClick={(e) => { e.preventDefault(); }}><i className="fa fa-facebook"></i></a>
              <a href="#" className="social-icon" onClick={(e) => { e.preventDefault(); }}><i className="fa fa-twitter"></i></a>
              <a href="#" className="social-icon" onClick={(e) => { e.preventDefault(); }}><i className="fa fa-linkedin"></i></a>
            </div>
          </section>

          {relatedJobs.length > 0 && (
            <section className="related-jobs">
              <h2>Related Jobs</h2>
              <p>Other opportunities that might interest you</p>

              <div className="job-cards">
                {relatedJobs.map((relatedJob) => (
                  <div key={relatedJob._id} className="job-card">
                    <div className="job-card-header">
                      <div className="job-time">{formatDate(relatedJob.createdAt)}</div>
                      <button className="bookmark-btn"><Bookmark size={16} /></button>
                    </div>
                    <div className="job-card-content">
                      <div className="company-logo">
                        {relatedJob.company?.logo ? (
                          <img src={relatedJob.company.logo} alt={`${relatedJob.company.name} logo`} />
                        ) : (
                          <span>{relatedJob.company?.name?.charAt(0) || 'C'}</span>
                        )}
                      </div>
                      <div className="job-info">
                        <h3>{relatedJob.title}</h3>
                        <p>{relatedJob.company?.name}</p>

                        <div className="job-meta">
                          <span><Briefcase size={14} /> {relatedJob.category?.name}</span>
                          <span><Clock size={14} /> {relatedJob.type?.replace('-', ' ')}</span>
                          <span><DollarSign size={14} /> {formatSalary(relatedJob.salary?.min, relatedJob.salary?.max, relatedJob.salary?.currency)}</span>
                          <span><MapPin size={14} /> {relatedJob.location}</span>
                        </div>
                      </div>
                      <div className="job-action">
                        <Link to={`/job-detail/${relatedJob._id}`} className="details-btn" onClick={handleJobDetailsClick}>
                          Job Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="job-sidebar">
          <div className="sidebar-sticky-wrapper">
            <div className="sidebar-card sticky-overview">
              <h3>Job Overview</h3>

              <div className="overview-item">
                <div className="overview-icon">
                  <Calendar size={18} />
                </div>
                <div className="overview-content">
                  <p className="overview-label">Date Posted</p>
                  <p className="overview-value">{formattedDate}</p>
                </div>
              </div>

              <div className="overview-item">
                <div className="overview-icon">
                  <MapPin size={18} />
                </div>
                <div className="overview-content">
                  <p className="overview-label">Location</p>
                  <p className="overview-value">{job?.location || "Not specified"}</p>
                </div>
              </div>

              <div className="overview-item">
                <div className="overview-icon">
                  <Briefcase size={18} />
                </div>
                <div className="overview-content">
                  <p className="overview-label">Job Title</p>
                  <p className="overview-value">{job?.title}</p>
                </div>
              </div>

              <div className="overview-item">
                <div className="overview-icon">
                  <DollarSign size={18} />
                </div>
                <div className="overview-content">
                  <p className="overview-label">Salary</p>
                  <p className="overview-value">{formattedSalary}</p>
                </div>
              </div>

              <div className="overview-item">
                <div className="overview-icon">
                  <Clock size={18} />
                </div>
                <div className="overview-content">
                  <p className="overview-label">Job Type</p>
                  <p className="overview-value">{job?.type?.replace('-', ' ') || "Full time"}</p>
                </div>
              </div>

              <div className="overview-item">
                <div className="overview-icon">
                  <GraduationCap size={18} />
                </div>
                <div className="overview-content">
                  <p className="overview-label">Experience</p>
                  <p className="overview-value">{formattedExperience}</p>
                </div>
              </div>

              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15853.182235823399!2d0.47855064999999997!3d6.61015005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sgh!4v1740799409286!5m2!1sen!2sgh"
                  width="100%"
                  height="200"
                  style={{ border: "0" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>

            <div className="sidebar-card contact-form">
              <h3>Send Us Message</h3>
              <form onSubmit={(e) => { e.preventDefault(); scrollToTop(); }}>
                <div className="form-group">
                  <label htmlFor="fullName"><i className="fa fa-user"></i></label>
                  <input type="text" id="fullName" placeholder="Full name" />
                </div>

                <div className="form-group">
                  <label htmlFor="email"><i className="fa fa-envelope"></i></label>
                  <input type="email" id="email" placeholder="Email Address" />
                </div>

                <div className="form-group">
                  <label htmlFor="phone"><i className="fa fa-phone"></i></label>
                  <input type="tel" id="phone" placeholder="Phone Number" />
                </div>

                <div className="form-group">
                  <label htmlFor="message"><i className="fa fa-comment"></i></label>
                  <textarea id="message" placeholder="Your Message"></textarea>
                </div>

                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </div>
          </div>

          <div className="sidebar-card company-card">
            <h3>About Company</h3>
            {job?.company?.logo && (
              <div className="company-logo">
                <img src={job.company.logo} alt={`${job.company.name} logo`} />
              </div>
            )}
            <h4>{job?.company?.name}</h4>
            <p>{job?.company?.description || "Company information not available."}</p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .description-content {
          line-height: 1.8;
          color: #4a4a4a;
        }
        
        .description-content p {
          margin-bottom: 16px;
        }
        
        .sidebar-sticky-wrapper {
          position: sticky;
          top: 30px;
          z-index: 10;
          margin-bottom: 20px;
        }
        
        .sticky-overview {
          position: relative;
          top: auto;
          margin-bottom: 20px;
          background-color: white;
        }
        
        .job-description, .key-responsibilities, .professional-skills {
          margin-bottom: 30px;
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .job-description h2, .key-responsibilities h2, .professional-skills h2 {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee;
        }
        
        .key-responsibilities ul, .professional-skills ul {
          padding-left: 20px;
        }
        
        .key-responsibilities li, .professional-skills li {
          margin-bottom: 12px;
          position: relative;
          padding-left: 5px;
        }
        
        .overview-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 3px;
        }
        
        .overview-value {
          font-weight: 600;
          color: #333;
        }
        
        .map-container {
          margin-top: 20px;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .contact-form {
          margin-top: 0;
          background-color: white;
        }
        
        .contact-form .form-group {
          margin-bottom: 15px;
          position: relative;
        }
        
        .contact-form label {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }
        
        .contact-form input, 
        .contact-form textarea {
          width: 100%;
          padding: 10px 10px 10px 35px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .contact-form textarea {
          height: 100px;
          padding-top: 30px;
        }
        
        .contact-form label[for="message"] {
          top: 25px;
        }
        
        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #ff7b00;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        
        .submit-btn:hover {
          background-color: #e67000;
        }
      `}</style>
    </>
  );
};

export default JobDetailPage;