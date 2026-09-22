import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OtpVerificationModal from '../components/auth/OtpVerificationModal';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [step2FA, setStep2FA] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please enter both username/email and password');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(formData.username, formData.password);
    setLoading(false);

    if (result.requires2FA) {
      setVerificationId(result.verificationId);
      setMaskedEmail(result.email);
      setStep2FA(true);
    } else if (result.success) {
      navigate(from || result.redirectTo, { replace: true });
    } else if (result.requiresEmailVerification) {
      navigate('/verify-email', { state: { email: result.email || formData.username } });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8E0] shadow-xs">
        {step2FA ? (
          <OtpVerificationModal
            verificationId={verificationId}
            email={maskedEmail}
            onCancel={() => {
              setStep2FA(false);
              setVerificationId('');
              setMaskedEmail('');
            }}
          />
        ) : (
          <>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2F7C7A]/10 text-[#2F7C7A] mb-2">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#132238] tracking-tight">
                MISC Portal Sign In
              </h2>
              <p className="text-sm text-[#475569]">
                Markaz Integrated Studies Council Authentication Portal
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg">
                <p className="font-semibold">Authentication Error</p>
                <p>{error}</p>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-[#132238] mb-2">
                    Username / Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username or email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#132238]">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#2F7C7A] hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E2E8E0] bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#132238] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2F7C7A] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#256361] focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] focus:ring-offset-2 transition-all disabled:opacity-50 text-xs tracking-wider uppercase shadow-xs cursor-pointer"
                >
                  {loading ? 'VERIFYING CREDENTIALS...' : 'SIGN IN TO PORTAL'}
                </button>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-[#E2E8E0]">
              <p className="text-sm text-[#64748B]">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-[#2F7C7A] hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
