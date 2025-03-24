import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import jobsearchImage from '../../assets/images/woman.jpg';
import '../css/About.css';

// Icon components
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feature-icon">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feature-icon">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feature-icon">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feature-icon">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="play-icon">
        <path d="M8 5v14l11-7z"></path>
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const ScrollToTop = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button onClick={scrollToTop} className="scroll-top-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
        </button>
    );
};

const JobPortal = () => {
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const videoRef = useRef(null);
    const faqRef = useRef(null);
    const partnersRef = useRef(null);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, observerOptions);

        const sections = [heroRef.current, featuresRef.current, videoRef.current, faqRef.current, partnersRef.current];
        sections.forEach(section => {
            if (section) observer.observe(section);
        });

        // Observe all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            observer.observe(item);
        });

        // Observe all feature items
        document.querySelectorAll('.feature').forEach(item => {
            observer.observe(item);
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    const toggleFaq = (index) => {
        const item = document.getElementById(`faq-${index}`);
        if (item) {
            item.classList.toggle('active');
        }
    };

    return (
        <div className="job-portal-container">
            {/* Hero Section */}
            <section className="about-hero-section" ref={heroRef}>
                <div className="container">
                    <div className="about-hero-content">

                        <h1>Your Trusted Partner in Career Success</h1>
                        <p>
                            At ?, we bridge the gap between job seekers and employers, making job hunting and hiring
                            simple and effective. With a vast network of opportunities and a user-friendly platform, we help
                            professionals find their ideal jobs while assisting businesses in hiring top talent. Join us and
                            take the next step toward success.
                        </p>


                    </div>
                    <div className="about-hero-image">
                        <img src={jobsearchImage} alt="Company hero" className="hero-image" />
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="how-it-works" ref={featuresRef}>
                <div className="container">
                    <h2>How it works</h2>
                    <p className="section-subtitle">
                        At eu laboris pretium tincidunt amet lacus ut semper aliquet. Eripuit a massa elementum id scelerisque rhoncus.
                    </p>

                    <div className="features">
                        <div className="feature">
                            <div className="feature-icon-wrapper">
                                <UserIcon />
                            </div>
                            <h3>Create Account</h3>
                            <p>Nunc sed a vel purus. Nish mi faucibus proin lacus tristique.</p>
                        </div>

                        <div className="feature">
                            <div className="feature-icon-wrapper">
                                <DocumentIcon />
                            </div>
                            <h3>Upload Resume</h3>
                            <p>Felis eu eifices a sed massa. Commodo fridigila sed tempor.</p>
                        </div>

                        <div className="feature">
                            <div className="feature-icon-wrapper">
                                <BriefcaseIcon />
                            </div>
                            <h3>Find Jobs</h3>
                            <p>Commodo fridigila sed tempor mass tempest eifisteus sarum.</p>
                        </div>

                        <div className="feature">
                            <div className="feature-icon-wrapper">
                                <CheckIcon />
                            </div>
                            <h3>Apply Job</h3>
                            <p>Nisi enim feugiat enim volutpat. Sem quis viverra.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Section */}
            <section className="video-section" ref={videoRef}>
                <div className="container">
                    <div className="video-container">
                        <div className="video-overlay">
                            <button className="play-button">
                                <PlayIcon />
                            </button>
                            <div className="video-text">
                                <h2>Good Life Begins With<br />A Good Company</h2>
                            </div>
                            <div className="steps-container">
                                <div className="step">
                                    <div className="step-number">1</div>
                                    <p>Est gravida lorem amet porta risus vitae et.</p>
                                </div>
                                <div className="step">
                                    <div className="step-number">2</div>
                                    <p>Volutpat dui lacus mattis urna porta... lacus lorem.</p>
                                </div>
                                <div className="step">
                                    <div className="step-number">3</div>
                                    <p>Elementum faucibus netus gravida lacus lorem.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="about-faq-section" ref={faqRef}>
                <div className="container">
                    <h2>Frequently Asked Questions</h2>
                    <p className="section-subtitle">
                        At eu laboris pretium tincidunt amet lacus ut semper aliquet.
                    </p>

                    <div className="About-faq-container">
                        <div id="faq-1" className="faq-item">
                            <div className="faq-question" onClick={() => toggleFaq(1)}>
                                <div className="faq-number">01</div>
                                <h3>Can I upload a CV?</h3>
                                <button className="faq-toggle">
                                    <PlusIcon />
                                    <MinusIcon />
                                </button>
                            </div>
                            <div className="faq-answer">
                                <p>Nunc sed a vel purus. Nish mi faucibus proin lacus tristique. Sit congue non vitae odio ut erat in. Felis eu eifices a sed massa. Commodo fridigila sed tempor mass tempest eifisteus sarum. Habitasse molls faucibus in ducus lectus. Nisi enim feugiat enim volutpat. Sem quis viverra eretna odio mauris nunc.</p>
                            </div>
                        </div>

                        <div id="faq-2" className="faq-item">
                            <div className="faq-question" onClick={() => toggleFaq(2)}>
                                <div className="faq-number">02</div>
                                <h3>How long will the recruitment process take?</h3>
                                <button className="faq-toggle">
                                    <PlusIcon />
                                    <MinusIcon />
                                </button>
                            </div>
                            <div className="faq-answer">
                                <p>Nunc sed a vel purus. Nish mi faucibus proin lacus tristique. Sit congue non vitae odio ut erat in. Felis eu eifices a sed massa.</p>
                            </div>
                        </div>

                        <div id="faq-4" className="faq-item">
                            <div className="faq-question" onClick={() => toggleFaq(4)}>
                                <div className="faq-number">04</div>
                                <h3>Do you recruit for Graduates, Apprentices and Students?</h3>
                                <button className="faq-toggle">
                                    <PlusIcon />
                                    <MinusIcon />
                                </button>
                            </div>
                            <div className="faq-answer">
                                <p>Commodo fridigila sed tempor mass tempest eifisteus sarum. Habitasse molls faucibus in ducus lectus. Nisi enim feugiat enim volutpat.</p>
                            </div>
                        </div>

                        <div id="faq-3" className="faq-item">
                            <div className="faq-question" onClick={() => toggleFaq(3)}>
                                <div className="faq-number">03</div>
                                <h3>What does the recruitment and selection process involve?</h3>
                                <button className="faq-toggle">
                                    <PlusIcon />
                                    <MinusIcon />
                                </button>
                            </div>
                            <div className="faq-answer">
                                <p>Felis eu eifices a sed massa. Commodo fridigila sed tempor mass tempest eifisteus sarum. Habitasse molls faucibus in ducus lectus.</p>
                            </div>
                        </div>

                        <div id="faq-5" className="faq-item">
                            <div className="faq-question" onClick={() => toggleFaq(5)}>
                                <div className="faq-number">05</div>
                                <h3>Can I receive notifications for any future jobs that may interest me?</h3>
                                <button className="faq-toggle">
                                    <PlusIcon />
                                    <MinusIcon />
                                </button>
                            </div>
                            <div className="faq-answer">
                                <p>Sem quis viverra eretna odio mauris nunc. Nunc sed a vel purus. Nish mi faucibus proin lacus tristique.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="partners-section" ref={partnersRef}>
                <div className="container">
                    <div className="partners-grid">
                        <div className="partners-image-grid">
                            <div className="partner-image">
                                <img src={jobsearchImage} alt="Company hero" className="hero-image" />
                            </div>
                            <div className="partner-image">
                                <img src={jobsearchImage} alt="Company hero" className="hero-image" />
                            </div>
                            <div className="partner-image">
                                <img src={jobsearchImage} alt="Company hero" className="hero-image" />
                            </div>
                            <div className="partner-image">
                                <img src={jobsearchImage} alt="Company hero" className="hero-image" />
                            </div>
                        </div>
                        <div className="partners-content">
                            <h2>We're Only Working With The Best</h2>
                            <p>Ultricies ipsum dolor vitae mi tempest et turpis justo. Ultricies ipsum dolor sagittis amet faucibus tempor viverra.</p>

                            <div className="benefits">
                                <div className="benefit">
                                    <div className="benefit-icon">
                                        <CheckIcon />
                                    </div>
                                    <span>Quality Job</span>
                                </div>
                                <div className="benefit">
                                    <div className="benefit-icon">
                                        <DocumentIcon />
                                    </div>
                                    <span>Resume builder</span>
                                </div>
                                <div className="benefit">
                                    <div className="benefit-icon">
                                        <UserIcon />
                                    </div>
                                    <span>Top Companies</span>
                                </div>
                                <div className="benefit">
                                    <div className="benefit-icon">
                                        <UserIcon />
                                    </div>
                                    <span>Top Talents</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scroll to Top Button */}
            {/* <ScrollToTop /> */}
        </div>
    );
};

export default JobPortal;