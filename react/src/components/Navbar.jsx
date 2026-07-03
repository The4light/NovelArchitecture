import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Icons = {
  Book: () => (
    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
};

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Write', path: '/write' },
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Glassmorphic Floating Container */}
      <header className="bg-white/75 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] rounded-2xl transition-all duration-300">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <Icons.Book />
              <span className="text-lg font-black tracking-tight text-gray-950 font-sans">NovelForge</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${
                    isActive(link.path) ? 'text-black' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Action Deck */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Exposed Core Tools: Visible on both desktop and mobile for instant reach */}
              <button className="p-2 hover:bg-gray-900/5 rounded-xl text-gray-500 hover:text-black transition-colors">
                <Icons.Search />
              </button>
              
              <button className="p-2 hover:bg-gray-900/5 rounded-xl text-gray-500 hover:text-black transition-colors">
                <Icons.Tag />
              </button>
              
              <Link 
                to="/profile" 
                className="p-2 hover:bg-gray-900/5 rounded-xl text-gray-500 hover:text-black transition-colors flex items-center justify-center"
              >
                <Icons.User />
              </Link>
              
              {/* Desktop Auth Switch */}
              <div className="hidden md:block">
                {user ? (
                  <button 
                    onClick={handleLogout}
                    className="ml-1 border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 hover:text-black transition-all active:scale-95"
                  >
                    Logout
                  </button>
                ) : (
                  <Link 
                    to="/auth"
                    className="ml-1 bg-black text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-md active:scale-95"
                  >
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-gray-500 hover:text-black transition-colors ml-0.5"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Icons.Menu />
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Panel Container */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100/60 animate-in fade-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col gap-3.5 pb-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                      isActive(link.path) ? 'text-black bg-gray-50' : 'text-gray-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="h-px bg-gray-100/80 my-1 mx-2"></div>
                
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="text-left text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 px-2"
                  >
                    Logout Session
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-black uppercase tracking-widest text-purple-600 px-2"
                  >
                    Login / Register
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Navbar;