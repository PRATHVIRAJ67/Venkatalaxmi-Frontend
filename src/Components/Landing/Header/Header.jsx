import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileNav = () => {
    const nextState = !isMobileNavActive;
    setIsMobileNavActive(nextState);
    document.body.classList.toggle('mobile-nav-active', nextState);
  };

  const closeMobileNav = () => {
    setIsMobileNavActive(false);
    document.body.classList.remove('mobile-nav-active');
  };

  return (
    <header id="header" className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container-fluid container-xl d-flex align-items-center justify-content-between">

        <a href="/" className="logo d-flex align-items-center">
          {/* Use logo image or text if image fails to load */}
          <img src="/Venkatalakshmi-Logo.png" alt="Venkatalakshmi Mess" className="img-fluid" />
          <span className="ms-2">Venkatalakshmi Mess</span>
        </a>

        <nav id="navbar" className={`navbar ${isMobileNavActive ? 'navbar-mobile' : ''}`}>
          <ul>
            <li><a className="nav-link scrollto active" href="#hero" onClick={closeMobileNav}>Home</a></li>
            <li><a className="nav-link scrollto" href="#about" onClick={closeMobileNav}>About</a></li>
            <li><a className="nav-link scrollto" href="#menu" onClick={closeMobileNav}>Menu</a></li>
            <li><a className="nav-link scrollto" href="#gallery" onClick={closeMobileNav}>Gallery</a></li>
            <li><a className="nav-link scrollto" href="#contact" onClick={closeMobileNav}>Contact</a></li>
            <li><a className="getstarted scrollto" href="/order">Order Now</a></li>
          </ul>
        </nav>

        <i className={`mobile-nav-toggle ${isMobileNavActive ? 'fas fa-times' : 'fas fa-bars'}`} onClick={toggleMobileNav}></i>

      </div>
    </header>
  );
};

export default Header;
