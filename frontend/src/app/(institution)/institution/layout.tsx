import { Metadata } from 'next';
import InstitutionLayoutClient from '@/components/institution/InstitutionLayoutClient';

export const metadata: Metadata = {
  title: 'MISC Institution Portal | Affiliated Institution Academic Center',
  description: 'Markaz Integrated Studies Council (MISC) Affiliated Institution Academic & Evaluation Management Portal',
};

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InstitutionLayoutClient>{children}</InstitutionLayoutClient>;
}
