import React from 'react';
import './LoadingSpinner.css';

// Simple loading spinner component
export const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
    </div>
  );
};

// Fullscreen loading overlay
export const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 