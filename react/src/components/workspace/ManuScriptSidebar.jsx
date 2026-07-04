import React from 'react';

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
  const safeChapters = chapters || [];

  return (
    <div className="w-full flex flex-col h-full bg-white">
      {/* ─── DOCK LAYER CONTAINER ─── */}
      <div className="flex-1 p-5 space-y-6 overflow-y-auto">
        
        {/* Simple Back Step Action */}
        <button 
          onClick={onBackToDashboard} 
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1"
        >
          &larr; Exit to Dashboard
        </button>
        
        {/* Story Configuration Meta Block */}
        <div 
          onClick={() => setCanvasFocus('novel')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            canvasFocus === 'novel' 
              ? 'bg-black text-white border-black shadow-sm' 
              : 'bg-gray-50/50 border-gray-200/60 hover:border-black'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <svg className={`w-4 h-4 shrink-0 mt-0.5 ${canvasFocus === 'novel' ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <div>
              <h2 className="text-xs font-black tracking-tight leading-tight">
                {novel?.title || "Untitled Blueprint"}
              </h2>
              <p className={`text-[9px] font-bold mt-0.5 uppercase tracking-wider ${canvasFocus === 'novel' ? 'text-gray-300' : 'text-gray-400'}`}>
                {novel?.genre || "Fantasy"}
              </p>
            </div>
          </div>
          <span className={`text-[9px] font-black uppercase tracking-wider block mt-3 border-t pt-2 ${canvasFocus === 'novel' ? 'border-white/10 text-gray-200' : 'border-gray-200/50 text-gray-400 hover:text-black'}`}>
            Story Settings &rarr;
          </span>
        </div>

        {/* Index Control Assembly */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Chapters Index
            </span>
            <button 
              onClick={onCreateChapter} 
              className="text-[10px] font-black text-white uppercase tracking-wider bg-black hover:bg-gray-900 transition-colors px-2.5 py-1 rounded-lg"
            >
              + Add
            </button>
          </div>
          
          {safeChapters.length === 0 ? (
            <p className="text-left text-xs font-medium text-gray-400 py-2 italic">
              No nodes created yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {safeChapters.map((chap) => {
                const isActive = activeChapter?.id === chap.id && canvasFocus === 'chapter';
                return (
                  <button
                    key={chap.id}
                    onClick={() => onSelectChapter(chap)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs transition-all tracking-wide border ${
                      isActive 
                        ? 'bg-black text-white border-black shadow-sm' 
                        : 'hover:border-black text-gray-600 bg-white border-gray-200/70 hover:text-black'
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
    </div>
  );
};

export default ManuscriptSidebar;