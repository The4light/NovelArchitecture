import React from 'react';

const AnalyticsEngine = ({ novels = [] }) => {
  // ─── DATA CALCULATIONS ───
  const totalStories = novels.length;
  const publishedStories = novels.filter((n) => n.status === 'Published').length;
  const draftStories = totalStories - publishedStories;

  // Find the genre with the most stories
  const genreCounts = novels.reduce((acc, novel) => {
    if (novel.genre) {
      acc[novel.genre] = (acc[novel.genre] || 0) + 1;
    }
    return acc;
  }, {});

  const favoriteGenre = Object.keys(genreCounts).reduce(
    (a, b) => (genreCounts[a] > genreCounts[b] ? a : b),
    'None'
  );

  // Simple chapter estimate based on status numbers
  const totalChapters = (publishedStories * 12) + (draftStories * 3);

  // Generate a live 7-column progress block layout based on published work
  const progressBlocks = Array.from({ length: 7 }, (_, index) => {
    return index < publishedStories;
  });

  return (
    <div className="space-y-12 text-black animate-in fade-in duration-300">
      
      {/* ─── MAIN STATS GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Stat 1 */}
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Total Stories Created</p>
          <h3 className="text-5xl font-black">{totalStories}</h3>
          <p className="text-xs text-gray-500 mt-4">All books in your account.</p>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Stories Published</p>
          <h3 className="text-5xl font-black text-blue-600">{publishedStories}</h3>
          <p className="text-xs text-gray-500 mt-4">Live and visible to readers.</p>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Drafts Saved</p>
          <h3 className="text-5xl font-black">{draftStories}</h3>
          <p className="text-xs text-gray-500 mt-4">In-progress private files.</p>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Most Written Genre</p>
          <h3 className="text-3xl font-black text-gray-900 truncate">{favoriteGenre}</h3>
          <p className="text-xs text-gray-500 mt-5">Your primary focus category.</p>
        </div>

      </div>

      {/* ─── VISUAL PERFORMANCE ROW ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Rate of Work Tracker */}
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm md:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Publication Activity Rate</h3>
            <p className="text-xs text-gray-400 mt-1">Visual momentum meters built from your live public books.</p>
          </div>

          <div className="h-24 flex items-end gap-3 bg-gray-50 rounded-xl p-6 border border-gray-100">
            {progressBlocks.map((isActive, idx) => (
              <div 
                key={idx} 
                className={`w-full h-full rounded-md transition-all duration-300 ${
                  isActive ? 'bg-black' : 'bg-gray-200'
                }`} 
              />
            ))}
          </div>

          <div className="flex gap-6 text-xs font-bold uppercase tracking-wide text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-black" /> Completed Milestones
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-gray-200" /> Remaining Slots
            </span>
          </div>
        </div>

        {/* Chapter Outputs Tracker */}
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Chapter Output Scale</h3>
            <p className="text-xs text-gray-400 mt-1">Estimated workload mass across your drafts.</p>
          </div>

          <div className="py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Total Estimated Chapters</p>
            <h2 className="text-6xl font-black text-gray-900">{totalChapters}</h2>
          </div>

          <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
            Calculated cleanly across open drafts and finished stories.
          </p>
        </div>

      </div>

    </div>
  );
};

export default AnalyticsEngine;