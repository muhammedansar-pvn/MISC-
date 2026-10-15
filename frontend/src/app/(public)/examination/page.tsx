import type { Metadata } from 'next';
import ExaminationHero from '@/components/examination/ExaminationHero';
import ExaminationOverview from '@/components/examination/ExaminationOverview';
import ExaminationFramework from '@/components/examination/ExaminationFramework';
import ExaminationCategories from '@/components/examination/ExaminationCategories';
import ExaminationRegulations from '@/components/examination/ExaminationRegulations';
import ExaminationResources from '@/components/examination/ExaminationResources';
import ExaminationGuidance from '@/components/examination/ExaminationGuidance';
import ExaminationNotice from '@/components/examination/ExaminationNotice';
import ExaminationCTA from '@/components/examination/ExaminationCTA';

export const metadata: Metadata = {
  title: 'Examination Framework | Markaz Sanaviyya Academy · Jamia Markaz',
  description:
    'Official examination board policies, schedules, evaluations, and grading standards of Markaz Sanaviyya Academy.',
};


export default function ExaminationPage() {
  return (
    <div className="w-full">
      <ExaminationHero />
      <ExaminationOverview />
      <ExaminationFramework />
      <ExaminationCategories />
      <ExaminationRegulations />
      <ExaminationResources />
      <ExaminationGuidance />
      <ExaminationNotice />
      <ExaminationCTA />
    </div>
  );
}
