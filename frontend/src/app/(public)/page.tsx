import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import FeaturedHighlightSection from '@/components/home/FeaturedHighlightSection';
import AboutSection from '@/components/home/AboutSection';
import AcademicPillars from '@/components/home/AcademicPillars';
import InstitutionalHighlightsSection from '@/components/home/InstitutionalHighlightsSection';
import CoreServicesSection from '@/components/home/CoreServicesSection';
import FeaturedInstitutionSection from '@/components/home/FeaturedInstitutionSection';
import LatestUpdatesSection from '@/components/home/LatestUpdatesSection';
import EventsSection from '@/components/home/EventsSection';
import CampusLifeSection from '@/components/home/CampusLifeSection';
import ArticlesSection from '@/components/home/ArticlesSection';
import GallerySection from '@/components/home/GallerySection';
import ImportantResourcesSection from '@/components/home/ImportantResourcesSection';
import FinalCTA from '@/components/home/FinalCTA';
import InstitutionalLogoStrip from '@/components/home/InstitutionalLogoStrip';

export const metadata: Metadata = {
  title: 'Sanaviyya - Markaz Integrated Studies Council | Jamia Markaz',
  description:
    'Sanaviyya is the premier academic coordination council of Jamia Markaz, Karanthur, integrating classical Islamic scholarship with accredited university degree pathways and moral leadership.',
};

export default function HomePage() {
  return (
    <div className="w-full bg-misc-page overflow-x-hidden">
      {/* 1. CINEMATIC EDITORIAL HERO & MINIMAL STAT RAIL */}
      <HeroSection />

      {/* 2. DYNAMIC FEATURED HIGHLIGHT (APEX GAZETTE & SPOTLIGHT DISPATCHES) */}
      <FeaturedHighlightSection />

      {/* 3. EDITORIAL INTRODUCTION (01 ABOUT SANAVIYYA & JAMIA MARKAZ) */}
      <AboutSection />

      {/* 4. ACADEMIC PHILOSOPHY (02 SCHOLARSHIP, CHARACTER, EXCELLENCE, LEADERSHIP) */}
      <AcademicPillars />

      {/* 5. THE INTEGRATED FRAMEWORK (03 ACADEMIC ECOSYSTEM) */}
      <InstitutionalHighlightsSection />

      {/* 6. PROGRAMMES SHOWCASE (04 SANAVIYYA, MUTHAWWAL, ALIMIYYA & DIPLOMAS) */}
      <CoreServicesSection />

      {/* 7. INSTITUTIONAL FEDERATION (05 JAMIA MARKAZ & AFFILIATED CENTERS) */}
      <FeaturedInstitutionSection />

      {/* 8. NEWS & NOTICES (06 EDITORIAL DISPATCHES & CIRCULARS) */}
      <LatestUpdatesSection />

      {/* 9. ACADEMIC CALENDAR & UPCOMING EVENTS (07 CONVOCATIONS & SYMPOSIUMS) */}
      <EventsSection />

      {/* 10. STUDENT EXPERIENCE (08 HALAQAS, DEBATES, RESEARCH & COMMUNITY) */}
      <CampusLifeSection />

      {/* 11. SCHOLARLY DISCOURSE & ARTICLES (09 PEER-REVIEWED MONOGRAPHS) */}
      <ArticlesSection />

      {/* 12. CURATED VISUAL GALLERY (10 ASYMMETRIC CAMPUS MOMENTS) */}
      <GallerySection />

      {/* 13. OFFICIAL RESOURCES & DOWNLOADS (11 PROSPECTUS & REGULATIONS) */}
      <ImportantResourcesSection />

      {/* 14. FINAL CLOSING INSTITUTIONAL CTA */}
      <FinalCTA />

      {/* 15. JAMIA MARKAZ AFFILIATION STRIP */}
      <InstitutionalLogoStrip />
    </div>
  );
}
