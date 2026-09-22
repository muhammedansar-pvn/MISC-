import { Metadata } from 'next';
import FacultyLayoutClient from '@/components/faculty/FacultyLayoutClient';

export const metadata: Metadata = {
  title: 'MISC Faculty Portal | Academic & Examination Hub',
  description: 'Markaz Integrated Studies Council (MISC) Faculty Academic Evaluation & Course Management Portal',
};

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FacultyLayoutClient>{children}</FacultyLayoutClient>;
}
