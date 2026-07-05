import React from 'react';
import { Icons } from "../Icons";

/**
 * High-Fidelity World-Building Codex Matrix & Scratchpad Panel
 */
const CodexSidebar = ({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
  isCreatingEntry,
  setIsCreatingEntry,
  codexEntries = [], // Safeguard array defaulting
  selectedEntry,
  entryTitle,
  setEntryTitle,
  entrySummary,
  setEntrySummary,
  entryContent,
  setEntryContent,
  onInitNewEntry,
  onOpenEdit,
  onSaveEntry,
  onDeleteEntry,
  onSpawnSticky,
  onToggleFloatStatus
}) => {
  const safeEntries = codexEntries || [];

  return (
    /* 
      ⚡ UX FIX: Using full height and width vectors to properly expand 
      and inhabit 100% of the parental drawer workspace bounding box.
    */
    <div className="w-full h-full flex flex-col bg-white z-30">
      
      {/* Main Container Assembly Context */}
      <aside className="w-full flex-1 flex flex-col bg-gray-50/30 overflow-hidden">
        <div className="w-full flex flex-col h-full bg-white">
          
          {/* Codex Navigation Tab Module Matrix */}
          <div className="grid grid-cols-3 border-b border-gray-100 text-center shrink-0 bg-white">
            {['Character', 'Lore', 'Scratchpad'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsCreatingEntry(false); }}
                className={`py-4.5 font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-300 relative ${
                  activeTab === tab 
                    ? 'text-purple-600' 
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                {tab}
                {/* Micro-lux animation underline bar */}
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-purple-600 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  activeTab === tab ? 'scale-x-100' : 'scale-x-0'
                }`} />
              </button>
            ))}
          </div>

          {/* Dynamic Content Panel Viewport */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50/40 no-scrollbar transition-all duration-300">
            {isCreatingEntry ? (
              
              /* DATA FIELD CAPTURE ATTRIBUTES FORM */
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest font-mono">
                    Attributes Matrix
                  </span>
                  <button 
                    onClick={() => setIsCreatingEntry(false)} 
                    className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-wider transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder={`${activeTab} Label/Title`}
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-purple-500 rounded-xl font-bold text-xs bg-white focus:outline-none placeholder:text-gray-300 transition-all duration-300 shadow-xs"
                />
                
                <input
                  type="text"
                  placeholder="Quick synopsis reference context..."
                  value={entrySummary}
                  onChange={(e) => setEntrySummary(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-purple-500 rounded-xl font-medium text-xs bg-white focus:outline-none placeholder:text-gray-300 transition-all duration-300 shadow-xs"
                />
                
                <textarea
                  placeholder="Deep structural properties, lore attributes, stats matrix..."
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  className="w-full h-44 px-4 py-3 border border-gray-200 focus:border-purple-500 rounded-xl font-medium text-xs bg-white resize-none focus:outline-none placeholder:text-gray-300 leading-relaxed transition-all duration-300 shadow-xs"
                />
                
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={onSaveEntry}
                    className="flex-1 py-3.5 bg-black hover:bg-purple-600 text-white font-black text-xs tracking-widest uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/5 active:scale-98"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Commit Node
                  </button>
                  
                  {selectedEntry && (
                    <button
                      onClick={(e) => { onDeleteEntry(selectedEntry.id, e); setIsCreatingEntry(false); }}
                      className="px-4.5 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-center active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              
              /* VAULT LIST INDEX FEED CONTAINER */
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest font-mono">
                    {activeTab} Index
                  </h4>
                  
                  {activeTab === 'Scratchpad' ? (
                    <button 
                      onClick={onSpawnSticky} 
                      className="text-[9px] font-black text-purple-600 hover:text-white bg-purple-50 hover:bg-purple-600 px-3 py-1.5 rounded-xl uppercase tracking-widest transition-all duration-300 flex items-center gap-1 border border-purple-100 shadow-sm active:scale-95"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span>Launch Sticky</span>
                    </button>
                  ) : (
                    <button 
                      onClick={onInitNewEntry} 
                      className="text-[9px] font-black text-purple-600 hover:text-white bg-purple-50 hover:bg-purple-600 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-purple-100 transition-all duration-300 shadow-sm active:scale-95"
                    >
                      + New Entry
                    </button>
                  )}
                </div>

                {safeEntries.filter(e => e.category === activeTab).length === 0 ? (
                  <p className="text-center text-xs font-medium text-gray-400 py-10 italic border border-dashed rounded-2xl bg-white border-gray-200/60 animate-in fade-in duration-300">
                    No system nodes registered in this quadrant.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {safeEntries
                      .filter(e => e.category === activeTab)
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className={`p-4 bg-white border rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative group hover:shadow-[0_8px_30px_rgba(147,51,234,0.04)] hover:-translate-y-0.5 ${
                            entry.is_floating 
                              ? 'border-purple-400 ring-2 ring-purple-100/50 bg-purple-50/5' 
                              : 'border-gray-100 hover:border-purple-200'
                          }`}
                        >
                          <div onClick={() => onOpenEdit(entry)} className="cursor-pointer pr-16 select-text">
                            <h5 className="font-black text-gray-900 text-xs tracking-tight line-clamp-1 group-hover:text-purple-600 transition-colors duration-200">{entry.title}</h5>
                            {entry.summary && <p className="text-gray-400 font-medium text-[11px] mt-0.5 leading-tight line-clamp-1">{entry.summary}</p>}
                            {entry.content && <p className="text-gray-500 font-medium text-[11px] mt-2 border-t border-gray-50 pt-2 line-clamp-2 whitespace-pre-wrap leading-relaxed">{entry.content}</p>}
                          </div>
                          
                          <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
                            {activeTab === 'Scratchpad' && (
                              <button
                                onClick={() => onToggleFloatStatus(entry, !entry.is_floating)}
                                className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md transition-all duration-300 flex items-center gap-0.5 border ${
                                  entry.is_floating 
                                    ? 'bg-purple-600 border-purple-600 text-white hover:bg-black hover:border-black' 
                                    : 'bg-gray-50 border-gray-100/70 text-gray-400 hover:bg-black hover:text-white hover:border-black'
                                }`}
                              >
                                <span>{entry.is_floating ? 'Dock' : 'Float'}</span>
                                {!entry.is_floating && (
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                  </svg>
                                )}
                              </button>
                            )}
                            <button
                              onClick={(e) => onDeleteEntry(entry.id, e)}
                              className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 md:opacity-0 md:group-hover:opacity-100"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CodexSidebar;