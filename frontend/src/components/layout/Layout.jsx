import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const routeTitles = {
  '/': 'MISC - Markaz Integrated Studies Council',
  '/about': 'About MISC - Markaz Integrated Studies Council',
  '/academics': 'Academics - Markaz Integrated Studies Council',
  '/institutions': 'Institutions - Markaz Integrated Studies Council',
  '/downloads': 'Downloads & Resources - Markaz Integrated Studies Council',
  '/examination': 'Examination Framework - Markaz Integrated Studies Council',
  '/contact': 'Contact Us - Markaz Integrated Studies Council'
};

export const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    const title = routeTitles[location.pathname] || 'Page Not Found - MISC';
    document.title = title;
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-[#D4AF37]/30 selection:text-[#0B1D3A]">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
