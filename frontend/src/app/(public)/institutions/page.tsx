import type { Metadata } from 'next';
import InstitutionsHero from '@/components/institutions/InstitutionsHero';
import InstitutionalNetwork from '@/components/institutions/InstitutionalNetwork';
import DirectInstitutions from '@/components/institutions/DirectInstitutions';
import CollaboratingInstitutions from '@/components/institutions/CollaboratingInstitutions';
import CoordinationRole from '@/components/institutions/CoordinationRole';
import InstitutionDirectoryNotice from '@/components/institutions/InstitutionDirectoryNotice';
import InstitutionsCTA from '@/components/institutions/InstitutionsCTA';

export const metadata: Metadata = {
  title: 'Institutions - Markaz Integrated Studies Council',
  description:
    'Discover direct and collaborating institutions under the academic coordination of MISC.',
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
