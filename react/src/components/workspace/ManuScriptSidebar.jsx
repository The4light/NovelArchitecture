import React from 'react';
import { Icons } from "../Icons";

/**
 * High-Fidelity Chapters & Narrative Blueprint Tree Sidebar
 */
const ManuscriptSidebar = ({
  isOpen,
  setIsOpen,
  novel,
  chapters = [], 
  activeChapter,
  canvasFocus,
  setCanvasFocus,
  onSelectChapter,
  onCreateChapter,
  onBackToDashboard
}) => {
  // Safe array execution fallback check
  const safeChapters = chapters || [];

  return (
    <div className="relative flex h-full z-30">
      {/* Drawer Container Panel Frame */}
      <aside 
        className={`bg-gray-50/50 border-r border-gray-100 flex flex-col transition-all duration-300 h-full ${
          isOpen ? 'w-72' : 'w-0 overflow-hidden border-none'
        }`}
      >
        <div className="flex-1 p-6 overflow-y-auto space-y-6 w-72 no-scrollbar">
          {/* Back Navigation Action */}
          <div>
            <button 
              onClick={onBackToDashboard} 
              className="text-xs font-black uppercase tracking-widest text-purple-600 hover:text-purple-800 transition-colors"
            >
              &larr; Studio Dashboard
            </button>
          </div>
          
          {/* Global Novel Meta Selector */}
          <div 
            onClick={() => setCanvasFocus('novel')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              canvasFocus === 'novel' 
                ? 'bg-purple-50 border-purple-200 shadow-sm' 
                : 'bg-white border-gray-100 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {/* ⚡ FIXED: Inline robust SVG replaces missing BookOpen component */}
              <svg className="w-[18px] h-[18px] text-purple-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <div>
                <h2 className="text-sm font-black text-gray-900 tracking-tight line-clamp-2">
                  {novel?.title || "Untitled Blueprint"}
                </h2>
                <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">
                  {novel?.genre || "Fantasy"}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mt-3.5 border-t border-purple-100/50 pt-2">
              Configure Profile &rarr;
            </span>
          </div>

          {/* Manuscript Segments Iteration Deck */}
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1 px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Manuscript Segments
              </span>
              <button 
                onClick={onCreateChapter} 
                className="text-[10px] font-black text-black uppercase tracking-wider hover:text-purple-600 transition-colors bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm"
              >
                + Add
              </button>
            </div>
            
            {safeChapters.length === 0 ? (
              <p className="text-center text-xs font-medium text-gray-400 py-4 italic">
                No segments compiled.
              </p>
            ) : (
              <div className="space-y-1.5">
                {safeChapters.map((chap) => {
                  const isActive = activeChapter?.id === chap.id && canvasFocus === 'chapter';
                  return (
                    <button
                      key={chap.id}
                      onClick={() => onSelectChapter(chap)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-xs transition-all tracking-wide border ${
                        isActive 
                          ? 'bg-black text-white border-black shadow-md shadow-black/5' 
                          : 'hover:bg-gray-100 text-gray-600 bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                      }`}
                    >
                      {chap.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Floating Toggle Drawer Switch Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-1/2 -translate-y-1/2 bg-black text-white hover:bg-purple-600 border border-white/10 w-6 h-14 flex items-center justify-center rounded-r-xl backdrop-blur-md transition-all duration-300 z-40 shadow-md group ${
          isOpen ? 'left-72' : 'left-0'
        }`}
      >
        {/* ⚡ FIXED: Inline robust SVGs replace missing ChevronLeft and ChevronRight components */}
        {isOpen ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ManuscriptSidebar;