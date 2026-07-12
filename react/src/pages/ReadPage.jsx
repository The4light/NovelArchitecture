import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { genreColors } from '../data/novel';
import { supabase } from '../lib/supabaseClient';

const fontStack = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';

const ReadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullNarrativeData = async () => {
      try {
        setLoading(true);
        
        // Fetch novel metadata details alongside creator profile record via user_id relationship mapping
        const { data: novelData, error: novelErr } = await supabase
          .from('novels')
          .select(`
            *,
            profiles:user_id (
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (novelErr) throw novelErr;
        setNovel(novelData);

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, isReading, currentChapterIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center" style={{ fontFamily: fontStack }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#E5E5EA] border-t-[#4B3869] animate-spin" />
      </div>
    );
  }

  if (!novel) {
    return <div className="min-h-screen flex items-center justify-center text-[#6E6E73] font-medium" style={{ fontFamily: fontStack }}>Manuscript dataset not found.</div>;
  }

  const activeChapter = chapters[currentChapterIndex];
  const authorProfile = novel.profiles;

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] antialiased selection:bg-[#EDE9F7]" style={{ fontFamily: fontStack }}>
      {!isReading && <Navbar />}

      {!isReading ? (
        <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-28 pb-20">
          <header className="flex flex-col md:flex-row items-center gap-12 border-b border-[#E5E5EA] pb-12">
            
            {/* Elegant Cover Artwork */}
            <div className="w-48 sm:w-64 shrink-0">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.06)] border border-[#E5E5EA]">
                <img 
                  src={novel.thumbnail_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600"} 
                  alt={novel.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            {/* Book Info Metadata */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border ${genreColors[novel.genre] || 'bg-[#F1F1F3] text-[#6E6E73] border-[#E5E5EA]'}`}>
                {novel.genre}
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] tracking-tight capitalize leading-tight">
                {novel.title}
              </h1>
              
              {/* Connected Dynamic Profile Navigation Card */}
              <div 
                onClick={() => authorProfile?.username && navigate(`/profile/${authorProfile.username}`)}
                className="inline-flex items-center justify-center md:justify-start gap-3 group cursor-pointer border border-[#E5E5EA] bg-white px-4 py-2 rounded-xl hover:border-[#1D1D1F]/20 transition-all shadow-sm"
              >
                <img 
                  src={authorProfile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + novel.user_id} 
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-[#E5E5EA]" 
                  alt="" 
                />
                <div className="text-left">
                  <p className="text-[9px] font-bold text-[#6E6E73] uppercase tracking-wider leading-none">Author</p>
                  <p className="text-xs font-semibold text-[#1D1D1F] transition-colors mt-0.5">
                    {authorProfile?.display_name || 'Anonymous'}
                  </p>
                </div>
              </div>

              <p className="text-base text-[#6E6E73] leading-relaxed max-w-xl font-normal">
                {novel.synopsis || novel.description || 'No public description committed.'}
              </p>

              <div className="text-xs font-medium text-[#6E6E73] pt-2">
                <span className="flex items-center justify-center md:justify-start gap-1.5">
                  <Icons.Book className="w-4 h-4 text-[#8E8E93]"/> {chapters.length} Chapters published
                </span>
              </div>
            </div>
          </header>

          {/* Table of Contents Container */}
          <section className="max-w-2xl mx-auto py-16">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-6 text-center">Table of Contents</h3>

            {chapters.length === 0 ? (
              <div className="text-center text-sm font-medium text-[#6E6E73] italic py-8 border border-dashed border-[#E5E5EA] rounded-2xl bg-white">
                This author hasn't launched any chapters live yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-w-md mx-auto mb-12">
                {chapters.map((chap, idx) => (
                  <button
                    key={chap.id}
                    onClick={() => { setCurrentChapterIndex(idx); setIsReading(true); }}
                    className="w-full px-5 py-3.5 bg-white border border-[#E5E5EA] hover:border-[#4B3869] text-left transition-all rounded-xl font-medium text-sm text-[#1D1D1F] flex justify-between items-center group shadow-sm"
                  >
                    <span className="group-hover:text-[#4B3869] transition-colors">{chap.title}</span>
                    <span className="text-[10px] text-[#6E6E73] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">Read →</span>
                  </button>
                ))}
              </div>
            )}

            {chapters.length > 0 && (
              <div className="flex justify-center border-t border-[#E5E5EA] pt-10">
                <button 
                  onClick={() => { setCurrentChapterIndex(0); setIsReading(true); }}
                  className="px-8 py-4 bg-[#1D1D1F] text-white rounded-full font-medium text-sm tracking-wide shadow-md hover:bg-[#4B3869] transition-colors"
                >
                  Start Reading Now
                </button>
              </div>
            )}
          </section>
        </div>
      ) : (
        /* --- HIGH CONTRAST IMMERSIVE READER MODE --- */
        <div className="bg-white min-h-screen">
          <div className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E5EA] px-6 py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <button 
                onClick={() => setIsReading(false)}
                className="text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] flex items-center gap-1.5"
              >
                ← Exit
              </button>
              <span className="text-xs font-semibold text-[#1D1D1F] truncate max-w-[200px] capitalize">{novel.title}</span>
              <div className="text-xs font-medium text-[#6E6E73]">
                {currentChapterIndex + 1} / {chapters.length}
              </div>
            </div>
          </div>

          <main className="max-w-2xl mx-auto px-6 py-20">
            {activeChapter ? (
              <article className="prose prose-neutral mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-semibold text-[#1D1D1F] mb-3 capitalize">{activeChapter.title}</h2>
                  <div className="w-8 h-0.5 bg-[#4B3869] mx-auto rounded-full" />
                </div>
                
                {/* Clean serif text container for reading fatigue prevention */}
                <div 
                  className="whitespace-pre-wrap font-serif text-[#1D1D1F] text-lg sm:text-xl leading-[2.1] tracking-normal"
                  style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
                >
                  {activeChapter.content || "This segment details empty structural context pages."}
                </div>
              </article>
            ) : (
              <div className="text-center text-[#6E6E73] font-medium py-12">No active reading target parsed.</div>
            )}

            {/* Reader Controls Footer */}
            <div className="mt-24 pt-10 border-t border-[#E5E5EA] flex items-center justify-between">
              <button 
                disabled={currentChapterIndex === 0}
                onClick={() => setCurrentChapterIndex(prev => prev - 1)}
                className={`text-sm font-medium ${currentChapterIndex === 0 ? 'text-[#D1D1D6] cursor-not-allowed' : 'text-[#1D1D1F] hover:text-[#4B3869]'}`}
              >
                ← Previous
              </button>
              
              <button 
                onClick={() => {
                  if (currentChapterIndex < chapters.length - 1) {
                    setCurrentChapterIndex(prev => prev + 1);
                  } else {
                    setIsReading(false);
                  }
                }}
                className="bg-[#1D1D1F] hover:bg-[#4B3869] text-white px-6 py-3 rounded-full font-medium text-xs tracking-wide transition-colors"
              >
                {currentChapterIndex === chapters.length - 1 ? 'Finish Reading' : 'Next Chapter →'} 
              </button>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default ReadPage;