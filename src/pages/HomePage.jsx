import React from 'react';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import AcademicExcellence from '../components/home/AcademicExcellence';
import AcademicPillars from '../components/home/AcademicPillars';
import AcademicProgrammes from '../components/home/AcademicProgrammes';
import InstitutionsOverview from '../components/home/InstitutionsOverview';
import EventsOverview from '../components/home/EventsOverview';
import FinalCTA from '../components/home/FinalCTA';

export const HomePage = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <AboutSection />
      <AcademicExcellence />
      <AcademicPillars />
      <AcademicProgrammes />
      <InstitutionsOverview />
      <EventsOverview />
      <FinalCTA />
    </div>
  );
};

export default HomePage;
