import React from 'react';
import DownloadsHero from '../components/downloads/DownloadsHero';
import ResourceCentreIntro from '../components/downloads/ResourceCentreIntro';
import OfficialResourceNotice from '../components/downloads/OfficialResourceNotice';
import AcademicResourcesSection from '../components/downloads/AcademicResourcesSection';
import ExaminationResourcesSection from '../components/downloads/ExaminationResourcesSection';
import DownloadsFAQ from '../components/downloads/DownloadsFAQ';
import DownloadsCTA from '../components/downloads/DownloadsCTA';

export const DownloadsPage = () => {
  return (
    <div className="w-full bg-[#F7F8F5]">
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
};

export default DownloadsPage;
