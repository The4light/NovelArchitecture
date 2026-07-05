import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { genreColors } from '../data/novel';
import { supabase } from '../lib/supabaseClient';

const ReadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Core Data States
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch target novel and its published chapters
  useEffect(() => {
    const fetchFullNarrativeData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch novel metadata details
        const { data: novelData, error: novelErr } = await supabase
          .from('novels')
          .select('*')
          .eq('id', id)
          .single();

        if (novelErr) throw novelErr;
        setNovel(novelData);

        // 2. Fetch all public chapters belonging to this novel
        const { data: chapterData, error: chapErr } = await supabase
          .from('chapters')
          .select('*')
          .eq('novel_id', id)
          .eq('status', 'Published')
          .order('chapter_order', { ascending: true });

        if (chapErr) throw chapErr;
        setChapters(chapterData || []);
      } catch (err) {
        console.error("Error loading narrative matrix:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFullNarrativeData();
  }, [id]);

  // Scroll reset safely toggled on viewport view switches
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, isReading, currentChapterIndex]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-xs font-black tracking-widest text-gray-400">CONNECTING TO CATALOG MATRIX...</div>;
  }

  if (!novel) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Manuscript dataset not found.</div>;
  }

  const activeChapter = chapters[currentChapterIndex];

  return (
    <div className="min-h-screen bg-white">

      {!isReading && <Navbar />}

      {!isReading ? (
        /* --- ELEGANT BOOK LANDING STATE --- */
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
          <header className="relative pt-16 pb-12 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
              
              {/* Massive Elegant Cover */}
              <div className="w-full md:w-[400px] shrink-0">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20">
                    <img 
                      src={novel.thumbnail_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000"} 
                      alt={novel.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  </div>
                </div>
              </div>

              {/* Sophisticated Meta Data */}
              <div className="flex-1 text-center md:text-left">
                <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black tracking-[0.3em] uppercase mb-8 border-2 ${genreColors[novel.genre] || 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                  {novel.genre}
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
                  {novel.title}
                </h1>
                
                <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-100 p-0.5">
                    <img src="https://i.pravatar.cc/100?u=sarah" className="w-full h-full rounded-full object-cover" alt="" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Written By</p>
                    <Link to="/profile" className="text-sm font-black text-gray-900 hover:text-purple-600 transition-colors uppercase">
                      {novel.author_name || 'Author'}
                    </Link>
                  </div>
                </div>

                <p className="text-xl text-gray-500 leading-relaxed max-w-xl mb-10 font-medium italic">
                  "{novel.synopsis || novel.description || 'No public profile description committed by author.'}"
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><Icons.Book className="w-4 h-4"/> {chapters.length} Chapters</span>
                </div>
              </div>
            </div>
          </header>

          {/* PREVIEW SECTION (The Teaser) */}
          <section className="max-w-3xl mx-auto px-4 py-20 relative">
            <div className="text-center mb-16">
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-purple-500 mb-4">Table of Contents</h3>
              <div className="w-12 h-1 bg-black mx-auto rounded-full"></div>
            </div>

            {chapters.length === 0 ? (
              <div className="text-center text-sm font-medium text-gray-400 italic py-4">
                This author hasn't launched any chapters live yet.
              </div>
            ) : (
              <div className="space-y-3 max-w-xl mx-auto mb-16">
                {chapters.map((chap, idx) => (
                  <button
                    key={chap.id}
                    onClick={() => { setCurrentChapterIndex(idx); setIsReading(true); }}
                    className="w-full px-5 py-4 bg-white hover:bg-gray-50 border border-gray-100 hover:border-black transition-all rounded-xl font-bold text-sm text-gray-800 flex justify-between items-center group shadow-sm"
                  >
                    <span className="group-hover:text-purple-700 transition-colors">{chap.title}</span>
                    <span className="text-[10px] text-gray-400 font-black tracking-wider uppercase">Read →</span>
                  </button>
                ))}
              </div>
            )}

            {/* Global Start Button Control Panel */}
            {chapters.length > 0 && (
              <div className="flex justify-center border-t border-gray-50 pt-10">
                <button 
                  onClick={() => { setCurrentChapterIndex(0); setIsReading(true); }}
                  className="group relative px-12 py-5 bg-black text-white rounded-2xl font-black text-sm tracking-[0.2em] shadow-2xl hover:bg-purple-700 transition-all active:scale-95 flex items-center gap-4"
                >
                  START READING NOW
                  <Icons.TrendingUp className="w-4 h-4 rotate-90 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </section>
        </div>
      ) : (
        
        /* --- FOCUSED READING MODE --- */
        <div className="animate-in slide-in-from-bottom-8 duration-700">
          <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <button 
                onClick={() => setIsReading(false)}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black flex items-center gap-2 group"
              >
                <Icons.Book className="w-4 h-4 group-hover:-rotate-12 transition-transform" /> 
                Exit Reader
              </button>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 line-clamp-1 max-w-[180px] md:max-w-none">{novel.title}</span>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {currentChapterIndex + 1} / {chapters.length}
              </div>
            </div>
          </div>

          <main className="max-w-3xl mx-auto px-4 py-24">
            {activeChapter ? (
              <article className="prose prose-2xl prose-slate mx-auto text-gray-800 font-serif leading-[2.4] tracking-tight">
                <div className="text-center mb-24">
                  <h2 className="text-4xl font-black text-gray-900 mb-4 font-sans tracking-tighter">{activeChapter.title}</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
                </div>
                
                {/* Clean multiline description printing block */}
                <div className="whitespace-pre-wrap font-medium text-gray-800 text-lg md:text-xl leading-[2.2]">
                  {activeChapter.content || "This segment details empty structural context pages."}
                </div>
              </article>
            ) : (
              <div className="text-center text-gray-400 font-medium py-12">No active reading target parsed.</div>
            )}

            {/* Pagination Controls Footer Deck */}
            <div className="mt-32 pt-16 border-t border-gray-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Previous Segment</p>
                <button 
                  disabled={currentChapterIndex === 0}
                  onClick={() => setCurrentChapterIndex(prev => prev - 1)}
                  className={`text-sm font-black uppercase tracking-wider ${currentChapterIndex === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-black hover:text-purple-600 transition-colors'}`}
                >
                  ← Back
                </button>
              </div>
              
              <button 
                onClick={() => {
                  if (currentChapterIndex < chapters.length - 1) {
                    setCurrentChapterIndex(prev => prev + 1);
                  } else {
                    setIsReading(false); // Return elegantly to landing hub when finished
                  }
                }}
                className="bg-black hover:bg-purple-600 text-white px-8 md:px-12 py-4 rounded-2xl font-black text-xs tracking-widest flex items-center gap-3 transition-all shadow-xl whitespace-nowrap"
              >
                {currentChapterIndex === chapters.length - 1 ? 'FINISH READING' : 'NEXT CHAPTER'} 
                <Icons.TrendingUp className="w-4 h-4 rotate-90"/>
              </button>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default ReadPage;