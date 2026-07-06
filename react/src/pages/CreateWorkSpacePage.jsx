import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FloatingSticky from '../components/FloatingSticky';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

import PublishControls from '../components/workspace/PublishControls';
import ManuscriptSidebar from '../components/workspace/ManuScriptSidebar';
import CodexSidebar from '../components/workspace/CodexSidebar';

const CreationWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  // Layout Controls
  const [menuOpen, setMenuOpen] = useState(true); 
  const [activeTab, setActiveTab] = useState('chapters'); 
  const [canvasFocus, setCanvasFocus] = useState('chapter'); 

  // Dynamic Fallback Matrix: Quick Navigation Hub State
  const [showQuickJumper, setShowQuickJumper] = useState(false);

  // Global Novel states
  const [novel, setNovel] = useState(null);
  const [globalTitle, setGlobalTitle] = useState('');
  const [globalGenre, setGlobalGenre] = useState('Fantasy');
  const [globalSummary, setGlobalSummary] = useState('');
  const [globalStatus, setGlobalStatus] = useState('Draft');

  // Core Chapter States
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  
  // Codex Core Pipeline States
  const [codexEntries, setCodexEntries] = useState([]);
  const [activeCodexTab, setActiveCodexTab] = useState('Character');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);

  // Input Buffer Fields
  const [entryTitle, setEntryTitle] = useState('');
  const [entrySummary, setEntrySummary] = useState('');
  const [entryContent, setEntryContent] = useState('');

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
    else if (user) fetchWorkspaceData();
  }, [id, user, loading]);

  // ⚡ HARDENED MOBILE UX LOCK: Intercept background scroll leaks when sidebar layer is active
  useEffect(() => {
    if (window.innerWidth < 768 && menuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [menuOpen]);

  // Adjust menu layout balance on resize automatically with smooth calibration
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(true); 
      } else {
        setMenuOpen(false); 
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWorkspaceData = async () => {
    try {
      const { data: novelData } = await supabase.from('novels').select('*').eq('id', id).single();
      if (novelData) {
        setNovel(novelData);
        setGlobalTitle(novelData.title);
        setGlobalGenre(novelData.genre);
        setGlobalSummary(novelData.synopsis || '');
        setGlobalStatus(novelData.status);
      }

      const { data: chapData } = await supabase.from('chapters').select('*').eq('novel_id', id).order('chapter_order', { ascending: true });
      setChapters(chapData || []);
      if (chapData && chapData.length > 0) {
        selectChapter(chapData[0]);
      }

      const { data: codexData } = await supabase.from('codex_entries').select('*').eq('novel_id', id).order('created_at', { ascending: false });
      setCodexEntries(codexData || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  const selectChapter = (chap) => {
    setCanvasFocus('chapter');
    setActiveChapter(chap);
    setChapterTitle(chap.title);
    setChapterContent(chap.content || '');
  };

  const handleUpdateGlobalNovel = async (statusTarget) => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('novels')
        .update({
          title: globalTitle,
          genre: globalGenre,
          synopsis: globalSummary,
          status: statusTarget
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setNovel(data);
        setGlobalStatus(data.status);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChapter = async () => {
    const nextOrder = chapters.length + 1;
    const { data } = await supabase.from('chapters').insert([{ novel_id: id, title: `Chapter ${nextOrder}: Untitled`, content: '', chapter_order: nextOrder, status: 'Draft' }]).select().single();
    if (data) {
      setChapters([...chapters, data]);
      selectChapter(data);
    }
  };

  const handleSaveDraft = async () => {
    if (!activeChapter) return;
    setSaving(true);
    try {
      await supabase.from('chapters').update({ title: chapterTitle, content: chapterContent }).eq('id', activeChapter.id);
      setChapters(chapters.map(c => c.id === activeChapter.id ? { ...c, title: chapterTitle, content: chapterContent } : c));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishChapter = async () => {
    if (!activeChapter) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('chapters')
        .update({ title: chapterTitle, content: chapterContent, status: 'Published' })
        .eq('id', activeChapter.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setChapters(chapters.map(c => c.id === activeChapter.id ? data : c));
        setActiveChapter(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const spawnNewStickyNote = async () => {
    const newSticky = {
      novel_id: id,
      title: 'Quick Scratchpad Idea',
      category: 'Scratchpad',
      summary: 'Quick floating thought context',
      content: '',
      is_floating: true,
      position_x: 60 + Math.floor(Math.random() * 80),
      position_y: 120 + Math.floor(Math.random() * 80),
      bg_color: '#fef08a'
    };

    try {
      const { data, error } = await supabase.from('codex_entries').insert([newSticky]).select().single();
      if (error) return console.error(error.message);
      if (data) setCodexEntries((prev) => [data, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFloatStatus = async (entry, status) => {
    setCodexEntries(codexEntries.map(e => e.id === entry.id ? { ...e, is_floating: status } : e));
    await supabase.from('codex_entries').update({ is_floating: status }).eq('id', entry.id);
  };

  const initNewCodexEntry = () => {
    setSelectedEntry(null);
    setEntryTitle('');
    setEntrySummary('');
    setEntryContent('');
    setIsCreatingEntry(true);
  };

  const openEditCodex = (entry) => {
    setSelectedEntry(entry);
    setEntryTitle(entry.title);
    setEntrySummary(entry.summary || '');
    setEntryContent(entry.content || '');
    setIsCreatingEntry(true);
  };

  const handleSaveCodexEntry = async () => {
    if (!entryTitle.trim()) return;
    const payload = { novel_id: id, title: entryTitle, category: activeCodexTab, summary: entrySummary, content: entryContent };

    if (selectedEntry) {
      await supabase.from('codex_entries').update(payload).eq('id', selectedEntry.id);
      setCodexEntries(codexEntries.map(e => e.id === selectedEntry.id ? { ...e, ...payload } : e));
      setIsCreatingEntry(false);
      setSelectedEntry(null);
    } else {
      const { data } = await supabase.from('codex_entries').insert([payload]).select().single();
      if (data) setCodexEntries([data, ...codexEntries]);
      setIsCreatingEntry(false);
    }
  };

  const handleDeleteCodexEntry = async (entryId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this entry permanently?")) return;
    try {
      await supabase.from('codex_entries').delete().eq('id', entryId);
      setCodexEntries((prev) => prev.filter(item => item.id !== entryId));
    } catch (err) {
      console.error(err);
    }
  };

  if (pageLoading) return <div className="min-h-screen flex items-center justify-center bg-white text-xs font-black tracking-widest text-purple-600 animate-pulse">SYNCING WORKSPACE STREAM...</div>;

return (
    <div className="fixed inset-0 bg-white flex flex-col overflow-hidden select-none text-black selection:bg-purple-100">
      
      {/* Premium iOS Motion Interaction Buffers */}
      <style>{`
        .custom-ease-panel {
          transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), width 450ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ios-scroll-container {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        .ios-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ─── FIXED HEADER NAVBAR LAYOUT ─── */}
      <header className="h-16 border-b border-gray-100 px-4 md:px-6 flex items-center justify-between bg-white z-50 shrink-0 shadow-xs select-none">
        <div className="flex items-center gap-4">
          {/* Animated Hamburger Trigger */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-300 active:scale-90 flex items-center justify-center border border-gray-100 bg-white"
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-500 transform ${menuOpen ? 'rotate-90 text-purple-600' : 'rotate-0 text-black'}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Elevated Story Mark */}
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-black tracking-tight text-gray-900 max-w-[140px] md:max-w-none truncate capitalize">{globalTitle || "Untitled Story"}</h1>
            <span className="text-[8px] font-black uppercase tracking-widest bg-purple-600 text-white px-2 py-0.5 rounded-sm">{globalGenre}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Clean Top Nav-Jumper Option */}
          <button
            onClick={() => setShowQuickJumper(!showQuickJumper)}
            className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-wider hover:bg-amber-600 hover:text-white transition-all duration-300 active:scale-95 flex items-center gap-1 shadow-xs"
          >
            <span>Nav Jumper</span>
            <svg className={`w-2.5 h-2.5 transition-transform duration-300 ${showQuickJumper ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {saving && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-ping" />
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 hidden sm:inline-block">Syncing...</span>
            </div>
          )}
        </div>
      </header>

      {/* Jumper Quick Dropdown Selector Map */}
      {showQuickJumper && (
        <div className="absolute top-16 left-0 right-0 max-h-60 bg-white border-b border-gray-200 shadow-xl z-50 overflow-y-auto p-4 ios-scroll-container animate-in slide-in-from-top-3 duration-300 ease-out">
          <div className="text-[9px] font-black uppercase tracking-wider text-gray-400 font-mono mb-2">Instant Jumper Node Stream</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pb-6">
            <button
              onClick={() => { setCanvasFocus('novel'); setShowQuickJumper(false); }}
              className="p-2.5 text-left text-xs font-bold rounded-xl border border-amber-200 bg-amber-50/40 text-amber-900 hover:bg-amber-100 transition-colors flex items-center justify-between"
            >
              <span>📖 Global Settings (Synopsis & Meta)</span>
              <span className="text-[9px] uppercase font-mono bg-amber-200 text-amber-800 px-1.5 rounded">Meta</span>
            </button>
            {chapters.map((chap, idx) => (
              <button
                key={chap.id}
                onClick={() => { selectChapter(chap); setShowQuickJumper(false); }}
                className={`p-2.5 text-left text-xs font-bold rounded-xl border transition-all ${
                  activeChapter?.id === chap.id 
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-500' 
                    : 'border-gray-100 bg-gray-50 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <div className="truncate font-black">{chap.title}</div>
                <div className="text-[9px] text-gray-400 font-normal">Sequence Node Matrix #{idx + 1}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Notes Engine Layer */}
      {codexEntries.filter(e => e.is_floating).map((note) => (
        <FloatingSticky
          key={note.id}
          note={note}
          codexEntries={codexEntries}
          setCodexEntries={setCodexEntries}
          spawnNewStickyNote={spawnNewStickyNote}
        />
      ))}

      {/* ─── MAIN WORKSPACE FRAME ASSEMBLY ─── */}
      <div className="flex flex-1 h-[calc(100dvh-4rem)] overflow-hidden relative bg-white">
        
        {/* ⚡ SNIPPET CHANGER: FIXED THE GHOST SPACE & REDUCED TOP BLOCKING
          Anchoring 'top-16 bottom-0' matches the header navbar precisely without overlay offsets.
        */}
        <aside className={`
          fixed md:static top-16 bottom-0 left-0 bg-white border-r border-gray-100 z-40 flex flex-col custom-ease-panel h-[calc(100dvh-4rem)] overflow-hidden
          ${menuOpen ? 'w-full sm:w-80 md:w-96 translate-x-0 shadow-2xl md:shadow-none' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 md:border-none'}
        `}>
          
          {/* original layout design tab bar choice structure */}
          <div className="p-4 border-b border-gray-100 flex gap-2 bg-gray-50/40 shrink-0">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`flex-1 text-center py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                activeTab === 'chapters' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'bg-white border border-gray-100 text-gray-400 hover:text-black'
              }`}
            >
              Manuscript
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 text-center py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                activeTab === 'notes' 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'bg-white border border-gray-100 text-gray-400 hover:text-purple-600'
              }`}
            >
              World Codex
            </button>
          </div>

          {/* Core Content Views with safety scroll pads */}
          <div className="flex-1 overflow-y-auto h-full min-h-0 pb-36 ios-scroll-container">
            {activeTab === 'chapters' ? (
              <ManuscriptSidebar
                isOpen={false} 
                setIsOpen={() => {}} 
                novel={novel}
                chapters={chapters}
                activeChapter={activeChapter}
                canvasFocus={canvasFocus}
                setCanvasFocus={setCanvasFocus}
                onSelectChapter={(chap) => { selectChapter(chap); if (window.innerWidth < 768) setMenuOpen(false); }}
                onCreateChapter={handleCreateChapter}
                onBackToDashboard={() => navigate('/write')}
              />
            ) : (
              <CodexSidebar
                isOpen={false} 
                setIsOpen={() => {}} 
                activeTab={activeCodexTab}
                setActiveTab={setActiveCodexTab}
                isCreatingEntry={isCreatingEntry}
                setIsCreatingEntry={setIsCreatingEntry}
                codexEntries={codexEntries}
                selectedEntry={selectedEntry}
                entryTitle={entryTitle}
                setEntryTitle={setEntryTitle}
                entrySummary={entrySummary}
                setEntrySummary={setEntrySummary}
                entryContent={entryContent}
                setEntryContent={setEntryContent}
                onInitNewEntry={initNewCodexEntry}
                onOpenEdit={openEditCodex}
                onSaveEntry={handleSaveCodexEntry}
                onDeleteEntry={handleDeleteCodexEntry}
                onSpawnSticky={spawnNewStickyNote}
                onToggleFloatStatus={toggleFloatStatus}
              />
            )}
          </div>
        </aside>

        {/* Mobile Backdrop Overlay Filter */}
        {menuOpen && (
          <div 
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/10 backdrop-blur-xs z-30 md:hidden transition-opacity duration-500" 
          />
        )}

        {/* PROSE EDITOR CONTENT SHEET */}
        <main className="flex-1 bg-white flex flex-col overflow-y-auto px-4 py-6 md:p-12 lg:p-16 h-full ios-scroll-container">
          {canvasFocus === 'novel' ? (
            <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-24">
              <PublishControls 
                mode="novel"
                status={globalStatus}
                onSave={() => handleUpdateGlobalNovel('Draft')}
                onPublish={() => handleUpdateGlobalNovel('Published')}
              />

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-amber-500 font-mono">Story Title</label>
                  <input 
                    type="text"
                    value={globalTitle}
                    onChange={(e) => setGlobalTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 font-bold text-xs bg-white text-black focus:outline-none transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-amber-500 font-mono">Genre Category</label>
                  <input 
                    type="text"
                    value={globalGenre}
                    onChange={(e) => setGlobalGenre(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 font-bold text-xs bg-white text-black focus:outline-none transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 font-mono">Story Description</label>
                  <textarea 
                    value={globalSummary}
                    onChange={(e) => setGlobalSummary(e.target.value)}
                    className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 focus:border-black font-medium text-xs bg-white text-black focus:outline-none resize-none leading-relaxed transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          ) : activeChapter ? (
            <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400 ease-out pb-24">
              <PublishControls 
                mode="chapter"
                status={activeChapter?.status}
                title={chapterTitle}
                onTitleChange={setChapterTitle}
                onSave={handleSaveDraft}
                onPublish={handlePublishChapter}
              />

              <textarea
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                placeholder="Start typing your chapter story text here..."
                className="w-full flex-1 bg-transparent text-gray-900 leading-relaxed font-medium text-sm md:text-base placeholder:text-gray-300 resize-none focus:outline-none min-h-[350px] border-l border-transparent focus:border-purple-600/10 pl-2 transition-all duration-300"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-500">
              <button 
                onClick={handleCreateChapter} 
                className="bg-purple-600 text-white hover:bg-black px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all duration-300 shadow-md shadow-purple-600/10"
              >
                Create Your First Chapter
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default CreationWorkspacePage;