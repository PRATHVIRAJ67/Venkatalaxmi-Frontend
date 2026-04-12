import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './Gallery.css';

const galleryImages = [
  'https://res.cloudinary.com/dgslgpo8u/image/upload/v1775977454/Screenshot_2026-04-12_122808_dlnvje.png',
  'https://res.cloudinary.com/dgslgpo8u/image/upload/v1775977435/Screenshot_2026-04-12_122714_xnxhym.png',
  'https://res.cloudinary.com/dgslgpo8u/image/upload/v1775977657/Screenshot_2026-04-12_122932_zlt6qy.png',
  'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977657/Screenshot_2026-04-12_123125_wpi3ip.png',
  'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977657/Screenshot_2026-04-12_123019_afhrev.png',
  'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977657/Screenshot_2026-04-12_122946_tinhnd.png',
  'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977657/Screenshot_2026-04-12_122959_o5eqtz.png',
  'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977657/Screenshot_2026-04-12_122909_f9hdp6.png',
  'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977656/Screenshot_2026-04-12_123051_bns9ok.png',
  'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977656/Screenshot_2026-04-12_122834_kfsqws.png',
  'https://res.cloudinary.com/dgslgpo8u/image/upload/q_auto/f_auto/v1775977655/Screenshot_2026-04-12_122822_mannvz.png',
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
              slidesPerView: 1.2,
              spaceBetween: 15,
            },
            576: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            1200: {
              slidesPerView: 4,
              spaceBetween: 40,
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