import React, { useEffect, useState } from 'react';
import './Main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from "react-router-dom";

const Main = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleScroll = () => {
    const scrollElements = document.querySelectorAll('.scroll-animation');
    scrollElements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (elementPosition < windowHeight - 100) {
        element.classList.add('visible');
      }
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="main">
      <section id="hero" className="hero section">
        <div className="container">
          <div className="row gy-4 justify-content-between align-items-center">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center hero-content">
              <h1 className={`scroll-animation ${isLoaded ? 'visible' : ''}`} data-delay="0">
                Welcome to <br />Venkatalakshmi Mess
              </h1>
              <p className={`scroll-animation ${isLoaded ? 'visible' : ''}`} data-delay="200">
             We Offer  unlimited, home-cooked breakfast and lunch at unbeatable prices. Enjoy hygienic, tasty, and wholesome meals every day!
              </p>
              <div className={`hero-buttons scroll-animation ${isLoaded ? 'visible' : ''}`} data-delay="400">
                <Link to="/order" className="btn-get-started">
                  Book Now
                </Link>
                <a href="#about" className="btn-discover">
                  <span>Discover More</span>
                  <i className="fas fa-long-arrow-alt-right"></i>
                </a>
              </div>
              <div className={`hero-features scroll-animation ${isLoaded ? 'visible' : ''}`} data-delay="600">
                <div className="feature">
                  <i className="fas fa-leaf"></i>
                  <span>Fresh Ingredients</span>
                </div>
                <div className="feature">
                  <i className="fas fa-utensils"></i>
                  <span>Expert Chefs</span>
                </div>
                <div className="feature">
                  <i className="fas fa-award"></i>
                  <span>15+ Years of Trust</span>
                </div>
              </div>
            </div>
            <div className={`col-lg-6 order-1 order-lg-2 hero-img scroll-animation ${isLoaded ? 'visible' : ''}`} data-delay="200">
              <div className="img-container">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Main%20Photo%20starting%2Fmain.jpg?alt=media&token=ba8fb2e4-ac84-4449-bcee-a573884634ca"
                  className="img-fluid animated"
                  alt="Traditional South Indian Meal"
                  loading="eager"
                />
              </div>
              <div className="experience-badge">
                <span className="number">15+</span>
                <span className="text">Years of Experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Main;
