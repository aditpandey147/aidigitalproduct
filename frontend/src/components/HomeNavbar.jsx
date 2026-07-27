import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/nav-logo.png'
const HomeNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    // Close mobile menu on window resize if screen becomes large
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: 'fas fa-home' },
    { name: 'Features', href: '/features', icon: 'fas fa-star' },
    { name: 'Pricing', href: '/pricing', icon: 'fas fa-tag' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 py-4 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-4' : 'bg-white/80 backdrop-blur-sm py-3'
      }`}>
        <div className="w-full max-w-[1290px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo - Responsive */}
            <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
              <img className='w-28 sm:w-40' src={logo} alt="complyzo" />
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 hover:text-primary transition-colors duration-300 flex items-center space-x-2 group"
                >
                  <i className={`${link.icon} text-sm group-hover:scale-110 transition-transform`}></i>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>

            {/* Auth Buttons - Responsive */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/dashboard"
                    className="px-3 lg:px-5 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 text-sm lg:text-base"
                  >
                    <i className="fas fa-chart-line"></i>
                    <span className="hidden lg:inline">Dashboard</span>
                    <span className="lg:hidden">Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 lg:px-5 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center space-x-2 text-sm lg:text-base"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-3 lg:px-5 py-2 text-primary hover:bg-blue-50 rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm lg:text-base"
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 lg:px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2 text-sm lg:text-base whitespace-nowrap"
                  >
                    <i className="fas fa-user-plus"></i>
                    <span className="hidden sm:inline">Sign Up</span>
                    <span className="sm:hidden">Sign Up</span>
                    <i className="fas fa-arrow-right ml-1 hidden sm:inline"></i>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Visible only on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors z-50"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Full screen on mobile */}
      <div className={`fixed inset-0 bg-black/50 z-40 transition-all duration-300 md:hidden ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      {/* Mobile Menu - Full screen on small devices */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl z-50 transition-transform duration-300 transform md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
              <img className='w-28' src={logo} alt="complyzo" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-primary rounded-lg transition-colors"
                >
                  <i className={`${link.icon} w-5 text-primary`}></i>
                  <span className="font-medium">{link.name}</span>
                </a>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 px-3">
              {user ? (
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                    <p className="text-sm text-gray-500">Logged in as</p>
                    <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-primary text-white rounded-lg text-center font-medium"
                  >
                    <i className="fas fa-chart-line"></i>
                    <span>Go to Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-red-500 text-red-500 rounded-lg text-center font-medium hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-primary border border-primary rounded-lg text-center font-medium"
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-center font-medium"
                  >
                    <i className="fas fa-user-plus"></i>
                    <span>Sign Up Free</span>
                    <i className="fas fa-arrow-right ml-1"></i>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeNavbar;