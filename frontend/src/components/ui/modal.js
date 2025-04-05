import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Create a separate component for the portal to avoid the React warning
const ModalPortal = ({ children }) => {
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    // Set the mount node to document.body once component mounts
    setMountNode(document.body);
  }, []);

  return mountNode ? createPortal(children, mountNode) : null;
};

export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '' 
}) => {
  // Handle ESC key press - always define hooks regardless of isOpen
  useEffect(() => {
    // Only add listeners if modal is open
    if (!isOpen) return;
    
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Don't render anything if not open - move this after all hooks are defined
  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Create modal markup
  const modalContent = (
    <div 
      className="resume-modal-overlay" 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div className={`${className}`}>
        {children}
      </div>
    </div>
  );

  // Use ModalPortal component for rendering the portal
  return <ModalPortal>{modalContent}</ModalPortal>;
}; 