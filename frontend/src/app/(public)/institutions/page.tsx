import type { Metadata } from 'next';
import InstitutionsHero from '@/components/institutions/InstitutionsHero';
import InstitutionalNetwork from '@/components/institutions/InstitutionalNetwork';
import DirectInstitutions from '@/components/institutions/DirectInstitutions';
import CollaboratingInstitutions from '@/components/institutions/CollaboratingInstitutions';
import CoordinationRole from '@/components/institutions/CoordinationRole';
import InstitutionDirectoryNotice from '@/components/institutions/InstitutionDirectoryNotice';
import InstitutionsCTA from '@/components/institutions/InstitutionsCTA';

export const metadata: Metadata = {
  title: 'Affiliated Institutions | Markaz Sanaviyya Academy · Jamia Markaz',
  description:
    'Discover direct and collaborating educational centres under the academic coordination of Markaz Sanaviyya Academy.',
};


export default function InstitutionsPage() {
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
}
