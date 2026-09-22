'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  UserCheck,
  FileText,
  Calendar,
  CreditCard,
  FileCheck,
  Award,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  Search,
  Bell,
  Clock as ClockIcon,
} from 'lucide-react';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export const AdminLayoutClient: React.FC<AdminLayoutClientProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time Dynamic Clock Update
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
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'USER MANAGEMENT',
      items: [
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Institutions', path: '/admin/institutions', icon: Building2 },
        { label: 'Students', path: '/admin/students', icon: GraduationCap },
        { label: 'Faculty', path: '/admin/faculty', icon: UserCheck },
      ],
    },
    {
      title: 'ACADEMIC MANAGEMENT',
      items: [
        { label: 'Academic Years', path: '/admin/academic', icon: BookOpen },
      ],
    },
    {
      title: 'EXAMINATION',
      items: [
        { label: 'Exams', path: '/admin/exams', icon: FileCheck },
        { label: 'Results', path: '/admin/results', icon: Award },
      ],
    },
    {
      title: 'EVENTS & PAYMENTS',
      items: [
        { label: 'Events', path: '/admin/events', icon: Calendar },
        { label: 'Payments', path: '/admin/payments', icon: CreditCard },
      ],
    },
    {
      title: 'CMS & RESOURCES',
      items: [
        { label: 'CMS Articles', path: '/admin/cms', icon: FileText },
      ],
    },
  ];

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-[#F7F8F5] flex flex-col md:flex-row text-slate-800 antialiased font-sans max-w-full overflow-x-hidden">
        {/* Mobile Drawer Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-[#E2E8E0] text-slate-700 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out shadow-xs ${
            sidebarCollapsed ? 'w-20' : 'w-56 lg:w-60'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          {/* Sidebar Header: Logo & Branding */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-[#E2E8E0] bg-white flex-shrink-0">
            <div className="flex items-center space-x-3 overflow-hidden min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#2F7C7A] text-white flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0">
                M
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className="font-bold text-sm text-[#132238] leading-tight truncate">
                    MISC Admin
                  </h1>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-tight truncate">
                    Markaz Integrated Studies
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Nav Items */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {navCategories.map((category, catIdx) => (
              <div key={catIdx} className="space-y-1">
                {category.title && !sidebarCollapsed && (
                  <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                    {category.title}
                  </p>
                )}
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.path
                    : pathname === item.path || pathname.startsWith(item.path + '/');

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#2F7C7A] text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-[#132238]'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer User Info */}
          <div className="p-3.5 border-t border-[#E2E8E0] bg-[#F7F8F5] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#2F7C7A]/15 text-[#2F7C7A] flex items-center justify-center font-bold text-xs flex-shrink-0 border border-[#2F7C7A]/20">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#132238] truncate">{user?.name || user?.username || 'Super Admin'}</p>
                    <p className="text-[10px] text-slate-500 font-semibold truncate">{user?.role || 'Administrator'}</p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all flex-shrink-0 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full">
          {/* Top Navbar */}
          <header className="h-20 bg-white border-b border-[#E2E8E0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs w-full min-w-0">
            {/* Left: Menu Toggle & Search Bar */}
            <div className="flex items-center space-x-3 flex-1 max-w-md min-w-0">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setSidebarOpen(true);
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed);
                  }
                }}
                className="text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-all flex-shrink-0 cursor-pointer"
                title="Toggle Navigation Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Global Search Bar */}
              <div className="relative w-full hidden sm:block min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search Application ID, Name, Phone..."
                  className="w-full pl-9 pr-16 py-2 rounded-xl border border-[#E2E8E0] bg-[#F7F8F5] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:bg-white transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
                    Ctrl + K
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Real-time Date/Clock, Notifications & User Dropdown */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Live Clock & Date Badge */}
              <div className="hidden lg:flex items-center space-x-2 bg-[#F7F8F5] px-3.5 py-1.5 rounded-xl border border-[#E2E8E0] text-xs font-semibold text-slate-700" suppressHydrationWarning>
                <ClockIcon className="w-3.5 h-3.5 text-[#2F7C7A]" />
                <span>{formattedDate}</span>
                <span className="text-slate-300">|</span>
                <span className="font-mono font-bold text-[#132238]">{formattedTime}</span>
              </div>

              {/* Notification Bell */}
              <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
                  47
                </span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 transition-all focus:outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2F7C7A] text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-[#132238] block leading-tight">
                      {user?.name || user?.username || 'Super Admin'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold block leading-tight">
                      {user?.role || 'Administrator'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E2E8E0] py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-[#132238]">{user?.name || user?.username}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto w-full max-w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayoutClient;
