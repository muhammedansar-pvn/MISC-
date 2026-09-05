import React from 'react';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import AcademicExcellence from '../components/home/AcademicExcellence';
import AcademicPillars from '../components/home/AcademicPillars';
import AcademicProgrammes from '../components/home/AcademicProgrammes';
import InstitutionsOverview from '../components/home/InstitutionsOverview';
import ExaminationOverview from '../components/examination/ExaminationOverview';
import PublicationsOverview from '../components/academics/PublicationsOverview';
import FinalCTA from '../components/home/FinalCTA';

export const HomePage = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <AcademicExcellence />
      <AboutSection />
      <AcademicPillars />
      <AcademicProgrammes />
      <InstitutionsOverview />
      <ExaminationOverview />
      <PublicationsOverview />
      <FinalCTA />
    </div>
  );
};

export default HomePage;
