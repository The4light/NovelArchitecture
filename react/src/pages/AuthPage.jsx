import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';

const Icons = {
  Book: () => (
    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  ArrowUpRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  )
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Form Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [penName, setPenName] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Redirect if user is already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/write');
    }
  }, [user, navigate]);

  const triggerNotification = (message, type) => {
    setNotification({ show: true, message, type });
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
        setTimeout(() => navigate('/write'), 1000); 
      } else {
        await authService.signup(email, password, penName);
        triggerNotification('Account created successfully! Please check your verification link.', 'success');
        setIsLogin(true); 
        setPenName('');
      }
    } catch (error) {
      triggerNotification(error.message || 'An error occurred during authentication.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // actual Google Gateway Trigger Connection
    const handleGoogleSignIn = async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            // ⚡ REDIRECT CHANGED: Move away from /write directly to prevent premature rendering races
            redirectTo: `${window.location.origin}/auth/callback` 
          }
        });
        if (error) throw error;
      } catch (error) {
        triggerNotification(error.message || 'Google authentication failed.', 'error');
      }
    };

  return (
    <div className="min-h-screen flex bg-gray-50 lg:bg-white font-sans relative overflow-x-hidden selection:bg-purple-500/10">
      
      {/* Notifications HUD */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 max-w-md p-5 rounded-2xl shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-top-4 flex items-start gap-4 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'
        }`}>
          <div className={`p-1.5 rounded-lg shrink-0 ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
            {notification.type === 'success' ? <Icons.Book /> : <Icons.Alert />}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-0.5">
              {notification.type === 'success' ? 'System Notification' : 'Security Alert'}
            </p>
            <p className="text-xs font-bold opacity-85 leading-relaxed">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Aesthetic Glowing Background Layer for Mobile */}
      <div className="absolute inset-0 block lg:hidden pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[40%] bg-purple-400/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[40%] bg-blue-400/10 blur-[100px] rounded-full" />
      </div>

      {/* LEFT CANVAS: Hidden cleanly on mobile to prevent squished layouts */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black group z-10">
        <img 
          src="https://images.unsplash.com/photo-1456615074700-1dc12aa7364d?q=80&w=2000&auto=format&fit=crop" 
          alt="Vintage typewriter" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[20s] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-center p-16 h-full text-white">
          <div className="w-12 h-1 bg-purple-500 mb-8"></div>
          <h2 className="text-4xl lg:text-5xl font-serif italic leading-tight mb-6 text-gray-200">
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </h2>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">
            George R.R. Martin
          </p>
        </div>

        <Link to="/" className="absolute top-12 left-12 flex items-center gap-2 text-white z-10">
          <Icons.Book />
          <span className="text-xl font-black tracking-tighter ml-1">NovelForge</span>
        </Link>
      </div>

      {/* RIGHT CANVAS: Fully Responsive Auth Input Desk */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-12 md:px-20 py-20 relative z-10 min-h-screen">
        
        {/* Mobile Header Navigation Anchor */}
        <div className="absolute top-6 left-6 right-6 flex lg:hidden justify-between items-center w-[calc(100%-3rem)]">
          <Link to="/" className="flex items-center gap-1.5 text-black">
            <Icons.Book />
            <span className="text-lg font-black tracking-tighter">NovelForge</span>
          </Link>
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            Exit Studio &rarr;
          </Link>
        </div>

        {/* Input Wrapper Card: Aesthetic background container on mobile screens */}
        <div className="w-full max-w-md bg-white border border-gray-100 lg:border-none rounded-3xl p-6 sm:p-10 lg:p-0 shadow-[0_8px_30px_rgb(0,0,0,0.02)] lg:shadow-none animate-in fade-in slide-in-from-bottom-6 duration-500">
          
          <div className="mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
              {isLogin ? 'Welcome back.' : 'Begin your story.'}
            </h1>
            <p className="text-gray-400 font-bold text-xs sm:text-sm leading-snug">
              {isLogin ? 'Enter your details to access your library archive.' : 'Join a network of exceptional authors today.'}
            </p>
          </div>

          <div className="flex gap-6 border-b border-gray-100 mb-8 relative">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`pb-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative ${isLogin ? 'text-black' : 'text-gray-400 hover:text-black'}`}
            >
              Sign In
              {isLogin && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>}
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`pb-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative ${!isLogin ? 'text-black' : 'text-gray-400 hover:text-black'}`}
            >
              Create Account
              {!isLogin && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>}
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <div className="group">
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 group-focus-within:text-purple-600 transition-colors">
                  Pen Name / Username
                </label>
                <input 
                  type="text" 
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                  placeholder="e.g. LightedPen"
                  className="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 font-bold text-xs sm:text-sm placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="group">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 group-focus-within:text-purple-600 transition-colors">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@novelforge.com"
                className="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 font-bold text-xs sm:text-sm placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="group relative">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 group-focus-within:text-purple-600 transition-colors">
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 font-bold text-xs sm:text-sm placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors"
                required
              />
              {isLogin && (
                <button type="button" className="absolute right-0 bottom-2.5 text-[9px] font-black text-gray-400 hover:text-black uppercase tracking-widest transition-colors">
                  Forgot?
                </button>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-xl py-4 mt-4 font-black text-xs tracking-[0.2em] uppercase shadow-md hover:bg-purple-600 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : isLogin ? 'Enter Archive' : 'Start Writing'}</span>
              <Icons.ArrowUpRight />
            </button>
          </form>

          {/* Core Gateway Connector Hub */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute w-full h-px bg-gray-100"></div>
              <span className="relative bg-white px-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                Or continue with
              </span>
            </div>
            
            <button 
              type="button" 
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 active:scale-98 transition-all group shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-xs font-black text-gray-900 tracking-wider uppercase">Google Gateway</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;