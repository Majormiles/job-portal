import React, { useState, useEffect, useRef } from 'react';
import '../css/Companies.css';

import adobeLogo from '../../assets/logo/adobe.png';
import asanaLogo from '../../assets/logo/asana.jpeg';
import linearLogo from '../../assets/logo/linear.png';
import spotifyLogo from '../../assets/logo/spotify.png';
import slackLogo from '../../assets/logo/slack.png';

const Partners = ({ partners }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const animationStartTimeRef = useRef(null);
  
  const defaultPartners = [
    { id: 1, name: 'Adobe', logo: adobeLogo },
    { id: 2, name: 'Asana', logo: asanaLogo },
    { id: 3, name: 'Linear', logo: linearLogo },
    { id: 4, name: 'Spotify', logo: spotifyLogo },
    { id: 5, name: 'Slack', logo: slackLogo },
  ];
  
  const partnerData = partners || defaultPartners;
  
  // Triple the partners to ensure smooth infinite scrolling
  const displayPartners = [...partnerData, ...partnerData, ...partnerData];
  
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleReducedMotionChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);
  
  useEffect(() => {
    if (!trackRef.current || prefersReducedMotion) return;
    
    const trackWidth = trackRef.current.scrollWidth;
    const containerWidth = trackRef.current.parentElement.offsetWidth;
    const partnerSetWidth = trackWidth / 3; // Width of one set of partners
    
    let startPosition = 0;
    const duration = 20000; // 20 seconds for one complete cycle
    
    const animate = (timestamp) => {
      if (!animationStartTimeRef.current) {
        animationStartTimeRef.current = timestamp;
      }
      
      if (isPaused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const elapsed = timestamp - animationStartTimeRef.current;
      const progress = (elapsed % duration) / duration;
      
      // Calculate position to create infinite loop
      startPosition = progress * partnerSetWidth;
      
      // Reset when we've moved one full set width
      if (startPosition >= partnerSetWidth) {
        animationStartTimeRef.current = timestamp;
        startPosition = 0;
      }
      
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${startPosition}px)`;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, prefersReducedMotion]);
  
  return (
    <div 
      className="partners-carousel-container" 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Partner companies carousel"
    >
      <div className="partners-carousel">
        <div className="partners-track-container">
          <div
            ref={trackRef}
            className="partners-track"
            style={{
              transition: 'transform 0.05s linear'
            }}
          >
            {displayPartners.map((partner, index) => (
              <div 
                key={`${partner.id}-${index}`} 
                className="partner-logo-container"
                aria-hidden={index >= partnerData.length * 2 ? "true" : "false"} 
              >
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
    </div>
  );
};

export default Partners;