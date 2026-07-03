import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

/* --- COMPONENT 1: THE LANDING PAGE --- */
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
        <button
          onClick={onJoin}
          className="bg-black text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-purple-600 shadow-xl transition-all active:scale-95"
        >
          Create Your Studio Account
        </button>
      </div>
    </header>
  </div>
);

/* --- COMPONENT 2: THE AUTHOR WORKSPACE DASHBOARD --- */
const WriteDashboard = ({ navigate, userId }) => {
  const [novels, setNovels] = useState([]);
  const [loadingNovels, setLoadingNovels] = useState(true);

  useEffect(() => {
    const fetchNovels = async () => {
      if (!userId) return;
      
      try {
        setLoadingNovels(true);
        // ⚡ SAFE SYSTEM SYNC: Fetch manuscripts matching the exact authenticated author context
        const { data, error } = await supabase
          .from('novels')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNovels(data || []);
      } catch (err) {
        console.error('Error fetching studio archive:', err.message);
      } finally {
        setLoadingNovels(false);
      }
    };

    fetchNovels();
  }, [userId]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-1">Author Studio</h2>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight">Your Manuscript Vault</h1>
        </div>
        <button
          onClick={() => navigate('/write/create')}
          className="bg-black text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-md flex items-center gap-2 active:scale-95"
        >
          <span>Forge New Story</span>
        </button>
      </div>

      <div className="grid gap-4">
        {loadingNovels ? (
          <div className="py-20 text-center border border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Opening Archive Files...</p>
          </div>
        ) : novels.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl bg-white p-8">
            <h3 className="text-sm font-black uppercase text-gray-900 tracking-wider mb-2">The Archive is Empty</h3>
            <p className="text-gray-400 text-xs font-medium max-w-xs mx-auto mb-6">You haven't forged any system manuscripts yet. Start your universe node today.</p>
            <button
              onClick={() => navigate('/write/create')}
              className="border border-gray-200 hover:border-black text-gray-700 hover:text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
            >
              Initialize First Draft
            </button>
          </div>
        ) : (
          novels.map((novel) => (
            <div
              key={novel.id}
              className="p-6 bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-gray-300 transition-all flex justify-between items-center group"
            >
              <div className="flex gap-5 items-center">
                <div className="w-12 h-16 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-300 group-hover:bg-purple-50 group-hover:border-purple-100 group-hover:text-purple-600 transition-colors shrink-0 shadow-sm">
                  <Icons.Book className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-sm tracking-tight mb-1 group-hover:text-purple-600 transition-colors">
                    {novel.title}
                  </h4>
                  <div className="flex items-center gap-3">
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 animate-pulse">
          Syncing Forge Gateways...
        </p>
      </div>
    );
  }

  // Safe deduction of the authenticated user ID string
  const activeUserId = user?.id || user?.user?.id || null;

  return (
    <div className="min-h-screen bg-gray-50/40 selection:bg-purple-500/10">
      <Navbar />
      <div className="pt-24">
        {/* Pass down the verified activeUserId to guarantee clean data fetching */}
        {activeUserId ? (
          <WriteDashboard navigate={navigate} userId={activeUserId} />
        ) : (
          <WriteLanding onJoin={() => navigate('/auth')} />
        )}
      </div>
    </div>
  );
};

export default WritePage;