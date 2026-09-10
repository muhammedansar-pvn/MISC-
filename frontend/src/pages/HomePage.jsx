import React from 'react';
import HeroSection from '../components/home/HeroSection';
import QuickAccessSection from '../components/home/QuickAccessSection';
import AboutSection from '../components/home/AboutSection';
import AcademicPillars from '../components/home/AcademicPillars';
import InstitutionalHighlightsSection from '../components/home/InstitutionalHighlightsSection';
import CoreServicesSection from '../components/home/CoreServicesSection';
import LatestUpdatesSection from '../components/home/LatestUpdatesSection';
import ImportantResourcesSection from '../components/home/ImportantResourcesSection';
import FinalCTA from '../components/home/FinalCTA';

export const HomePage = () => {
  return (
    <div className="w-full bg-[#F7F8F5]">
      {/* 1. INSTITUTIONAL HERO */}
      <HeroSection />

      {/* 2. QUICK ACCESS GATEWAY */}
      <QuickAccessSection />

      {/* 3. EDITORIAL ABOUT MISC INTRO */}
      <AboutSection />

      {/* 4. VISION & MISSION FRAMEWORK */}
      <AcademicPillars />

      {/* 5. THE MISC ECOSYSTEM & GOVERNANCE SCOPE */}
      <InstitutionalHighlightsSection />

      {/* 6. ACADEMIC INFRASTRUCTURE & PILLARS */}
      <CoreServicesSection />

      {/* 7. NOTICES & ACADEMIC CIRCULARS */}
      <LatestUpdatesSection />

      {/* 8. ESSENTIAL RESOURCES & PORTALS */}
      <ImportantResourcesSection />

      {/* 9. FINAL CLOSING CTA */}
      <FinalCTA />
    </div>
  );
};

export default HomePage;
