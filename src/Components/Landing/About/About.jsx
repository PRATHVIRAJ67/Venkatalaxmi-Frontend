import React from 'react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container section-title" data-aos="fade-up">
        <h2>About Us</h2>
        <p className='Subtitle'>
          <span className="subtitle">Learn More</span>{' '}
          <span className="description-title">About Us</span>
        </p>
      </div>

      <div className="container">
        <div className="about-content-wrapper">
          <div className="about-image-column" data-aos="fade-up" data-aos-delay="100">
            <img src="/img/about.jpg" className="main-image" alt="About Our Restaurant" />
            <div className="reservation-card">
              <h3>Book a Table</h3>
              <p className="+91 9632169727">+91 9632169727</p>
            </div>
          </div>

          <div className="about-text-column" data-aos="fade-up" data-aos-delay="250">
            <div className="content">
              <p className="intro-text">
                Venkatalaxmi Mess offers fresh, homely, and hygienic food at affordable prices, perfect for locals, tourists, and working professionals. Every meal is prepared with care using fresh ingredients and traditional recipes, ensuring a warm and authentic home-cooked experience.
              </p>

              <ul className="feature-list">
                <li className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Fresh, homely, and hygienic food at affordable prices</span>
                </li>
                <li className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Perfect for locals, tourists, and working professionals</span>
                </li>
                <li className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>
                    Every meal prepared with care, using fresh ingredients and traditional recipes
                  </span>
                </li>
              </ul>

              <p className="description-text">
                With a focus on taste, hygiene, and affordability, we prepare every meal with care,
                using fresh ingredients and traditional recipes. Whether you're craving a wholesome lunch
                or a simple, satisfying dinner, Venkatalaxmi Mess is here to serve you with the warmth
                and authenticity of home-cooked food.
              </p>

              <div className="video-container">
                <img src="/img/about-2.jpg" className="video-thumbnail" alt="Restaurant Interior" />
                <a
                  href=""
                  className="video-play-button"
                ></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;