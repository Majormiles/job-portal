import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, Mail, Clock, MapPin } from 'react-feather';
import '../css/Contact.css';


import zoomLogo from '../../assets/logo/adobe.png';
import asanaLogo from '../../assets/logo/asana.jpeg';
import tinderLogo from '../../assets/logo/linear.png';
import dribbleLogo from '../../assets/logo/spotify.png';

const ContactPage = () => {
    const location = useLocation();
    const formRef = useRef(null);

    // Scroll to top when navigating to this page
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    // Animation on component mount
    useEffect(() => {
        const elements = document.querySelectorAll('.animate-on-mount');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, 200 * index);
        });
    }, []);

    // Form submission handler
    const handleSubmit = (e) => {
        e.preventDefault();
        // Form submission logic here
        alert('Your message has been sent! We will get back to you soon.');

        // Reset form
        if (formRef.current) {
            formRef.current.reset();
        }
    };

    return (
        <div className="contact-page-container">
            <div className="contact-content-wrapper">
                <div className="contact-content">
                    <div className="contact-left animate-on-mount">
                        <h1>Launch Your Potential. Elevate Your Career.</h1>
                        <p>
                            Connect with opportunities that match your ambition. We don't just find you jobs—we build pathways to professional growth and lasting success.
                        </p>

                        <div className="contact-info-container">
                            <div className="contact-info-item animate-on-mount">
                                <div className="icon-container">
                                    <Phone size={24} />
                                </div>
                                <div className="info-content">
                                    <h3>Call for inquiry</h3>
                                    <p>+233 24 746 6205</p>
                                </div>
                            </div>

                            <div className="contact-info-item animate-on-mount">
                                <div className="icon-container">
                                    <Mail size={24} />
                                </div>
                                <div className="info-content">
                                    <h3>Send us email</h3>
                                    <p>majormyles20@gmail.com</p>
                                </div>
                            </div>

                            <div className="contact-info-item animate-on-mount">
                                <div className="icon-container">
                                    <Clock size={24} />
                                </div>
                                <div className="info-content">
                                    <h3>Opening hours</h3>
                                    <p>Mon - Fri: 10AM - 10PM</p>
                                </div>
                            </div>

                            <div className="contact-info-item animate-on-mount">
                                <div className="icon-container">
                                    <MapPin size={24} />
                                </div>
                                <div className="info-content">
                                    <h3>Office</h3>
                                    <p>Ho Volta Region, Ghana</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-right animate-on-mount">
                        <div className="contact-form-container">
                            <h2>Contact Info</h2>
                            <p>Nibh dis faucibus proin lacus tristique</p>

                            <form ref={formRef} onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            placeholder=""
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            placeholder=""
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder=""
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message"></label>
                                    <textarea
                                        id="message"
                                        placeholder="Your message..."
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="submit-button">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="map-container">
                <div className="map-wrapper">
                    <div className="map-inner">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15853.182235823399!2d0.47855064999999997!3d6.61015005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sgh!4v1740799409286!5m2!1sen!2sgh"
                            style={{ border: "0" }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </div>

            <div className="partners-section">
                <div className="partners-container">
                    <div className="partner animate-on-mount">
                        <img src={zoomLogo} alt="Company hero" className="hero-image" />
                    </div>
                    <div className="partner animate-on-mount">
                        <img src={asanaLogo} alt="Company hero" className="hero-image" />
                    </div>
                    <div className="partner animate-on-mount">
                        <img src={tinderLogo} alt="Company hero" className="hero-image" />
                    </div>
                    <div className="partner animate-on-mount">
                        <img src={dribbleLogo} alt="Company hero" className="hero-image" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;