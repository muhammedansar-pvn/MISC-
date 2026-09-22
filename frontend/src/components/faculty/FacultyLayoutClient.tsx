'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Clock,
  ShieldCheck,
  CheckSquare,
  Layers,
  Building2,
} from 'lucide-react';

interface FacultyLayoutClientProps {
  children: React.ReactNode;
}

export const FacultyLayoutClient: React.FC<FacultyLayoutClientProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time Dynamic Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navCategories = [
    {
      title: null,
      items: [
        { label: 'Dashboard', path: '/faculty', icon: LayoutDashboard, exact: true },
        { label: 'My Profile', path: '/faculty/profile', icon: User, exact: true },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { label: 'Academic Overview', path: '/faculty/academics', icon: GraduationCap, exact: true },
        { label: 'Assigned Classes', path: '/faculty/classes', icon: Building2, exact: true },
        { label: 'Curriculum Subjects', path: '/faculty/subjects', icon: Layers, exact: true },
        { label: 'Syllabus Explorer', path: '/faculty/syllabus', icon: BookOpen, exact: true },
        { label: 'Academic Resources', path: '/faculty/resources', icon: FileText, exact: true },
      ],
    },
    {
      title: 'EXAMINATIONS & EVALUATION',
      items: [
        { label: 'Exam Schedules', path: '/faculty/examinations', icon: Calendar, exact: true },
        { label: 'Mark Entry & Evaluation', path: '/faculty/marks', icon: CheckSquare, exact: true },
      ],
    },
  ];

  const isLinkActive = (path: string, exact?: boolean) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <ProtectedRoute allowedRoles={['FACULTY']}>
      <div className="min-h-screen bg-[#F7F8F5] text-slate-900 flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#132238] border-r border-[#1e3454] transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#1e3454]">
            <Link
              href="/faculty"
              className="flex items-center space-x-3 overflow-hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2F7C7A] to-[#3ca09d] flex items-center justify-center shrink-0 shadow-sm shadow-[#2F7C7A]/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-lg text-white tracking-wider leading-tight">
                    MISC
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#8ebdbb] tracking-wider">
                    Faculty Portal
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
            {navCategories.map((group, idx) => (
              <div key={idx} className="space-y-1">
                {group.title && !sidebarCollapsed && (
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {group.title}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.path, item.exact);

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-[#2F7C7A] text-white shadow-sm shadow-[#2F7C7A]/20 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Faculty Portal Status Footer */}
          <div className="p-3 border-t border-[#1e3454]">
            {!sidebarCollapsed ? (
              <div className="bg-[#0f1b2c] p-3 rounded-lg border border-[#1e3454]/60 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-teal-950/80 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">Authorized Faculty</p>
                  <p className="text-[10px] text-teal-400 truncate">Evaluator Access Active</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-teal-950/80 border border-teal-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Top Bar Header */}
          <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-[#E2E8E0] px-4 sm:px-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle sidebar width"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-[#2F7C7A]" />
                <span className="font-mono" suppressHydrationWarning>
                  {currentTime.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Right User Bar */}
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-slate-100 transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[#E6F2F1] text-[#2F7C7A] font-bold text-sm flex items-center justify-center border border-[#2F7C7A]/20">
                    {user?.name ? user.name[0].toUpperCase() : 'F'}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-[#132238] leading-tight">
                      {user?.name || user?.username || 'Faculty Member'}
                    </span>
                    <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">
                      {user?.role || 'FACULTY'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user?.name || user?.username}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/faculty/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-2 text-slate-400" /> Faculty Profile
                      </Link>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default FacultyLayoutClient;
