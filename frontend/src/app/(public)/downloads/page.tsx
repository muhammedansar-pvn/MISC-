import type { Metadata } from 'next';
import DownloadsHero from '@/components/downloads/DownloadsHero';
import ResourceCentreIntro from '@/components/downloads/ResourceCentreIntro';
import OfficialResourceNotice from '@/components/downloads/OfficialResourceNotice';
import AcademicResourcesSection from '@/components/downloads/AcademicResourcesSection';
import ExaminationResourcesSection from '@/components/downloads/ExaminationResourcesSection';
import DownloadsFAQ from '@/components/downloads/DownloadsFAQ';
import DownloadsCTA from '@/components/downloads/DownloadsCTA';

export const metadata: Metadata = {
  title: 'Official Downloads & Resources | Markaz Sanaviyya Academy · Jamia Markaz',
  description:
    'Access official academic syllabuses, guidelines, examination regulations, and resource downloads of Markaz Sanaviyya Academy.',
};


export default function DownloadsPage() {
  return (
    <div className="w-full bg-misc-page">
      {/* 1. HERO SECTION */}
      <DownloadsHero />

      {/* 2. RESOURCE GATEWAY */}
      <ResourceCentreIntro />

      {/* 3. FEATURED RESOURCE */}
      <OfficialResourceNotice />

      {/* 4. ACADEMIC DOCUMENTS */}
      <AcademicResourcesSection />

      {/* 5. EXAMINATION RESOURCES */}
      <ExaminationResourcesSection />

      {/* 6. FAQ SECTION */}
      <DownloadsFAQ />

      {/* 7. CTA / SUPPORT SECTION */}
      <DownloadsCTA />
    </div>
  );
}
