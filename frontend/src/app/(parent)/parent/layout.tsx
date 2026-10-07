'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  Users,
  GraduationCap,
  CreditCard,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  FileCheck,
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  BookOpen,
} from 'lucide-react';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/login/parent');
  };

  const navItems = [
    {
      name: 'Overview',
      href: '/parent',
      icon: LayoutDashboard,
      active: pathname === '/parent',
    },
    {
      name: 'Leave Applications',
      href: '/parent/leave',
      icon: CalendarDays,
      active: pathname.startsWith('/parent/leave'),
    },
    {
      name: 'Curriculum & Syllabus',
      href: '/parent/syllabus',
      icon: BookOpen,
      active: pathname.startsWith('/parent/syllabus'),
    },
    {
      name: 'Analytics & Reports',
      href: '/parent/analytics',
      icon: BarChart3,
      active: pathname.startsWith('/parent/analytics'),
    },
    {
      name: 'Examinations & Fees',
      href: '/parent/examinations',
      icon: FileCheck,
      active: pathname.startsWith('/parent/examinations'),
    },
    {
      name: 'Payment Ledger',
      href: '/parent/payments',
      icon: CreditCard,
      active: pathname.startsWith('/parent/payments'),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['PARENT']}>
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans text-slate-800">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EAE5] shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/parent" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#23804A] to-[#175C34] flex items-center justify-center text-white font-bold font-serif shadow-xs">
                  S
                </div>
                <div>
                  <span className="text-base font-bold font-serif text-[#171D19] tracking-tight block">
                    Markaz Sanaviyya
                  </span>
                  <span className="text-[10px] font-semibold text-[#23804A] tracking-wider uppercase block">
                    Parent Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      item.active
                        ? 'bg-[#23804A]/10 text-[#23804A]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Profile & Logout */}
            <div className="hidden md:flex items-center space-x-3">
              <NotificationBell />
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'Parent Guardian'}</p>
                <p className="text-[10px] text-slate-400">{user?.email || ''}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 hover:border-rose-200 transition-all cursor-pointer"
                title="Sign out of Parent Portal"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Logout
              </button>
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <NotificationBell />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#E3EAE5] bg-white px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold ${
                      item.active
                        ? 'bg-[#23804A]/10 text-[#23804A]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'Parent'}</p>
                  <p className="text-[10px] text-slate-400">{user?.email || ''}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-rose-600 bg-rose-50/50"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
