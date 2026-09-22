import { Metadata } from 'next';
import StudentLayoutClient from '@/components/student/StudentLayoutClient';

export const metadata: Metadata = {
  title: 'MISC Student Portal | Academic & Examination Hub',
  description: 'Markaz Integrated Studies Council (MISC) Student Academic & Examination Management Portal',
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}
