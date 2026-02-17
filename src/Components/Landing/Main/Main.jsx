import React, { useEffect, useState } from 'react';
import './Main.css';
import { Link } from "react-router-dom";

const Main = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="main">
      <section id="hero" className="hero-section">
        <div className="container">
          <div className="row align-items-center gy-5">

            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center text-center text-lg-start">
              <div className={`hero-content ${isLoaded ? 'animate-fade-up' : ''}`}>
                <span className="badge-highlight">
                  <i className="fas fa-star me-2"></i> #1 Food in Kundapura
                </span>
                <h1 className="hero-title">
                  Taste the <span className="text-gradient">Tradition</span> of <br />
                  Home Cooking
                </h1>
                <p className="hero-subtitle">
                  Authentic South Indian meals, fresh ingredients, and the warmth of home.
                  Experience the best vegetarian cuisine in town.
                </p>

                <div className="hero-actions d-flex flex-column flex-sm-row align-items-center gap-3 justify-content-center justify-content-lg-start">
                  <Link to="/order" className="btn-primary-lg">
                    Order Now <i className="fas fa-arrow-right ms-2"></i>
                  </Link>
                  <a href="#menu" className="btn-secondary-lg">
                    View Menu
                  </a>
                </div>

                <div className="hero-stats d-flex gap-4 justify-content-center justify-content-lg-start mt-4 pt-2">
                  <div className="stat-item">
                    <span className="stat-number">15+</span>
                    <span className="stat-label">Years of<br />Service</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <span className="stat-number">4.8</span>
                    <span className="stat-label">Customer<br />Rating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 order-1 order-lg-2 hero-img text-center">
              <div className={`image-wrapper ${isLoaded ? 'animate-scale-in' : ''}`}>
                <div className="blob-bg"></div>
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Main%20Photo%20starting%2Fmain.jpg?alt=media&token=ba8fb2e4-ac84-4449-bcee-a573884634ca"
                  className="img-fluid main-img"
                  alt="Delicious South Indian Meal"
                  loading="eager"
                />

                {/* Floating Card Element */}
                <div className="floating-card card-1">
                  <i className="fas fa-motorcycle icon-bg"></i>
                  <div className="card-content">
                    <span className="card-title">Fast Delivery</span>
                    <span className="card-sub">Within 30 mins</span>
                  </div>
                </div>

                <div className="floating-card card-2">
                  <i className="fas fa-leaf icon-bg-green"></i>
                  <div className="card-content">
                    <span className="card-title">100% Veg</span>
                    <span className="card-sub">Pure & Fresh</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};

export default Main;
