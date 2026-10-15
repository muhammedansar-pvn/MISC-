import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import MissionSection from '@/components/home/MissionSection';
import VisionSection from '@/components/home/VisionSection';
import AcademicPillars from '@/components/home/AcademicPillars';
import ChancellorMessageSection from '@/components/home/ChancellorMessageSection';
import FounderMessageSection from '@/components/home/FounderMessageSection';
import LibrarySection from '@/components/home/LibrarySection';
import CampusLifeSection from '@/components/home/CampusLifeSection';
import GallerySection from '@/components/home/GallerySection';
import FinalCTA from '@/components/home/FinalCTA';
import InstitutionalLogoStrip from '@/components/home/InstitutionalLogoStrip';

export const metadata: Metadata = {
  title: 'Markaz Sanaviyya Academy | Nurturing Knowledge. Inspiring Leadership.',
  description:
    'Official website of Markaz Sanaviyya Academy, Jamia Markaz, Karanthur. Harmonising authentic Islamic scholarship with modern academic excellence, ethical values, and leadership.',
};

export default function HomePage() {
  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* 1. HERO SECTION: Refined two-column layout with authentic photo & light-blue accents */}
      <HeroSection />

      {/* 2. ABOUT SECTION: "An Institution Rooted in Knowledge and Purpose" */}
      <AboutSection />

      {/* 3. MISSION SECTION: Approved text, generous whitespace, soft light-blue background */}
      <MissionSection />

      {/* 4. VISION SECTION: Approved text, visually distinct with academic blue accents */}
      <VisionSection />

      {/* 5. ACADEMIC IDENTITY & EDUCATIONAL EXPERIENCE: 5 approved themes */}
      <AcademicPillars />

      {/* 6. CHANCELLOR'S MESSAGE: Approved message and verified institutional attribution */}
      <ChancellorMessageSection />

      {/* 7. FOUNDER'S MESSAGE: "A Vision for Generations" attributed to Sheikh Abubakar Ahmad */}
      <FounderMessageSection />

      {/* 8. LIBRARY SECTION: "A Gateway to Knowledge", 500+ Books, Tafseer, Aqeedah, Nahw, Fiqh */}
      <LibrarySection />

      {/* 9. ACTIVITIES & STUDENT LIFE: Halaqas, rhetoric, tarbiyah, and community leadership */}
      <CampusLifeSection />

      {/* 10. GALLERY: Authentic institutional photography and campus moments */}
      <GallerySection />

      {/* 11. CLOSING INSTITUTIONAL CTA */}
      <FinalCTA />

      {/* 12. AFFILIATION & INSTITUTIONAL STRIP */}
      <InstitutionalLogoStrip />
    </div>
  );
}
