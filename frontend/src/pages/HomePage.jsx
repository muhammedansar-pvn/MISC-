import React from 'react';
import HeroSection from '../components/home/HeroSection';
import QuickAccessSection from '../components/home/QuickAccessSection';
import AboutSection from '../components/home/AboutSection';
import CoreServicesSection from '../components/home/CoreServicesSection';
import LatestUpdatesSection from '../components/home/LatestUpdatesSection';
import InstitutionalHighlightsSection from '../components/home/InstitutionalHighlightsSection';
import ImportantResourcesSection from '../components/home/ImportantResourcesSection';
import FinalCTA from '../components/home/FinalCTA';

export const HomePage = () => {
  return (
    <div className="w-full bg-[#F7F8F5]">
      {/* 1. CINEMATIC HERO */}
      <HeroSection />

      {/* 2. QUICK ACCESS GATEWAY */}
      <QuickAccessSection />

      {/* 3. SHORT MISC INTRO */}
      <AboutSection />

      {/* 4. CORE SERVICES / PILLARS */}
      <CoreServicesSection />

      {/* 5. LATEST UPDATES & ANNOUNCEMENTS */}
      <LatestUpdatesSection />

      {/* 6. INSTITUTIONAL HIGHLIGHTS */}
      <InstitutionalHighlightsSection />

      {/* 7. IMPORTANT RESOURCES & PORTALS */}
      <ImportantResourcesSection />

      {/* 8. FINAL CLOSING CTA */}
      <FinalCTA />
    </div>
  );
};

export default HomePage;
