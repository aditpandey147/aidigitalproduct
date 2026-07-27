import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import logo from '../../assets/nav-logo.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/password/verify/${token}`);
        setValid(true);
      } catch {
        setValid(false);
      } finally {
        setChecking(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/password/reset', { token, password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Verifying link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Animated Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delay"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
          
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-particle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Floating Shapes */}
          <div className="absolute top-20 right-20 animate-float">
            <div className="w-16 h-16 border-4 border-white/20 rounded-2xl rotate-12 backdrop-blur-sm"></div>
          </div>
          <div className="absolute bottom-32 left-20 animate-float-delay">
            <div className="w-12 h-12 border-4 border-white/10 rounded-full backdrop-blur-sm"></div>
          </div>
          <div className="absolute top-1/2 right-10 animate-float-medium">
            <div className="w-8 h-8 border-4 border-white/10 rounded-lg rotate-45 backdrop-blur-sm"></div>
          </div>

          {/* Static Lock Icon */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
            <svg className="w-96 h-96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5">
                <img src={logo} alt="complyzo logo" className="w-42 h-8 brightness-0 invert" />
              </Link>
            </div>
          </div>

          <div className="mt-16 max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-4 animate-slide-up">
              Create New
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Password
              </span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed animate-slide-up-delay">
              Enter your new password below to secure your account.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: '🔒', text: 'Min 6 characters' },
                { icon: '🛡️', text: 'Use a strong password' },
                { icon: '✓', text: 'Your account will be secured' },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] cursor-default animate-feature-slide`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-white/80 text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/40 text-sm flex items-center gap-6">
          <p>© 2024 ComplyZo. All rights reserved.</p>
          <span className="w-1 h-1 bg-white/20 rounded-full"></span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            <span className="text-white/30">All systems operational</span>
          </span>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src={logo} alt="complyzo logo" className="w-42 h-8" />
            </Link>
          </div>

          {valid ? (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900">
                  Set New Password
                </h2>
                <p className="text-gray-500 mt-1">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="•••••••• (min 6 chars)"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:underline font-medium flex items-center justify-center gap-1"
                >
                  <i className="fas fa-arrow-left text-xs"></i>
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-red-100">
                <i className="fa-solid fa-xmark text-red-500 text-3xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Invalid Link</h2>
              <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                This password reset link has expired or is invalid.
              </p>
              <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 flex items-center justify-center gap-2">
                  <i className="fa-solid fa-clock text-amber-500"></i>
                  Reset links expire after 1 hour
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="mt-6 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                Request New Link
              </Link>
            </div>
          )}

          {/* Trust Badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> SSL Secured
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> 24/7 Support
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> Free Trial
            </span>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-40px, 20px) rotate(10deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -40px) scale(1.2); }
        }
        @keyframes particle {
          0% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          50% { transform: translate(50px, -50px) scale(2); opacity: 0.6; }
          100% { transform: translate(100px, -100px) scale(1); opacity: 0.2; }
        }
        @keyframes ping {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes feature-slide {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 10s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-particle { animation: particle 15s linear infinite; }
        .animate-ping { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-slide-up-delay { animation: slide-up-delay 0.8s ease-out 0.3s both; }
        .animate-feature-slide { animation: feature-slide 0.6s ease-out both; }
      `}</style>
    </div>
  );
};

export default ResetPassword;