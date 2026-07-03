import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { authService } from '../services/auth.service';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Form Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [penName, setPenName] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom UI Notification State (Destroys poor alert browser popups)
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const triggerNotification = (message, type) => {
    setNotification({ show: true, message, type });
    // Keep account creation message visible longer so they can read the confirmation context
    const duration = type === 'success' && !isLogin ? 8000 : 4000;
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), duration);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(email, password);
        triggerNotification('Welcome back to the Archive!', 'success');
        setTimeout(() => navigate('/write'), 1000); // Direct seamless routing to write page
      } else {
        await authService.signup(email, password, penName);
        triggerNotification('Account created successfully! Please check your email inbox for your verification link.', 'success');
        setIsLogin(true); // Automatically toggle view over to login layout
        setPenName('');
      }
    } catch (error) {
      triggerNotification(error.message || 'An error occurred during authentication.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans relative">
      
      {/* GLOBAL BANNER NOTIFICATION (Sleek Inline UI Alternative) */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 max-w-md p-5 rounded-2xl shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-top-4 flex items-start gap-4 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
            : 'bg-rose-50 border-rose-100 text-rose-900'
        }`}>
          <div className={`p-1.5 rounded-lg shrink-0 ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
            {notification.type === 'success' ? <Icons.Book className="w-4 h-4" /> : <Icons.TrendingUp className="w-4 h-4 rotate-90" />}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-0.5">
              {notification.type === 'success' ? 'System Notification' : 'Security Alert'}
            </p>
            <p className="text-sm font-medium leading-relaxed opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      {/* LEFT PANEL: The Immersive Aesthetic (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black group">
        <img 
          src="https://images.unsplash.com/photo-1456615074700-1dc12aa7364d?q=80&w=2000&auto=format&fit=crop" 
          alt="Vintage typewriter and scattered pages" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[20s] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-center p-16 h-full text-white">
          <div className="w-12 h-1 bg-purple-500 mb-8"></div>
          <h2 className="text-4xl lg:text-5xl font-serif italic leading-tight mb-6 text-gray-200">
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </h2>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">
            George R.R. Martin
          </p>
        </div>

        <Link to="/" className="absolute top-12 left-12 flex items-center gap-3 text-white z-10">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg shadow-lg">
             <Icons.Edit className="w-4 h-4" />
          </div>
          <span className="text-xl font-black tracking-tighter">NovelForge</span>
        </Link>
      </div>

      {/* RIGHT PANEL: The Minimalist Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 relative">
        
        {/* Mobile Logo (Only shows on small screens) */}
        <Link to="/" className="absolute top-8 left-8 flex lg:hidden items-center gap-3 text-black">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg">
             <Icons.Edit className="w-4 h-4" />
          </div>
          <span className="text-xl font-black tracking-tighter">NovelForge</span>
        </Link>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
              {isLogin ? 'Welcome back.' : 'Begin your story.'}
            </h1>
            <p className="text-gray-500 font-medium text-lg">
              {isLogin 
                ? 'Enter your details to access your library.' 
                : 'Join a world of infinite imagination today.'}
            </p>
          </div>

          {/* Form Toggle Tabs */}
          <div className="flex gap-8 border-b border-gray-200 mb-10 relative">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-colors relative ${isLogin ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Sign In
              {isLogin && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>}
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-colors relative ${!isLogin ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Create Account
              {!isLogin && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>}
            </button>
          </div>

          {/* The Form */}
          <form className="space-y-6" onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-purple-600 transition-colors">
                  Pen Name / Username
                </label>
                <input 
                  type="text" 
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                  placeholder="e.g. LightedPen"
                  className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-gray-900 font-medium placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-purple-600 transition-colors">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@novelforge.com"
                className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-gray-900 font-medium placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="group relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-purple-600 transition-colors">
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-gray-900 font-medium placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors"
                required
              />
              {isLogin && (
                <button type="button" className="absolute right-0 bottom-4 text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest">
                  Forgot?
                </button>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-2xl py-5 mt-8 font-black text-sm tracking-[0.2em] uppercase shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:bg-purple-700 hover:shadow-purple-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-3 group disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Enter Archive' : 'Start Writing'}
              <Icons.TrendingUp className="w-4 h-4 rotate-90 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-12">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-full h-px bg-gray-100"></div>
              <span className="relative bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                Or continue with
              </span>
            </div>
            
            <div className="flex gap-4">
              <button type="button" className="flex-1 flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-xs font-black text-gray-900 tracking-wider">Google</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;