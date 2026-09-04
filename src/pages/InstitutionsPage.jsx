import React from 'react';
import InstitutionsHero from '../components/institutions/InstitutionsHero';
import InstitutionalNetwork from '../components/institutions/InstitutionalNetwork';
import DirectInstitutions from '../components/institutions/DirectInstitutions';
import CollaboratingInstitutions from '../components/institutions/CollaboratingInstitutions';
import CoordinationRole from '../components/institutions/CoordinationRole';
import InstitutionDirectoryNotice from '../components/institutions/InstitutionDirectoryNotice';
import InstitutionsCTA from '../components/institutions/InstitutionsCTA';

export const InstitutionsPage = () => {
  return (
    <div className="w-full">
      <InstitutionsHero />
      <InstitutionalNetwork />
      <DirectInstitutions />
      <CollaboratingInstitutions />
      <CoordinationRole />
      <InstitutionDirectoryNotice />
      <InstitutionsCTA />
    </div>
  );
};

export default InstitutionsPage;
