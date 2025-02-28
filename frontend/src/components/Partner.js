import React, { useState, useEffect } from 'react';
import './css/Partners.css';


const Partners = ({ partners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const logosPerRow = 5;

  // Sample partner data if none is provided
  const defaultPartners = [
    { id: 1, name: 'Microsoft', logo: '../assets/logo/adobe.png' },
    { id: 2, name: 'Google', logo: '../assets/logo/asana.jpeg' },
    { id: 3, name: 'Asana', logo: '../assets/logo/asana.jpeg' },
    { id: 4, name: 'Adobe', logo: '../assets/logo/asana.jpeg' },
    { id: 5, name: 'Spotify', logo: '../assets/logo/asana.jpeg' },
    { id: 6, name: 'Partner 6', logo: '../assets/logo/asana.jpeg' },
    { id: 7, name: 'Partner 7', logo: '../assets/logo/asana.jpeg' },
    { id: 8, name: 'Partner 8', logo: '../assets/logo/asana.jpeg' },
    { id: 9, name: 'Partner 9', logo: '../assets/logo/asana.jpeg' },
    { id: 10, name: 'Partner 10', logo: '../assets/logo/asana.jpeg' },
    { id: 11, name: 'Partner 5', logo: '../assets/logo/asana.jpeg' },
    { id: 12, name: 'Partner 6', logo: '../assets/logo/asana.jpeg' },
    { id: 13, name: 'Partner 7', logo: '../assets/logo/asana.jpeg' },
    { id: 14, name: 'Partner 8', logo: '../assets/logo/asana.jpeg' },
    { id: 15, name: 'Partner 9', logo: '../assets/logo/asana.jpeg' },
    { id: 16, name: 'Partner 10', logo: '../assets/logo/asana.jpeg' },
  ];

  const partnerData = partners || defaultPartners;
  const totalSlides = Math.ceil(partnerData.length / logosPerRow);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, 7000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  const renderPartnerLogos = () => {
    const rows = [];
    
    for (let i = 0; i < totalSlides; i++) {
      const startIdx = i * logosPerRow;
      const endIdx = Math.min(startIdx + logosPerRow, partnerData.length);
      const rowPartners = partnerData.slice(startIdx, endIdx);
      
      rows.push(
        <div 
          key={`row-${i}`} 
          className="partners-row"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.5s ease-in-out'
          }}
        >
          {rowPartners.map((partner) => (
            <div key={partner.id} className="partner-logo-container">
              <img 
                src={partner.logo} 
                alt={`${partner.name} logo`} 
                className="partner-logo" 
              />
            </div>
          ))}
        </div>
      );
    }
    
    return rows;
  };

  return (
    <div className="partners-carousel-container">
      <h2 className="partners-heading">Our Business Partners</h2>
      
      <div className="partners-carousel">
        <div className="partners-viewport">
          {renderPartnerLogos()}
        </div>
        
      
      </div>

    </div>
  );
};

export default Partners;