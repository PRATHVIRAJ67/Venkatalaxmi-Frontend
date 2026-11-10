import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const PHONE_DISPLAY = '+91 96321 69727';
const PHONE_LINK = 'tel:+919632169727';

const HIGHLIGHTS = [
  {
    icon: 'fas fa-leaf',
    title: 'Fresh & Hygienic',
    text: 'Cooked fresh every day in a clean kitchen with quality ingredients.',
  },
  {
    icon: 'fas fa-indian-rupee-sign',
    title: 'Affordable Prices',
    text: 'Honest, home-style meals that fit every budget.',
  },
  {
    icon: 'fas fa-users',
    title: 'Small Group Packs',
    text: 'Meal packages for 5 to 10 people — family, office or travel.',
  },
];

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid">
          {/* Story */}
          <div className="about-story" data-aos="fade-up">
            <span className="about-eyebrow">About Us</span>
            <h2 className="about-title">
              Homely food, served with <span>warmth</span>
            </h2>
            <p className="about-lead">
              Venkatalaxmi Mess serves fresh, homely and hygienic food at affordable prices —
              for locals, tourists and working professionals alike.
            </p>
            <p className="about-text">
              Every meal is prepared with care using fresh ingredients and traditional recipes.
              Whether you want a wholesome lunch, a quick breakfast or sweets for an occasion,
              we bring you the taste and comfort of home-cooked food.
            </p>

            <ul className="about-info">
              <li><i className="fas fa-clock"></i> Open daily, 8 AM – 7 PM</li>
              <li><i className="fas fa-location-dot"></i> Hanglur, Kundapura</li>
              <li><i className="fas fa-seedling"></i> 100% Vegetarian</li>
            </ul>

            <div className="about-actions">
              <Link to="/order" className="about-btn about-btn-primary">
                Order Now <i className="fas fa-arrow-right"></i>
              </Link>
              <a href={PHONE_LINK} className="about-btn about-btn-ghost">
                <i className="fas fa-phone"></i> {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          {/* Highlights */}
          <div className="about-highlights" data-aos="fade-up" data-aos-delay="150">
            {HIGHLIGHTS.map((item) => (
              <div className="about-highlight" key={item.title}>
                <span className="about-highlight-icon"><i className={item.icon}></i></span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
