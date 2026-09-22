import React from 'react';
import type { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'MISC Admin Portal - Markaz Integrated Studies Council',
  description: 'Centralized Administrative Management Portal for Markaz Integrated Studies Council',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
