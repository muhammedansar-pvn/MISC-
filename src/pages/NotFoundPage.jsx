import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="py-24 misc-container text-center">
      <h1 className="font-serif text-6xl font-bold text-[#0B1D3A]">404</h1>
      <p className="mt-4 text-xl font-medium text-slate-700">Page Not Found</p>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
        The requested page does not exist or has been moved within the MISC portal structure.
      </p>
      <div className="mt-8">
        <Link to="/">
          <Button variant="primary">Return to Homepage</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
