import React from 'react';
import './css/TypingIndicator.css';

const TypingIndicator = () => {
  return (
    <div className="typing-indicator-wrapper">
      <div className="typing-indicator">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );
};

export default TypingIndicator;