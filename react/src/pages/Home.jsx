import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { genreColors } from '../data/novel';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';

// ==========================================
// 1. IMMERSIVE HIGH-FIDELITY NOVEL CARD
// ==========================================
const NovelCard = ({ novel }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/read/${novel.id}`)}
      className="group cursor-pointer flex flex-col space-y-4"
    >
      {/* 3D-Leaning Fluid Aspect Wrapper */}
      <div className="relative overflow-hidden rounded-[20px] bg-gray-950 aspect-[2/3] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(109,40,217,0.15)] transition-all duration-500 border border-gray-100 group-hover:border-purple-500/30">
        <img
          src={novel.thumbnail_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000"}
          alt={novel.title}
          className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        
        {/* Floating Glossy Stats Panel */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-xl border border-white/10">
          <Icons.Eye className="w-3 h-3 text-purple-400" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Narrative Metadata Framing */}
      <div className="space-y-1.5 px-1">
        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border ${genreColors[novel.genre] || 'bg-purple-50 text-purple-700 border-purple-200'}`}>
          {novel.genre}
        </span>
        
        <h3 className="font-black text-gray-900 text-base group-hover:text-purple-700 transition-colors line-clamp-1 tracking-tight">
          {novel.title}
        </h3>
        
        <p className="text-xs text-gray-400 font-medium">by {novel.author_name || 'Anonymous Author'}</p>
        
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium pt-1">
          {novel.synopsis || novel.description || "No public canvas overview overview committed."}
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 2. CINEMATIC AMBIENT FEATURED HERO
// ==========================================
const FeaturedSection = ({ novel }) => {
  if (!novel) return null;
  const coverImg = novel.thumbnail_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000";

  return (
    <div className="relative min-h-[85vh] flex items-center bg-gray-950 overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-900">
      
      {/* Dynamic Mesh Backdrop Blur */}
      <div className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-40 transition-opacity duration-1000">
        <div 
          className="absolute -right-10 -top-20 w-[600px] h-[600px] bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-[140px] mix-blend-screen animate-pulse"
          style={{ animationDuration: '8s' }}
        ></div>
        <div className="absolute left-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-blue-900 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* Typographic Deck Block */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-8 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-2xl">
            <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.25em]">Premium Spotlight</span>
            <span className="text-white/20">|</span>
            <span className="text-gray-300 text-[10px] font-bold tracking-wider uppercase">{novel.genre}</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[0.95]">
            {novel.title}
          </h1>
          
          <p className="text-gray-400 text-lg sm:text-xl font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed font-serif italic">
            "{novel.synopsis || novel.description || 'No public canvas summary committed by the designer.'}"
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
            <Link to={`/read/${novel.id}`}>
              <button className="bg-white text-black px-10 py-5 rounded-2xl font-black text-sm tracking-[0.15em] uppercase hover:bg-purple-600 hover:text-white transition-all duration-300 flex items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.05)] hover:shadow-[0_20px_40px_rgba(147,51,234,0.3)] active:scale-95">
                <Icons.Book className="w-4 h-4" />
                Start Reading
              </button>
            </Link>
          </div>
        </div>

        {/* 3D Floating Book Canvas Wrapper */}
        <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
          <Link to={`/read/${novel.id}`} className="relative group block">
            <div className="absolute -inset-4 bg-purple-500/20 rounded-[30px] blur-3xl group-hover:bg-purple-500/40 transition-all duration-700"></div>
            <div className="relative w-64 sm:w-80 lg:w-[380px] aspect-[2/3] rounded-[24px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border border-white/10 transform lg:rotate-[3deg] lg:hover:rotate-0 lg:hover:-translate-y-4 transition-all duration-500 ease-out">
              <img
                src={coverImg}
                alt={novel.title}
                className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN DASHBOARD PAGE LAYOUT
// ==========================================
const HomePage = () => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveDirectory = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('novels')
          .select('*')
          .eq('status', 'Published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNovels(data || []);
      } catch (err) {
        console.error("Catalog streams synchronization error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveDirectory();
  }, []);

  // Isolate custom collections metrics
  const featuredNovel = novels[0]; 
  const trendingNovels = novels.slice(0, 4);
  const recentNovels = novels.slice(4, 12);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-xs font-black tracking-[0.4em] text-purple-400">
        STREAMING DIGITAL ARCHIVE BUFFER...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-purple-600 selection:text-white antialiased">
      <Navbar />
      
      {/* 1. Cinematic Hero Frame */}
      <FeaturedSection novel={featuredNovel} />
      
      {/* 2. Trending Grid Module */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-purple-600 tracking-[0.3em]">Hot Repositories</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter sm:text-5xl">Trending Right Now</h2>
          </div>
          <Link to="/explore" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors shrink-0">
            View Full Catalog →
          </Link>
        </div>
        
        {trendingNovels.length === 0 ? (
          <div className="text-center font-medium py-12 text-gray-400 border border-dashed rounded-3xl">No live files loaded.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {trendingNovels.map(novel => <NovelCard key={novel.id} novel={novel} />)}
          </div>
        )}
      </div>

      {/* 3. Fluid Secondary Feed Context Section */}
      <div className="bg-gray-50/60 border-y border-gray-100 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-16">
            <span className="text-[10px] font-black uppercase text-purple-600 tracking-[0.3em]">Fresh Off The Press</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter sm:text-5xl">Recently Transmitted</h2>
          </div>
          
          {recentNovels.length === 0 ? (
            <p className="text-sm font-medium text-gray-400 italic">The secondary buffer timeline is currently empty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {recentNovels.map(novel => <NovelCard key={novel.id} novel={novel} />)}
            </div>
          )}
        </div>
      </div>

      {/* 4. HIGH-FIDELITY CALL TO ACTION WORKSPACE FRAME */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32">
        <div className="bg-gray-950 rounded-[40px] p-12 lg:p-24 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/5">
          {/* Ambient backing element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <div className="w-16 h-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-purple-400 shadow-xl">
              <Icons.Edit className="w-6 h-6" />
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-none">Your Masterpiece Awaits</h2>
            <p className="text-gray-400 text-lg sm:text-xl font-medium max-w-xl mx-auto leading-relaxed">
              Don't leave your universes locked inside your thoughts. Forge your drafts, deploy your text updates live, and command your audience.
            </p>
            <div className="pt-4">
              <Link to="/write">
                <button className="bg-white text-black px-12 py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-2xl active:scale-95">
                  Launch Studio Engine
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;