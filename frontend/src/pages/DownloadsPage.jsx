import React from 'react';
import DownloadsHero from '../components/downloads/DownloadsHero';
import ResourceCentreIntro from '../components/downloads/ResourceCentreIntro';
import ResourceList from '../components/downloads/ResourceList';
import AcademicResourcesSection from '../components/downloads/AcademicResourcesSection';
import ExaminationResourcesSection from '../components/downloads/ExaminationResourcesSection';
import DownloadsFAQ from '../components/downloads/DownloadsFAQ';
import OfficialResourceNotice from '../components/downloads/OfficialResourceNotice';
import DownloadsCTA from '../components/downloads/DownloadsCTA';

export const DownloadsPage = () => {
  return (
    <div className="w-full">
      <DownloadsHero />
      <ResourceCentreIntro />
      <ResourceList />
      <AcademicResourcesSection />
      <ExaminationResourcesSection />
      <DownloadsFAQ />
      <OfficialResourceNotice />
      <DownloadsCTA />
    </div>
  );
};

export default DownloadsPage;
