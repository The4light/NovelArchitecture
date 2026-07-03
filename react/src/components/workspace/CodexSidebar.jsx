import React from 'react';
import { Icons } from "../Icons"

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
  codexEntries,
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
  return (
    <div className="relative flex h-full z-30">
      {/* Floating Toggle Drawer Switch Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-1/2 -translate-y-1/2 bg-black text-white hover:bg-purple-600 border border-white/10 w-6 h-14 flex items-center justify-center rounded-l-xl backdrop-blur-md transition-all duration-300 z-40 shadow-md group ${
          isOpen ? 'right-80 md:right-96' : 'right-0'
        }`}
      >
        {isOpen ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Main Drawer Container Context */}
      <aside 
        className={`bg-gray-50/50 border-l border-gray-100 flex flex-col transition-all duration-300 h-full ${
          isOpen ? 'w-80 md:w-96' : 'w-0 overflow-hidden border-none'
        }`}
      >
        <div className="w-80 md:w-96 flex flex-col h-full bg-white">
          
          {/* Codex Navigation Tab Module Matrix */}
          <div className="grid grid-cols-3 border-b border-gray-100 text-center shrink-0">
            {['Character', 'Lore', 'Scratchpad'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsCreatingEntry(false); }}
                className={`py-4.5 font-black text-[10px] tracking-[0.2em] uppercase transition-all ${
                  activeTab === tab 
                    ? 'border-b-2 border-black text-black' 
                    : 'text-gray-400 hover:text-black border-b border-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dynamic Content Panel Viewport */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50/30 no-scrollbar">
            {isCreatingEntry ? (
              
              /* DATA FIELD CAPTURE ATRIBUTES FORM */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                    Attributes Panel
                  </span>
                  <button 
                    onClick={() => setIsCreatingEntry(false)} 
                    className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder={`${activeTab} Label/Title`}
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-xs bg-white focus:outline-black placeholder:text-gray-300"
                />
                
                <input
                  type="text"
                  placeholder="Quick synopsis reference context..."
                  value={entrySummary}
                  onChange={(e) => setEntrySummary(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium text-xs bg-white focus:outline-black placeholder:text-gray-300"
                />
                
                <textarea
                  placeholder="Deep structural properties, lore attributes, stats matrix..."
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  className="w-full h-44 px-4 py-3 border border-gray-200 rounded-xl font-medium text-xs bg-white resize-none focus:outline-black placeholder:text-gray-300 leading-relaxed"
                />
                
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={onSaveEntry}
                    className="flex-1 py-3.5 bg-black text-white font-black text-xs tracking-widest uppercase rounded-xl hover:bg-purple-600 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check size={13} strokeWidth={3} />
                    Commit Node
                  </button>
                  
                  {selectedEntry && (
                    <button
                      onClick={(e) => { onDeleteEntry(selectedEntry.id, e); setIsCreatingEntry(false); }}
                      className="px-4.5 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              
              /* VAULT LIST INDEX FEED CONTAINER */
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    {activeTab} Nodes
                  </h4>
                  
                  {activeTab === 'Scratchpad' ? (
                    <button 
                      onClick={onSpawnSticky} 
                      className="text-[9px] font-black text-purple-600 hover:text-white bg-purple-50 hover:bg-purple-600 px-3 py-1.5 rounded-xl uppercase tracking-widest transition-all duration-200 flex items-center gap-1 border border-purple-100 shadow-sm"
                    >
                      <Plus size={11} strokeWidth={3} />
                      <span>Launch Sticky</span>
                    </button>
                  ) : (
                    <button 
                      onClick={onInitNewEntry} 
                      className="text-[9px] font-black text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-purple-100 transition-colors"
                    >
                      + New Entry
                    </button>
                  )}
                </div>

                {codexEntries.filter(e => e.category === activeTab).length === 0 ? (
                  <p className="text-center text-xs font-medium text-gray-400 py-10 italic border border-dashed rounded-2xl bg-white border-gray-100">
                    No system entries registered.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {codexEntries
                      .filter(e => e.category === activeTab)
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className={`p-4 bg-white border rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all relative group ${
                            entry.is_floating 
                              ? 'border-purple-300 ring-1 ring-purple-100 bg-purple-50/10' 
                              : 'border-gray-100 hover:border-gray-300'
                          }`}
                        >
                          <div onClick={() => onOpenEdit(entry)} className="cursor-pointer pr-16 select-text">
                            <h5 className="font-black text-gray-900 text-xs tracking-tight line-clamp-1">{entry.title}</h5>
                            {entry.summary && <p className="text-gray-400 font-medium text-[11px] mt-0.5 leading-tight line-clamp-1">{entry.summary}</p>}
                            {entry.content && <p className="text-gray-500 font-medium text-[11px] mt-2 border-t border-gray-50 pt-2 line-clamp-2 whitespace-pre-wrap leading-relaxed">{entry.content}</p>}
                          </div>
                          
                          <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
                            {activeTab === 'Scratchpad' && (
                              <button
                                onClick={() => onToggleFloatStatus(entry, !entry.is_floating)}
                                className="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-gray-50 hover:bg-black hover:text-white rounded-md text-gray-400 transition-all flex items-center gap-0.5 border border-gray-100/50"
                              >
                                <span>{entry.is_floating ? 'Dock' : 'Float'}</span>
                                {!entry.is_floating && <ArrowUpRight size={9} />}
                              </button>
                            )}
                            <button
                              onClick={(e) => onDeleteEntry(entry.id, e)}
                              className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all md:opacity-0 md:group-hover:opacity-100"
                            >
                              <Trash2 size={13} />
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