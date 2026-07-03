import React from 'react';

/**
 * High-Fidelity Publish Action HUD Layout
 */
const PublishControls = ({ 
  mode, // 'novel' or 'chapter'
  status, // globalStatus or activeChapter.status
  title, // dynamic display tracking
  onSave, 
  onPublish, 
  onTitleChange 
}) => {
  const isPublished = status === 'Published';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-5 w-full">
      {/* Structural Label Matrix */}
      <div className="flex-1 min-w-0">
        {mode === 'novel' ? (
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            {/* ⚡ FIXED: Inline robust SVG replaces the undefined BookOpen component */}
            <svg className="w-6 h-6 text-purple-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Global Blueprint Interface
          </h1>
        ) : (
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-2xl font-black text-gray-900 tracking-tight focus:outline-none bg-transparent w-full border-b border-transparent hover:border-gray-200 focus:border-black transition-all pb-1 placeholder:text-gray-300 font-sans"
            placeholder="Untitled Document Segment"
          />
        )}
        
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`inline-block w-2 h-2 rounded-full ${isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {mode === 'novel' ? 'Profile Broadcast Layer' : 'Segment Status'}:{' '}
            <span className={isPublished ? 'text-emerald-500 font-black' : 'text-amber-500 font-black'}>
              {status || 'Draft'}
            </span>
          </p>
        </div>
      </div>

      {/* High Fidelity Interactive Button Cluster */}
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
        <button
          onClick={onSave}
          className="flex-1 md:flex-none px-6 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95"
        >
          {mode === 'novel' ? 'Save Draft Config' : 'Save Block'}
        </button>
        
        <button
          onClick={onPublish}
          className="flex-1 md:flex-none px-6 py-3.5 bg-black text-white hover:bg-purple-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-purple-500/10 active:scale-95 flex items-center justify-center gap-2"
        >
          {/* ⚡ FIXED: Inline robust SVG replaces the Globe component */}
          <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a14.5 14.5 0 000 20M2 12h20" />
          </svg>
          {mode === 'novel' ? 'Publish Profile' : 'Go Live'}
        </button>
      </div>
    </div>
  );
};

export default PublishControls;