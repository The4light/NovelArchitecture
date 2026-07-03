import React from 'react';
import { Icons } from "../Icons"
/**
 * High-Fidelity Chapters & Narrative Blueprint Tree Sidebar
 */
const ManuscriptSidebar = ({
  isOpen,
  setIsOpen,
  novel,
  chapters = [], // ⚡ FIX: Default value prevents the 'length of undefined' error
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
              <BookOpen size={18} className="text-purple-600 shrink-0 mt-0.5" />
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
        {isOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
      </button>
    </div>
  );
};

export default ManuscriptSidebar;