import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './Gallery.css';

const galleryImages = [
  'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Gallery%2FWhatsApp%20Image%202025-05-18%20at%2013.08.27_16ef641e.jpg?alt=media&token=d388cc51-d3ec-477c-9e13-deeb933656e0',
  'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Gallery%2F2.png?alt=media&token=6b96b69e-6096-4fc7-87b3-1f13756dd5f8',
  'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Gallery%2FWhatsApp%20Image%202025-05-18%20at%2013.08.27_e5cebc4e.jpg?alt=media&token=354ca1a0-f10f-443b-ad87-ade7c12d8b8c',
  'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Gallery%2F5.png?alt=media&token=e6e0b084-2795-4fe0-b35c-f2155261d02e',
  'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Gallery%2FWhatsApp%20Image%202025-05-18%20at%2013.08.27_16ef641e.jpg?alt=media&token=d388cc51-d3ec-477c-9e13-deeb933656e0',
    
  'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Gallery%2F2.png?alt=media&token=6b96b69e-6096-4fc7-87b3-1f13756dd5f8',
    'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Gallery%2FWhatsApp%20Image%202025-05-18%20at%2013.08.27_16ef641e.jpg?alt=media&token=d388cc51-d3ec-477c-9e13-deeb933656e0',
  'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Gallery%2FWhatsApp%20Image%202025-05-18%20at%2013.08.27_e5cebc4e.jpg?alt=media&token=354ca1a0-f10f-443b-ad87-ade7c12d8b8c',
  'https://firebasestorage.googleapis.com/v0/b/authentication-5c66e.appspot.com/o/Gallery%2F5.png?alt=media&token=e6e0b084-2795-4fe0-b35c-f2155261d02e',

 
];

const Gallery = () => {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <section id="gallery" className="gallery section light-background">
      
      <div className="container section-title" data-aos="fade-up">
        <h2>Gallery</h2>
        <p>
          <span>Check</span>{' '}
          <span className="description-title">Our Gallery</span>
        </p>
      </div>

      
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <Swiper
          modules={[Autoplay, Pagination]}
          loop={true}
          speed={600}
          autoplay={{ delay: 5000 }}
          slidesPerView="auto"
          centeredSlides={true}
          pagination={{ clickable: true }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 0,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1200: {
              slidesPerView: 5,
              spaceBetween: 20,
            },
          }}
          className="gallery-swiper"
        >
          {galleryImages.map((img, idx) => (
            <SwiperSlide key={idx} className="swiper-slide align-items-center">
              <div className="gallery-image-wrapper">
                <img
                  src={img}
                  className="img-fluid"
                  alt={`Gallery ${idx + 1}`}
                  draggable="false"
                  onError={(e) => {
                    console.error(`Failed to load image ${idx + 1}:`, img);
                    e.target.style.display = 'none';
                  }}
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}

        </Swiper>
        <div className="swiper-pagination" />
      </div>
    </section>
  );
};

export default Gallery;