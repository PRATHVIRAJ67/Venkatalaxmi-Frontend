import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Footer() {
  return (
    <div className="container-fluid p-0">
      {/* Footer */}
      <footer
        className="text-center text-lg-start text-white"
        style={{ backgroundColor: "#2b2b2b" }}
      >
        {/* Grid container */}
        <div className="container p-4 pb-0">
          {/* Section: Links */}
          <section>
            {/*Grid row*/}
            <div className="row">
              {/* Grid column - About */}
              <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                <h6 className="text-uppercase mb-4 font-weight-bold">
                  Venkatalaxmi Mess
                </h6>
                <p>
                  Serving fresh, homely, and hygienic food at affordable prices. 
                  Perfect for locals, tourists, and working professionals looking 
                  for authentic home-cooked meals.
                </p>
                <div className="mt-3">
                  <img 
                    src="/img/Venkatalakshmi-Logo.png" 
                    alt="Venkatalaxmi-Logo" 
                    style={{ maxWidth: '150px' }} 
                  />
                </div>
              </div>
              {/* Grid column */}

              <hr className="w-100 clearfix d-md-none" />

              {/* Grid column - Menu */}
              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                <h6 className="text-uppercase mb-4 font-weight-bold">Menu</h6>
                <p>
                  <a className="text-white text-decoration-none" href="#menu">Daily Specials</a>
                </p>
                <p>
                  <a className="text-white text-decoration-none" href="#menu">Lunch Packages</a>
                </p>
                <p>
                  <a className="text-white text-decoration-none" href="#menu">Dinner Meals</a>
                </p>
                <p>
                  <a className="text-white text-decoration-none" href="#menu">Traditional Items</a>
                </p>
              </div>
              {/* Grid column */}

              <hr className="w-100 clearfix d-md-none" />

              {/* Grid column - Quick Links */}
              <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
                <h6 className="text-uppercase mb-4 font-weight-bold">
                  Quick Links
                </h6>
                <p>
                  <a className="text-white text-decoration-none" href="#hero">Home</a>
                </p>
                <p>
                  <a className="text-white text-decoration-none" href="#about">About Us</a>
                </p>
                <p>
                  <a className="text-white text-decoration-none" href="#gallery">Gallery</a>
                </p>
                <p>
                  <a className="text-white text-decoration-none" href="#contact">Contact</a>
                </p>
              </div>

              {/* Grid column */}
              <hr className="w-100 clearfix d-md-none" />

              {/* Grid column - Contact */}
              <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
                <h6 className="text-uppercase mb-4 font-weight-bold">Contact</h6>
                <p><i className="fas fa-home mr-3"></i> Beside venkatalaxmi Kalyana Mantapa-Hanglur-576217</p>
                <p><i className="fas fa-envelope mr-3"></i> ananthapadmanabhaaithal@gmail.com</p>
                <p><i className="fas fa-phone mr-3"></i> +91 9008057055</p>
                <p><i className="fas fa-clock mr-3"></i> Mon-Sun: 8AM - 7PM</p>
              </div>
              {/* Grid column */}
            </div>
            {/*Grid row*/}
          </section>
          {/* Section: Links */}

          <hr className="my-3" />

          {/* Section: Copyright and Social Media */}
          <section className="p-3 pt-0">
            <div className="row d-flex align-items-center">
              {/* Grid column - Copyright */}
              <div className="col-md-7 col-lg-8 text-center text-md-start">
                {/* Copyright */}
                <div className="p-3">
                  © {new Date().getFullYear()} Copyright:
                  <a className="text-white ms-2" href="#">
                    Venkatalaxmi Mess
                  </a>
                </div>
                {/* Copyright */}
              </div>
              {/* Grid column */}

              {/* Grid column - Social Media */}
              <div className="col-md-5 col-lg-4 ml-lg-0 text-center text-md-end">
                {/* Facebook */}
                <a
                  className="btn btn-outline-light btn-floating m-1"
                  role="button"
                  href="#!"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>

                {/* Instagram */}
                <a
                  className="btn btn-outline-light btn-floating m-1"
                  role="button"
                  href="#!"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>

                {/* WhatsApp */}
                <a
                  className="btn btn-outline-light btn-floating m-1"
                  role="button"
                  href="https://wa.me/9008057055"
                  aria-label="WhatsApp"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>

                {/* Google Maps */}
                <a
                  className="btn btn-outline-light btn-floating m-1"
                  role="button"
                  href="https://maps.app.goo.gl/3dZs9c8b5QTRQs8i6"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Location on Google Maps"
                >
                  <i className="fas fa-map-marker-alt"></i>
                </a>
              </div>
              {/* Grid column */}
            </div>
          </section>
          {/* Section: Copyright */}
        </div>
        {/* Grid container */}
      </footer>
      {/* Footer */}
    </div>
  );
}

export default Footer;