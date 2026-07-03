import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

/* --- COMPONENT 1: THE LANDING PAGE (Unchanged) --- */
const WriteLanding = ({ onJoin }) => (
  <div className="animate-in fade-in duration-700">
    <header className="relative pt-20 pb-32 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
          The Future of Storytelling
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-8">
          Your story <br /> starts <span className="text-purple-600 italic font-serif">here.</span>
        </h1>
        <p className="max-w-xl mx-auto text-xl text-gray-500 font-medium mb-12">
          Join a global community of creators. Write, publish, and grow your audience with NovelForge.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onJoin}
            className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-purple-700 transition-all shadow-2xl active:scale-95"
          >
            Start Writing for Free
          </button>
          <button className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-gray-50 transition-all">
            Browse Guide
          </button>
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-50/50 rounded-full blur-3xl -z-0"></div>
    </header>

    <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { title: "Ownership", desc: "You keep 100% of the rights to your work.", icon: <Icons.Book /> },
          { title: "Analytics", desc: "Track your readers in real-time.", icon: <Icons.TrendingUp /> },
          { title: "Community", desc: "Direct feedback from a passionate audience.", icon: <Icons.User /> }
        ].map((feature, i) => (
          <div key={i} className="space-y-4 text-center md:text-left">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black mx-auto md:mx-0">
              {feature.icon}
            </div>
            <h3 className="text-xl font-black tracking-tight">{feature.title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

/* --- COMPONENT 2: THE STUDIO DASHBOARD (Live Engine Mode) --- */
const WriterStudio = ({ user }) => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Fallback string calculation
  const displayName = user?.user_metadata?.pen_name || user?.email?.split('@')[0] || 'Writer';

  useEffect(() => {
    const fetchMyNovels = async () => {
      try {
        // Query database filtering by active author authentication key
        const { data, error } = await supabase
          .from('novels')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNovels(data || []);
      } catch (err) {
        console.error("Error loading studio items:", err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchMyNovels();
  }, [user.id]);

  return (
    <div className="animate-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Writer Studio</h1>
          <p className="text-gray-500 font-medium">Welcome back, <span className="text-purple-600 font-bold">{displayName}</span>.</p>
        </div>
        <Link 
          to="/write/create"
          className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-purple-600 transition-all shadow-xl active:scale-95"
        >
          <Icons.Edit className="w-4 h-4" />
          Create New Story
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Manuscripts</p>
          <p className="text-3xl font-black text-gray-900">{fetching ? '...' : novels.length}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Active Manuscripts</h3>
        
        {fetching ? (
          <p className="text-xs font-black uppercase tracking-widest text-gray-300 animate-pulse py-4">Querying database rows...</p>
        ) : novels.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-gray-100 rounded-3xl text-center max-w-md mx-auto">
            <p className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Manuscripts Found</p>
            <p className="text-gray-400 font-medium text-xs mb-6">Initialize your configuration record profile to begin writing.</p>
            <Link to="/write/create" className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-purple-600 transition-all">
              Forge Initial Script
            </Link>
          </div>
        ) : (
          novels.map((novel) => (
            <div key={novel.id} className="group flex items-center justify-between p-6 rounded-3xl border border-gray-100 hover:border-black transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100">
                   <Icons.Book className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 group-hover:text-purple-600 transition-colors">{novel.title}</h4>
                  <div className="flex gap-4 mt-1 items-center">
                    <span className="text-[10px] font-bold uppercase text-gray-400">{novel.genre}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${novel.status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {novel.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate(`/write/edit/${novel.id}`)}
                className="p-4 rounded-xl bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all active:scale-95"
              >
                <Icons.Edit className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* --- MAIN PAGE LOGIC --- */
const WritePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext); 

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {user ? (
        <WriterStudio user={user} />
      ) : (
        <WriteLanding onJoin={() => navigate('/auth')} />
      )}
    </div>
  );
};

export default WritePage;