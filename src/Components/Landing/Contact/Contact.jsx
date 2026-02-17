import React, { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
// import 'aos/dist/aos.css';
import './Contact.css';

const contactInfo = [
  {
    id: 'address',
    icon: 'fas fa-map-marker-alt',
    title: 'Address',
    content: 'Beside venkatalaxmi Kalyana Mantapa',
    delay: 100
  },
  {
    id: 'phone',
    icon: 'fas fa-phone',
    title: 'Call Us',
    content: '9008057055   ,7022197488',
    delay: 150
  },
  {
    id: 'email',
    icon: 'fas fa-envelope',
    title: 'Email Us',
    content: 'ananthapadmanabhaaithal@gmail.com ',
    delay: 200
  },
  {
    id: 'hours',
    icon: 'fas fa-clock',
    title: 'Opening Hours',
    content: <><strong>Mon-Sun:</strong> 8AM - 7PM </>,
    delay: 250
  }
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const [animationsInitialized, setAnimationsInitialized] = useState(false);

  useEffect(() => {
    // Only initialize AOS once
    if (!animationsInitialized) {
      AOS.init({
        once: true,
        duration: 500, // Reduced animation duration
        easing: 'ease',
        startEvent: 'DOMContentLoaded', // Changed from default 'load'
        offset: 50, // Reduced from default 120
        delay: 0, // No default delay
        throttleDelay: 99, // Increased debounce delay
        disable: window.innerWidth < 768 ? true : false // Disable on mobile
      });
      setAnimationsInitialized(true);
    }
  }, [animationsInitialized]);

  // Refresh AOS when component is visible in viewport
  useEffect(() => {
    const handleScroll = () => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        // Check if element is in viewport
        if (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        ) {
          if (window.AOS) {
            window.AOS.refresh();
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (formStatus === 'sent' || formStatus === 'error') {
      const timer = setTimeout(() => {
        setFormStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormStatus('loading');

    // Simulate form submission
    setTimeout(() => {
      setFormStatus('sent');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <section id="contact" className="contact-section">
      {/* Section Title - Reduced margins */}
      <div className="container section-title" data-aos="fade-up" data-aos-offset="10">
        <h2>Contact</h2>
        <p>
          <span>Need Help?</span>{' '}
          <span className="highlight">Contact Us</span>
        </p>
      </div>

      <div className="container" data-aos-offset="10">
        {/* Google Maps Embed - Reduced height */}
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d969.4560358483868!2d74.69421294101392!3d13.607550260283492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbc91002a02398b%3A0xd1e02b694372bcb8!2sVenkatalaxmi%20Builders!5e0!3m2!1sen!2sin!4v1744096878751!5m2!1sen!2sin"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Venkatalaxmi Builders Location"
            aria-label="Google Map showing Venkatalaxmi Builders location"
          ></iframe>
        </div>

        {/* Contact Info Cards - Reduced padding */}
        <div className="info-cards">
          {contactInfo.map(item => (
            <div
              className="info-card"
              key={item.id}
              data-aos="fade-up"
              data-aos-offset="10"
              data-aos-delay={item.delay}
            >
              <div className="info-icon">
                <i className={`${item.icon}`} aria-hidden="true"></i>
              </div>
              <div className="info-content">
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form with reduced padding */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="contact-form"
          data-aos="fade-up"
          data-aos-offset="10"
          data-aos-delay="300"
        >
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="visually-hidden">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Your Name"
                aria-required="true"
              />
              {errors.name && <div className="error-feedback">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="visually-hidden">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Your Email"
                aria-required="true"
              />
              {errors.email && <div className="error-feedback">{errors.email}</div>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="subject" className="visually-hidden">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                placeholder="Subject"
                aria-required="true"
              />
              {errors.subject && <div className="error-feedback">{errors.subject}</div>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="message" className="visually-hidden">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                rows="5" // Reduced from 6
                placeholder="Message"
                aria-required="true"
              ></textarea>
              {errors.message && <div className="error-feedback">{errors.message}</div>}
            </div>

            <div className="form-submit">
              {formStatus === 'loading' && (
                <div className="form-status loading">
                  <div className="spinner"></div>
                </div>
              )}

              {formStatus === 'error' && (
                <div className="form-status error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>There was an error. Please try again.</span>
                </div>
              )}

              {formStatus === 'sent' && (
                <div className="form-status success">
                  <i className="fas fa-check-circle"></i>
                  <span>Your message has been sent. Thank you!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={formStatus === 'loading'}
                className="submit-button"
              >
                Send Message
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;