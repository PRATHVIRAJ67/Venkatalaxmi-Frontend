import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/a11y';
import './Testimonials.css';

const testimonialData = [
  {
    id: 1,
    content: 'ಇದು ನಮೂರ ತಟ್ಟೆ ಊಟವನ್ನ ತುಂಬಾ ನೆನಪಿಸುತ್ತೆ. ಸಜ್ಜನರು ಕೆಲಸ ಮಾಡ್ತಾರೆ, ಬಡಿದ ಹಸಿವಿಗೆ ನೆಮ್ಮದಿಯ ಔಷಧಿ ಇದು.',
    name: 'Ganesh ',
    role: 'CEO',
    image: 'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Testmonial%2Fimages.jpg?alt=media&token=1a2a3138-c3ee-4053-b701-b50d9a096c30'
  },
  {
    id: 2,
    content: 'ಅನಾ ಸಾರು, ಪಲ್ಯಾ, ತಿಂಡಿಗಳ ರುಚಿ ಬರೀ ಮನಸ್ಸಿಗೆ ಸಿಹಿ. Kundapura ಹೋಟೆಲ್ ಅಂದ್ರೆ ಈಜಾಗಕೋ ಬಾ ಅಂದ್ರೆ!',
    name: 'Saurabh Shetty',
    role: 'School Headmistress',
    image: 'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Testmonial%2Fyoung-man-isolated-blue_1368-124991.avif?alt=media&token=1a3d503a-6843-41df-bb7b-187d90538f81',
    stars: 5
  },
  {
    id: 3,
    content: 'ಮೇಲ್ನೋಟಕ್ಕೆ ಸಾಂಪ್ರದಾಯಿಕ, ಆದರೆ ಎಲ್ಲ ಡೀಟೈಲ್ ನಲ್ಲಿ ಕಾಳಜಿ. ಇಡ್ಲಿ ವಡೆ, ಸ್ಪೆಷಲ್ ಬಿಸಿಬೇಳೆ ಭಾತ್ ತುಂಬಾ ಚೆನ್ನಾಗಿತ್ತು.',
    name: 'Vinay Poojary',
    role: 'Travel Blogger',
    image: 'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Testmonial%2F360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg?alt=media&token=c24d7265-59d5-4618-bf86-74c06013bc9a',
    stars: 5
  },
  // {
  //   id: 4,
  //   content: 'ಹೆಣ್ಮಕ್ಕಳಿಗೆ ಇದೊಂದು ಸುರಕ್ಷಿತ, ಸ್ವಚ್ಛವಾದ ಜಾಗ ಅನ್ನಿಸ್ತು. ತುಮಕೂರಿಂದ ಬಂದ್ರೆ ಮಿಸ್ ಮಾಡಬೇಡಿ.',
  //   name: 'Shravani Shettar',
  //   role: 'College Student',
  //   image: '/img/testimonials/testimonials-4.jpg',
  //   stars: 5
  // },
  {
    id: 5,
    content: 'ಊಟ ಮಾಡೋದಕ್ಕಿಂತ ಮುಂಚೆ ಅಡಿಗೆಮನೆಯ ಘಮನೆ ಬೇಕಲ್ಲ, ಇಲ್ಲಿ ಅದು ಕೂಡಾ ಸಿಗುತ್ತೆ. ಬಾಯಿಗೆ ನೀರು ಬರುತ್ತೆ.',
    name: 'Raghavendra Bhat',
    role: 'Kannada Lecturer',
    image: 'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Testmonial%2Ftestmonial.jpg?alt=media&token=981670da-54f9-4175-9c2d-85e01c51ad87',
    stars: 5
  },
  // {
  //   id: 6,
  //   content: 'You can taste the home-style love in every dish. This place defines what real South Indian food should feel like.',
  //   name: 'Preethi Rao',
  //   role: 'UX Designer',
  //   image: '/img/testimonials/testimonials-6.jpg',
  //   stars: 5
  // },
  {
    id: 7,
    content: 'Clean space, great service, and the rasam was out of this world. Will definitely come back whenever I’m in Kundapura.',
    name: 'Srikanth',
    role: 'Startup Founder',
    image: 'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Testmonial%2Ftestmonial3.jpg?alt=media&token=34e5a141-79be-4884-96d3-c15641bc296d',
    stars: 5
  }
];

const Testimonials = () => {
  useEffect(() => {
    AOS.init({ 
      once: true,
      duration: 800,
      easing: 'ease-in-out'
    });
  }, []);

  
  const renderStars = (count) => {
    return Array(count).fill(0).map((_, index) => (
      <i key={index} className="bi bi-star-fill" aria-hidden="true"></i>
    ));
  };

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container section-title" data-aos="fade-up">
        <h2>TESTIMONIALS</h2>
        <p>
          What Are They <span className="highlight">Saying About Us</span>
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <Swiper
          modules={[Pagination, Autoplay, A11y]}
          loop={true}
          speed={800}
          autoplay={{ 
            delay: 5000,
            disableOnInteraction: false
          }}
          slidesPerView={1}
          spaceBetween={30}
          pagination={{ 
            clickable: true,
            dynamicBullets: true
          }}
          a11y={{
            prevSlideMessage: 'Previous testimonial',
            nextSlideMessage: 'Next testimonial'
          }}
          className="testimonials-slider"
        >
          {testimonialData.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <div className="testimonial-item">
                <div className="testimonial-wrapper">
                  <div className="testimonial-content">
                    <div className="quote-content">
                      <i className="bi bi-quote quote-icon-left" aria-hidden="true"></i>
                      <span>{testimonial.content}</span>
                      <i className="bi bi-quote quote-icon-right" aria-hidden="true"></i>
                    </div>
                    <div className="author-info">
                      <h3>{testimonial.name}</h3>
                      <h4>{testimonial.role}</h4>
                      <div className="stars" aria-label={`${testimonial.stars} out of 5 stars rating`}>
                        {renderStars(testimonial.stars)}
                      </div>
                    </div>
                  </div>
                  <div className="testimonial-image-container">
                    <img
                      src={testimonial.image}
                      className="testimonial-img"
                      alt={`Portrait of ${testimonial.name}`}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;