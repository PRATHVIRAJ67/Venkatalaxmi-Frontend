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
    image: 'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977967/Review1_bgweop.png'
  },
  {
    id: 2,
    content: 'ಅನಾ ಸಾರು, ಪಲ್ಯಾ, ತಿಂಡಿಗಳ ರುಚಿ ಬರೀ ಮನಸ್ಸಿಗೆ ಸಿಹಿ. Kundapura ಹೋಟೆಲ್ ಅಂದ್ರೆ ಈಜಾಗಕೋ ಬಾ ಅಂದ್ರೆ!',
    name: 'Saurabh Shetty',
    image: 'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977967/Review2_pibdh4.png',
    stars: 5
  },
  {
    id: 3,
    content: 'ಮೇಲ್ನೋಟಕ್ಕೆ ಸಾಂಪ್ರದಾಯಿಕ, ಆದರೆ ಎಲ್ಲ ಡೀಟೈಲ್ ನಲ್ಲಿ ಕಾಳಜಿ. ಇಡ್ಲಿ ವಡೆ, ಸ್ಪೆಷಲ್ ಬಿಸಿಬೇಳೆ ಭಾತ್ ತುಂಬಾ ಚೆನ್ನಾಗಿತ್ತು.',
    name: 'Vinay Poojary',
    image: 'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977967/Review3_rjklr7.png',
    stars: 5
  },
  {
    id: 4,
    content: 'ಊಟ ಮಾಡೋದಕ್ಕಿಂತ ಮುಂಚೆ ಅಡಿಗೆಮನೆಯ ಘಮನೆ ಬೇಕಲ್ಲ, ಇಲ್ಲಿ ಅದು ಕೂಡಾ ಸಿಗುತ್ತೆ. ಬಾಯಿಗೆ ನೀರು ಬರುತ್ತೆ.',
    name: 'Savitha Bhat',
    image: 'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977967/Review_4_y11ppb.png',
    stars: 5
  },
  {
    id: 5,
    content: 'Clean space, great service, and the rasam was out of this world. Will definitely come back whenever I’m in Kundapura.',
    name: 'Ananya',
    image: 'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977968/Review5_vb4ynd.png',
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
    return Array(count || 5).fill(0).map((_, index) => (
      <i key={index} className="fas fa-star" aria-hidden="true"></i>
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
                      <i className="fas fa-quote-left quote-icon-left" aria-hidden="true"></i>
                      <span>{testimonial.content}</span>
                      <i className="fas fa-quote-right quote-icon-right" aria-hidden="true"></i>
                    </div>
                    <div className="author-info">
                      <h3>{testimonial.name}</h3>
                      <div className="stars" aria-label={`${testimonial.stars || 5} out of 5 stars rating`}>
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