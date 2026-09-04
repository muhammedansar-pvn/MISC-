import React from 'react';
import AboutHero from '../components/about/AboutHero';
import InstitutionalOverview from '../components/about/InstitutionalOverview';
import VisionSection from '../components/about/VisionSection';
import MissionSection from '../components/about/MissionSection';
import EducationalFramework from '../components/about/EducationalFramework';
import InstitutionalCoordination from '../components/about/InstitutionalCoordination';
import AboutCTA from '../components/about/AboutCTA';

export const AboutPage = () => {
  return (
    <div className="w-full">
      <AboutHero />
      <InstitutionalOverview />
      <VisionSection />
      <MissionSection />
      <EducationalFramework />
      <InstitutionalCoordination />
      <AboutCTA />
    </div>
  );
};

export default AboutPage;
