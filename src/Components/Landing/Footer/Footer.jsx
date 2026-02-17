import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-content pt-5 pb-5">
          <div className="row">

            <div className="col-xl-4 col-lg-4 mb-50">
              <div className="footer-widget">
                <div className="footer-text">
                  <p>Serving authentic South Indian cuisine with love and tradition.
                    Experience the taste of home in every bite.</p>
                </div>
                <div className="footer-social-icon form-group mt-3">
                  <span>Follow us</span>
                  <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f facebook-bg"></i></a>
                  <a href="#" aria-label="Twitter"><i className="fab fa-twitter twitter-bg"></i></a>
                  <a href="#" aria-label="Instagram"><i className="fab fa-instagram instagram-bg"></i></a>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-4 col-md-6 mb-30">
              <div className="footer-widget">
                <div className="footer-widget-heading">
                  <h3>Quick Links</h3>
                </div>
                <ul>
                  <li><a href="#hero">Home</a></li>
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#menu">Menu</a></li>
                  <li><a href="#gallery">Gallery</a></li>
                  <li><a href="/order">Order Now</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
            </div>

            <div className="col-xl-4 col-lg-4 col-md-6 mb-50">
              <div className="footer-widget">
                <div className="footer-widget-heading">
                  <h3>Contact Info</h3>
                </div>
                <div className="footer-contact-info">
                  <div className="single-contact">
                    <i className="fas fa-map-marker-alt"></i>
                    <div className="contact-text">
                      <h4>Find us</h4>
                      <p>Beside Venkatalaxmi Kalyana Mantapa, Hanglur - 576217</p>
                    </div>
                  </div>
                  <div className="single-contact">
                    <i className="fas fa-phone"></i>
                    <div className="contact-text">
                      <h4>Call us</h4>
                      <p>+91 9008057055</p>
                    </div>
                  </div>
                  <div className="single-contact">
                    <i className="far fa-envelope"></i>
                    <div className="contact-text">
                      <h4>Mail us</h4>
                      <p>ananthapadmanabhaaithal@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="copyright-area">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-6 text-center text-lg-start">
              <div className="copyright-text">
                <p>Copyright &copy; {currentYear}, All Right Reserved <a href="/">Venkatalakshmi Mess</a></p>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 d-none d-lg-block text-right">
              <div className="footer-menu">
                <ul>
                  <li><a href="#">Home</a></li>
                  <li><a href="#">Terms</a></li>
                  <li><a href="#">Privacy</a></li>
                  <li><a href="#">Policy</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;