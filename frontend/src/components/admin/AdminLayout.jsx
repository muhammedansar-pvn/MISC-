import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Shield,
  User,
  ChevronDown,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true, enabled: true },
    { label: 'Users', path: '/admin/users', icon: Users, enabled: true },
    { label: 'Institutions', path: '/admin/institutions', icon: Building2, enabled: false },
    { label: 'Academic', path: '/admin/academic', icon: BookOpen, enabled: false },
    { label: 'Students', path: '/admin/students', icon: GraduationCap, enabled: false },
    { label: 'Faculty', path: '/admin/faculty', icon: UserCheck, enabled: false },
    { label: 'CMS', path: '/admin/cms', icon: FileText, enabled: false },
    { label: 'Events', path: '/admin/events', icon: Calendar, enabled: false },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard, enabled: false },
    { label: 'Exams', path: '/admin/exams', icon: FileCheck, enabled: false },
    { label: 'Results', path: '/admin/results', icon: Award, enabled: false },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#132238] text-white flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#2F7C7A] flex items-center justify-center font-bold text-white">
              M
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white leading-none block">MISC Admin</span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase block">Portal Management</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.enabled) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#2F7C7A] text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            }

            return (
              <div
                key={item.path}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed opacity-60"
                title={`${item.label} module is coming soon`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0 text-slate-600" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                  Soon
                </span>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-purple-900/50 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || user?.username || 'Admin User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@misc.markaz.in'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E2E8E0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-[#132238] hidden sm:block">
              Markaz Integrated Studies Council
            </h2>
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-slate-100 transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#2F7C7A] text-white flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-[#132238] block leading-tight">
                  {user?.name || user?.username}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold block leading-tight">
                  {user?.role}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E2E8E0] py-1.5 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-[#132238]">{user?.name || user?.username}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
