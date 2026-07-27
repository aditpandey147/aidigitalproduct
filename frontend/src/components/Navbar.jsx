import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileOpen && !e.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-gray-900">
              {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="hidden sm:inline-block text-xs text-gray-400">{currentTime}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative profile-dropdown">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <i className={`fa-solid fa-chevron-down text-gray-400 text-[10px] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5 ${
                      user?.planName && user?.planName !== 'Free' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user?.planName || 'Free'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <i className="fa-solid fa-gear text-gray-400 text-xs w-4"></i>
                      Settings
                    </button>
                    
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => { navigate('/admin/dashboard'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <i className="fa-solid fa-shield text-red-400 text-xs w-4"></i>
                        Admin Panel
                      </button>
                    )}
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket text-xs w-4"></i>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;