import React from 'react';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import AcademicPillars from '../components/home/AcademicPillars';
import InstitutionalHighlightsSection from '../components/home/InstitutionalHighlightsSection';
import FeaturedInstitutionSection from '../components/home/FeaturedInstitutionSection';
import CoreServicesSection from '../components/home/CoreServicesSection';
import ImportantResourcesSection from '../components/home/ImportantResourcesSection';
import LatestUpdatesSection from '../components/home/LatestUpdatesSection';
import FinalCTA from '../components/home/FinalCTA';

export const HomePage = () => {
  return (
    <div className="w-full bg-[#F7F7F3] overflow-x-hidden">
      {/* 1. CINEMATIC FULL-BLEED HERO & MINIMAL STAT RAIL */}
      <HeroSection />

      {/* 2. EDITORIAL INTRODUCTION (01 ABOUT MISC) */}
      <AboutSection />

      {/* 3. VISION & PRINCIPLES (02 VISION) */}
      <AcademicPillars />

      {/* 4. THE ACADEMIC ECOSYSTEM (03 THE MISC FRAMEWORK - DARK NAVY) */}
      <InstitutionalHighlightsSection />

      {/* 5. FEATURED INSTITUTION (04 JAMIA MARKAZ KARANTHUR) */}
      <FeaturedInstitutionSection />

      {/* 6. PROGRAMMES SHOWCASE (05 ACADEMIC STREAMS - HORIZONTAL ROWS) */}
      <CoreServicesSection />

      {/* 7. ACADEMIC STANDARDS (06 BOARD GOVERNANCE) */}
      <ImportantResourcesSection />

      {/* 8. NEWS & NOTICES (07 EDITORIAL DISPATCHES) */}
      <LatestUpdatesSection />

      {/* 9. FINAL CLOSING CTA */}
      <FinalCTA />
    </div>
  );
};

export default HomePage;
