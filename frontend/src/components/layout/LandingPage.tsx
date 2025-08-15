import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import FeatureSection from '../features/FeatureSection';
import Footer from './Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeatureSection />
      <Footer />
    </div>
  );
};

export default LandingPage;