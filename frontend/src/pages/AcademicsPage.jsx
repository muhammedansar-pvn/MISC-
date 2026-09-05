import React from 'react';
import AcademicsHero from '../components/academics/AcademicsHero';
import AcademicOverview from '../components/academics/AcademicOverview';
import AcademicPillarsSection from '../components/academics/AcademicPillarsSection';
import AcademicInformationHub from '../components/academics/AcademicInformationHub';
import AcademicResources from '../components/academics/AcademicResources';
import PublicationsOverview from '../components/academics/PublicationsOverview';
import AdmissionsOverview from '../components/academics/AdmissionsOverview';
import AcademicsCTA from '../components/academics/AcademicsCTA';

export const AcademicsPage = () => {
  return (
    <div className="w-full">
      <AcademicsHero />
      <AcademicOverview />
      <AcademicPillarsSection />
      <AcademicInformationHub />
      <AcademicResources />
      <PublicationsOverview />
      <AdmissionsOverview />
      <AcademicsCTA />
    </div>
  );
};

export default AcademicsPage;
