// UI service for handling loading states, errors, and other UI utilities

// Error message handler - returns user-friendly messages
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.error) return typeof error.error === 'string' 
    ? error.error 
    : error.error.message || 'An error occurred';
  
  return 'Something went wrong. Please try again.';
};

// Create a loading spinner component
export const LoadingSpinner = () => {
  return `
    <div class="loading-spinner-container">
      <div class="loading-spinner"></div>
    </div>
  `;
};

// Format price to Indian Rupees
export const formatPrice = (price) => {
  if (price === undefined || price === null) return '₹0.00';
  
  return `₹${Number(price).toFixed(2)}`;
};

// Format date to readable format
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || '';
  }
};

// Create CSS for the loading spinner
export const loadingSpinnerCSS = `
.loading-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 200px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #e67e22;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;

// Create a reusable modal component
export const createModal = (title, content, onClose) => {
  const modalElement = document.createElement('div');
  modalElement.className = 'custom-modal-overlay';
  
  modalElement.innerHTML = `
    <div class="custom-modal-content">
      <span class="custom-modal-close">&times;</span>
      <h2 class="custom-modal-title">${title}</h2>
      <div class="custom-modal-body">
        ${content}
      </div>
    </div>
  `;
  
  document.body.appendChild(modalElement);
  
  const closeButton = modalElement.querySelector('.custom-modal-close');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalElement);
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  });
  
  return {
    close: () => {
      document.body.removeChild(modalElement);
    },
    updateContent: (newContent) => {
      modalElement.querySelector('.custom-modal-body').innerHTML = newContent;
    }
  };
};

// Modal CSS
export const modalCSS = `
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.custom-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.custom-modal-close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.custom-modal-title {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 1.5rem;
}

.custom-modal-body {
  margin-bottom: 15px;
}
`; 