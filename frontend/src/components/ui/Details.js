import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const job = {
    title: "Corporate Solutions Executive",
    company: "Leffler and Sons",
    location: "Greater Accra, Ghana",
    salary: "$40000-$42000",
    jobType: "Full time",
    category: "Commerce",
    experience: "5 Years",
    degree: "Master",
    postedTime: "10 min ago"
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    // Add navigation logic here if needed
    // For demo purposes, we'll just scroll to top
    scrollToTop();
  };

  return (
    <>
      <ScrollToTop />
      <div className="job-detail-container">
        <div className="job-detail-main">
          <div className="job-header">
            <div className="post-time">{job.postedTime}</div>
            <button className="bookmark-btn">
              <i className="fa fa-bookmark-o"></i>
            </button>
          </div>

          <div className="job-title-section">
            <div className="company-logo">
              <img src="https://via.placeholder.com/40" alt="Company logo" />
            </div>
            <div className="title-info">
              <h1>{job.title}</h1>
              <p>{job.company}</p>
            </div>
          </div>

          <div className="job-meta-info">
            <div className="meta-item">
              <i className="fa fa-briefcase"></i>
              <span>{job.category}</span>
            </div>
            <div className="meta-item">
              <i className="fa fa-clock-o"></i>
              <span>{job.jobType}</span>
            </div>
            <div className="meta-item">
              <i className="fa fa-money"></i>
              <span>{job.salary}</span>
            </div>
            <div className="meta-item">
              <i className="fa fa-map-marker"></i>
              <span>{job.location}</span>
            </div>
          </div>

          <section className="job-description">
            <h2>Job Description</h2>
            <p>
              We are seeking a highly motivated and detail-oriented professional to join our team. The ideal candidate will be responsible for managing and overseeing key operational tasks, ensuring efficiency, and maintaining high-quality standards.
              The role requires excellent problem-solving skills, strong communication abilities, and the capability to work both independently and collaboratively in a fast-paced environment.
            </p>
            <p>
              As part of this role, you will work closely with various departments, contributing to strategic planning, workflow optimization, and process improvement. You will also be expected to analyze data, identify challenges, and implement solutions that enhance overall productivity.
              Adaptability, a proactive approach, and a commitment to professional growth are essential qualities for success in this position.
            </p>
          </section>

          <section className="key-responsibilities">
            <h2>Key Responsibilities</h2>
            <ul>
              <li>Oversee daily operations and ensure all tasks are completed efficiently and on schedule.</li>
              <li>Collaborate with cross-functional teams to develop and implement best practices.</li>
              <li>Analyze workflow processes and recommend improvements for increased productivity.</li>
              <li>Ensure compliance with company policies and industry standards.</li>
              <li>Monitor project timelines, budgets, and deliverables to ensure goals are met.</li>
              <li>Develop reports, presentations, and documentation to communicate progress and findings.</li>
              <li>Provide guidance and support to team members, fostering a culture of collaboration and continuous improvement.</li>
              <li>Resolve operational issues promptly and implement preventive measures to avoid recurring challenges.</li>
            </ul>
          </section>

          <section className="professional-skills">
            <h2>Professional Skills</h2>
            <ul>
              <li>Strong analytical and problem-solving skills with a keen attention to detail.</li>
              <li>Excellent verbal and written communication abilities.</li>
              <li>Ability to manage multiple tasks efficiently and prioritize workload effectively.</li>
              <li>Proficiency in using relevant software and tools to streamline workflows.</li>
              <li>Experience in team collaboration and leadership.</li>
              <li>Ability to adapt to changes and embrace new technologies and methodologies.</li>
              <li>Strong time management and organizational skills.</li>
              <li>Commitment to continuous learning and professional development.</li>
            </ul>
          </section>

          <Link to='/pricing-plan' onClick={scrollToTop}>
            <div className="apply-button-container">
              <button className="apply-button">Apply Job</button>
            </div>
          </Link>

          <section className="tags-section">
            <h3>Tags:</h3>
            <div className="tags">
              <span className="tag">Full time</span>
              <span className="tag">Commerce</span>
              <span className="tag">New - York</span>
              <span className="tag">Corporate</span>
              <span className="tag">Location</span>
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

          <section className="related-jobs">
            <h2>Related Jobs</h2>
            <p>At eu lobortis pretium tincidunt amet lacus ut aenean aliquet</p>

            <div className="job-cards">
              {/* Job Card 1 */}
              <div className="job-card">
                <div className="job-card-header">
                  <div className="job-time">24 min ago</div>
                  <button className="bookmark-btn"><i className="fa fa-bookmark-o"></i></button>
                </div>
                <div className="job-card-content">
                  <div className="company-logo">
                    <img src="https://via.placeholder.com/40" alt="Green Group logo" />
                  </div>
                  <div className="job-info">
                    <h3>Internal Creative Coordinator</h3>
                    <p>Green Group</p>

                    <div className="job-meta">
                      <span><i className="fa fa-briefcase"></i> Commerce</span>
                      <span><i className="fa fa-clock-o"></i> Full time</span>
                      <span><i className="fa fa-money"></i> $44000-$46000</span>
                      <span><i className="fa fa-map-marker"></i> Accra, Ghana</span>
                    </div>
                  </div>
                  <div className="job-action">
                    <button className="details-btn" onClick={handleJobDetailsClick}>Job Details</button>
                  </div>
                </div>
              </div>

              {/* Job Card 2 */}
              <div className="job-card">
                <div className="job-card-header">
                  <div className="job-time">24 min ago</div>
                  <button className="bookmark-btn"><i className="fa fa-bookmark-o"></i></button>
                </div>
                <div className="job-card-content">
                  <div className="company-logo">
                    <img src="https://via.placeholder.com/40" alt="VonRueden - Weber Co logo" />
                  </div>
                  <div className="job-info">
                    <h3>District Intranet Director</h3>
                    <p>VonRueden - Weber Co</p>

                    <div className="job-meta">
                      <span><i className="fa fa-briefcase"></i> Commerce</span>
                      <span><i className="fa fa-clock-o"></i> Full time</span>
                      <span><i className="fa fa-money"></i> $42000-$48000</span>
                      <span><i className="fa fa-map-marker"></i> Eastern Region, Ghana</span>
                    </div>
                  </div>
                  <div className="job-action">
                    <button className="details-btn" onClick={handleJobDetailsClick}>Job Details</button>
                  </div>
                </div>
              </div>

              {/* Job Card 3 */}
              <div className="job-card">
                <div className="job-card-header">
                  <div className="job-time">26 min ago</div>
                  <button className="bookmark-btn"><i className="fa fa-bookmark-o"></i></button>
                </div>
                <div className="job-card-content">
                  <div className="company-logo">
                    <img src="https://via.placeholder.com/40" alt="Cormier, Turner and Flatley Inc logo" />
                  </div>
                  <div className="job-info">
                    <h3>Corporate Tactics Facilitator</h3>
                    <p>Cormier, Turner and Flatley Inc</p>

                    <div className="job-meta">
                      <span><i className="fa fa-briefcase"></i> Commerce</span>
                      <span><i className="fa fa-clock-o"></i> Full time</span>
                      <span><i className="fa fa-money"></i> $38000-$40000</span>
                      <span><i className="fa fa-map-marker"></i> Volta Region, Ghana</span>
                    </div>
                  </div>
                  <div className="job-action">
                    <button className="details-btn" onClick={handleJobDetailsClick}>Job Details</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="job-sidebar">
          <div className="sidebar-card">
            <h3>Job Overview</h3>

            <div className="overview-item">
              <div className="overview-icon"><i className="fa fa-briefcase"></i></div>
              <div className="overview-content">
                <p className="overview-label">Job Title</p>
                <p className="overview-value">Corporate Solutions Executive</p>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon"><i className="fa fa-clock-o"></i></div>
              <div className="overview-content">
                <p className="overview-label">Job Type</p>
                <p className="overview-value">Full Time</p>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon"><i className="fa fa-briefcase"></i></div>
              <div className="overview-content">
                <p className="overview-label">Category</p>
                <p className="overview-value">Commerce</p>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon"><i className="fa fa-calendar"></i></div>
              <div className="overview-content">
                <p className="overview-label">Experience</p>
                <p className="overview-value">5 Years</p>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon"><i className="fa fa-graduation-cap"></i></div>
              <div className="overview-content">
                <p className="overview-label">Degree</p>
                <p className="overview-value">Master</p>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon"><i className="fa fa-money"></i></div>
              <div className="overview-content">
                <p className="overview-label">Offered Salary</p>
                <p className="overview-value">$40000-$45000</p>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon"><i className="fa fa-map-marker"></i></div>
              <div className="overview-content">
                <p className="overview-label">Location</p>
                <p className="overview-value">New-York, USA</p>
              </div>
            </div>

            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15853.182235823399!2d0.47855064999999997!3d6.61015005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sgh!4v1740799409286!5m2!1sen!2sgh"
                width="100%"
                height="450"
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
      </div>
    </>
  );
};

export default JobDetailPage;