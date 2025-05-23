import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import '../css/CompanyGallery.css';

// Sample image imports - you'll replace these with your actual images later
import jobsearchImage from '../../assets/images/jobsearch.png';
// Import paths for executive images - using the same pattern as jobsearchImage
import execImage1 from '../../assets/images/jobsearch.png';
import execImage2 from '../../assets/images/jobsearch.png';
import execImage3 from '../../assets/images/jobsearch.png';
import execImage4 from '../../assets/images/jobsearch.png';
// Import paths for culture images - using the same pattern as jobsearchImage
import cultureImage1 from '../../assets/images/jobsearch.png';
import cultureImage2 from '../../assets/images/jobsearch.png';
import cultureImage3 from '../../assets/images/jobsearch.png';
import cultureImage4 from '../../assets/images/jobsearch.png';
import cultureImage5 from '../../assets/images/jobsearch.png';
import cultureImage6 from '../../assets/images/jobsearch.png';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
    
    return null;
  };
  
const CompanyGallery = () => {
  // Executive placeholder data
  const executives = [
    {
      id: 1,
      name: 'John Doe',
      position: 'Chief Executive Officer',
      message: 'Leading with innovation and integrity, creating opportunities for all.',
      linkedin: '#',
      twitter: '#',
      image: execImage1  // Added image property
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Chief Operations Officer',
      message: 'Building efficient systems that empower our team and clients.',
      linkedin: '#',
      twitter: '#',
      image: execImage2  // Added image property
    },
    {
      id: 3,
      name: 'Michael Johnson',
      position: 'Chief Technology Officer',
      message: 'Leveraging technology to transform the future of work.',
      linkedin: '#',
      twitter: '#',
      image: execImage3  // Added image property
    },
    {
      id: 4,
      name: 'Sarah Williams',
      position: 'VP of Human Resources',
      message: 'Creating an inclusive workplace where talent thrives.',
      linkedin: '#',
      twitter: '#',
      image: execImage4  // Added image property
    },
  ];

  // Company culture images array
  const cultureImages = [
    cultureImage1,
    cultureImage2,
    cultureImage3,
    cultureImage4,
    cultureImage5,
    cultureImage6
  ];

  return (
    <>
      <ScrollToTop />
      <div className="bg-white py-16">
        <div className="container mx-auto px-4" style={{ maxWidth: '1000px' }}>
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Leadership Team</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Meet the visionaries behind our company who are committed to connecting talented individuals with 
              exceptional career opportunities and helping businesses find the perfect team members.
            </p>
          </div>

          {/* Company Message */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm mb-16 animate-fade-in-up animation-delay-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Commitment to You</h3>
            <p className="text-gray-600 mb-4">
              At our company, we believe that finding the right job or the right talent shouldn't be a challenge. 
              We're dedicated to streamlining the recruitment process by leveraging innovative technology and 
              personal connections to create meaningful professional relationships.
            </p>
            <p className="text-gray-600">
              Whether you're looking to advance your career or grow your team, we're here to support you every 
              step of the way with personalized guidance and industry expertise.
            </p>
          </div>

          {/* Executive Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 executive-grid">
            {executives.map((exec, index) => (
              <div key={exec.id} className={`flex flex-col items-center animate-fade-in-up animation-delay-${(index + 2) * 100}`}>
                {/* Image - Using individual executive images */}
                <div className="w-48 h-48 rounded-full mb-4 border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-100 executive-photo-placeholder">
                  <img src={exec.image} alt={exec.name} className="w-full h-full object-cover" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800">{exec.name}</h3>
                <p className="text-gray-500 mb-2">{exec.position}</p>
                
                <p className="text-gray-600 text-center mb-4 text-sm">"{exec.message}"</p>
                
                {/* Social Links */}
                <div className="flex space-x-4">
                  <a href={exec.linkedin} className="text-blue-600 hover:text-blue-800">
                    <FontAwesomeIcon icon={faLinkedin} size="lg" />
                  </a>
                  <a href={exec.twitter} className="text-blue-400 hover:text-blue-600">
                    <FontAwesomeIcon icon={faTwitter} size="lg" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Company Culture Section */}
          <div className="mt-20 animate-fade-in-up animation-delay-600">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Our Company Culture</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Culture Images - Using individual culture images */}
              {cultureImages.map((image, index) => (
                <div 
                  key={index}
                  className={`aspect-video border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 company-culture-photo animate-fade-in-up animation-delay-${(index + 7) * 100}`}
                >
                  <img src={image} alt={`Company Culture ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyGallery;