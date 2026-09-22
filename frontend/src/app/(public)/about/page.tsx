import type { Metadata } from 'next';
import AboutHero from '@/components/about/AboutHero';
import InstitutionalOverview from '@/components/about/InstitutionalOverview';
import VisionSection from '@/components/about/VisionSection';
import MissionSection from '@/components/about/MissionSection';
import EducationalFramework from '@/components/about/EducationalFramework';
import InstitutionalCoordination from '@/components/about/InstitutionalCoordination';
import AboutCTA from '@/components/about/AboutCTA';

export const metadata: Metadata = {
  title: 'About MISC - Markaz Integrated Studies Council',
  description:
    'Learn about the vision, mission, educational framework, and institutional coordination of Markaz Integrated Studies Council (MISC).',
};

export default function AboutPage() {
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
}
