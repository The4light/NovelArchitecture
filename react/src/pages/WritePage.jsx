import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import AnalyticsEngine from '../components/AnalyticsEngine';

/* --- COMPONENT 1: THE LANDING PAGE --- */
const WriteLanding = ({ onJoin }) => (
  <div className="animate-in fade-in duration-700">
    <header className="relative pt-20 pb-32 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-900 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
          The Future of Storytelling
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-8">
          Your story <br /> starts <span className="text-gray-500 italic font-serif">here.</span>
        </h1>
        <p className="max-w-xl mx-auto text-xl text-gray-500 font-medium mb-12">
          Join a global community of creators. Write, publish, and grow your audience with NovelForge.
        </p>
        <button
          onClick={onJoin}
          className="bg-black text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 shadow-xl transition-all active:scale-95"
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
  const [activeTab, setActiveTab] = useState('vault'); 
  
  const [novelToPurge, setNovelToPurge] = useState(null);
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    const fetchNovels = async () => {
      if (!userId) return;
      try {
        setLoadingNovels(true);
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

  const handlePurgeNovel = async () => {
    if (!novelToPurge) return;
    setPurging(true);
    try {
      const { error } = await supabase
        .from('novels')
        .delete()
        .eq('id', novelToPurge.id);

      if (error) throw error;
      setNovels((prev) => prev.filter((n) => n.id !== novelToPurge.id));
      setNovelToPurge(null);
    } catch (err) {
      console.error('Purge failure:', err.message);
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Workspace Header Actions Frame */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Author Studio</h2>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight">System Workspace</h1>
        </div>
        <button
          onClick={() => navigate('/write/create')}
          className="bg-black text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-md flex items-center gap-2 active:scale-95"
        >
          <span>Forge New Story</span>
        </button>
      </div>

      {/* High-Fidelity Tab Bar */}
      <div className="flex items-center gap-6 mb-8 border-b border-gray-200/60 pb-3">
        <button
          onClick={() => setActiveTab('vault')}
          className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${
            activeTab === 'vault' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Manuscript Vault
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${
            activeTab === 'analytics' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Deep Analytics Engine
        </button>
      </div>

      {/* Dynamic View Panel Render Node */}
      {loadingNovels ? (
        <div className="py-20 text-center border border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Accessing Studio Databases...</p>
        </div>
      ) : activeTab === 'analytics' ? (
        <AnalyticsEngine novels={novels} />
      ) : (
        /* Vault Core Record Feed Display */
        <div className="grid gap-4 animate-in fade-in duration-300">
          {novels.length === 0 ? (
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
                className="p-6 bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-gray-200 transition-all flex justify-between items-center group"
              >
                <div className="flex gap-5 items-center">
                  <div className="w-12 h-16 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-300 group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:text-white transition-all shrink-0 shadow-sm">
                    <Icons.Book className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-sm tracking-tight mb-1 group-hover:text-gray-700 transition-colors">
                      {novel.title}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase text-gray-400">{novel.genre}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${novel.status === 'Published' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        {novel.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/write/edit/${novel.id}`)}
                    className="p-3.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-black hover:text-white transition-all active:scale-95"
                  >
                    <Icons.Edit className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => setNovelToPurge(novel)}
                    className="p-3.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Glassmorphic Deletion Modal Node */}
      {novelToPurge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 max-w-md w-full p-8 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.08)] animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Purge Manuscript Universe?</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-xs mx-auto mb-8">
              Are you absolutely certain you want to erase <span className="text-gray-900 font-bold">"{novelToPurge.title}"</span>? This action completely vaporizes all associated chapter nodes and cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handlePurgeNovel}
                disabled={purging}
                className="w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {purging ? "Purging Node..." : "Confirm Destruction"}
              </button>
              <button
                onClick={() => setNovelToPurge(null)}
                disabled={purging}
                className="w-full sm:flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                Cancel Safely
              </button>
            </div>
          </div>
        </div>
      )}

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

  const activeUserId = user?.id || user?.user?.id || null;

  return (
    <div className="min-h-screen bg-gray-50/40 selection:bg-black/10">
      <Navbar />
      <div className="pt-24">
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