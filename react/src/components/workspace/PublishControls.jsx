import React from 'react';
import { Globe, BookOpen } from 'lucide-react';

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
            <BookOpen size={22} className="text-purple-600 shrink-0" />
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
          {/* Cleansed Icon Instance */}
          <Globe size={14} className="shrink-0" />
          {mode === 'novel' ? 'Publish Profile' : 'Go Live'}
        </button>
      </div>
    </div>
  );
};

export default PublishControls;