import React, { useEffect } from 'react';
import Main from './Main/Main';
import About from './About/About';
import MenuSection from './MenuSection/MenuSection';
import Testimonials from './Testiminials/Testimonilas';
import Gallery from './Gallery/Gallery';
import Contact from './Contact/Contact';
import useSEO from '../hooks/useSEO';
import { generateRestaurantSchema } from '../../services/restaurantSchema';
// import ChatBotIcon from './ChatBotIcon'; 

const Home = () => {
  // Create restaurant schema for this page
  const restaurantSchema = generateRestaurantSchema({
    name: 'Venkatalakshmi Mess',
    description: 'Authentic South Indian cuisine with traditional recipes handed down through generations. We serve fresh homemade food, sweets, and provide catering services in Kundapura, Udupi.',
    url: 'https://www.venkatalaxmimess.in/',
  });
  
  useSEO('HOME', {
    structuredData: restaurantSchema,
  });
  
  return (
    <>
      <Main />
      <About />
      <MenuSection />
      <Gallery />
      <Testimonials />
      <Contact />
    </>
  );
};

export default Home;