import React, { useState, useEffect } from 'react';
import './UserFormModal.css'

export default function UserFormModal({ isOpen, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    altPhone: "",
    address: "",
    zip: "",
    city: "",
  });

  const [message, setMessage] = useState("");
  
  // Load stored user data if available
  useEffect(() => {
    try {
      const savedUserData = sessionStorage.getItem('user');
      if (savedUserData) {
        const parsedData = JSON.parse(savedUserData);
        setFormData(parsedData);
      }
    } catch (error) {
      console.error("Error loading saved user data:", error);
    }
  }, [isOpen]); // Reload when modal opens

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    // Save to sessionStorage immediately as backup
    try {
      sessionStorage.setItem('user', JSON.stringify(formData));
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
    }
    
    await onSubmit(formData); // Pass data to parent
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2 className="form-title">Enter Delivery Details</h2>
        <form onSubmit={handleSubmit} className="user-form">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
          <input name="altPhone" value={formData.altPhone} onChange={handleChange} placeholder="Alternate Phone Number" />
          <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Full Address" required />
          <div className="form-row">
            <input name="zip" value={formData.zip} onChange={handleChange} placeholder="Zip Code" required />
            <input name="city" value={formData.city} onChange={handleChange} placeholder="City" required />
          </div>
          <button type="submit" disabled={loading} className={loading ? "btn-loading" : ""}>
            {loading ? "" : "Submit & Pay"}
          </button>
          {message && <p className="form-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}