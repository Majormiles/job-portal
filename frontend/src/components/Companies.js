import React, { useState, useEffect } from 'react';
import './css/Companies.css';

import adobeLogo from '../assets/logo/adobe.png';
import asanaLogo from '../assets/logo/asana.jpeg';
import linearLogo from '../assets/logo/linear.png';
import spotifyLogo from '../assets/logo/spotify.png';
import slackLogo from '../assets/logo/slack.png';

const Partners = ({ partners }) => {
  const [position, setPosition] = useState(0);
  
  const defaultPartners = [
    { id: 1, name: 'Adobe', logo: adobeLogo },
    { id: 2, name: 'Asana', logo: asanaLogo },
    { id: 3, name: 'Linear', logo: linearLogo },
    { id: 4, name: 'Spotify', logo: spotifyLogo },
    { id: 5, name: 'Slack', logo: slackLogo },
  ];
  
  const partnerData = partners || defaultPartners;
  
  // Duplicate partners for continuous scrolling effect
  const displayPartners = [...partnerData, ...partnerData];
  
  useEffect(() => {
    const speed = 0.03; // pixels per frame
    let animationId;
    let lastTimestamp = 0;
    
    const animate = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;
      
      setPosition(prevPosition => {
        const newPosition = prevPosition + speed * (elapsed / 16);
        
        if (newPosition >= 100) {
          return 0;
        }
        return newPosition;
      });
      
      lastTimestamp = timestamp;
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
  
  return (
    <div className="partners-carousel-container">
      <div className="partners-carousel">
        <div
          className="partners-track"
          style={{
            transform: `translateX(-${position}%)`,
            transition: 'transform 0.05s linear'
          }}
        >
          {displayPartners.map((partner, index) => (
            <div key={`${partner.id}-${index}`} className="partner-logo-container">
              <img 
                src={partner.logo} 
                alt={`${partner.name} logo`} 
                className="partner-logo"
              />
              <span className="partner-name">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partners;