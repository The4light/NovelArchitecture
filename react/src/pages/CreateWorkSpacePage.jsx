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
  const [menuOpen, setMenuOpen] = useState(true); // Default open on PC
  const [activeTab, setActiveTab] = useState('chapters'); 
  const [canvasFocus, setCanvasFocus] = useState('chapter'); 

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

  // Adjust menu layout balance on resize automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(true); // Keep locked open on desktop panels
      } else {
        setMenuOpen(false); // Close by default on tight phone layers
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
      position_x: 180 + Math.floor(Math.random() * 100),
      position_y: 120 + Math.floor(Math.random() * 100),
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

  if (pageLoading) return <div className="min-h-screen flex items-center justify-center bg-white text-xs font-black tracking-widest text-gray-400">SYNCING WORKSPACE STREAM...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col h-screen overflow-hidden relative select-none text-black">
      
      {/* ─── FLOATING PREMIUM HEADER NAVBAR LAYER ─── */}
      <header className="h-16 border-b border-gray-100 px-6 flex items-center justify-between bg-white/90 backdrop-blur-md z-50 sticky top-0 implementation-header shadow-xs">
        <div className="flex items-center gap-5">
          {/* Animated Interactive Hamburger */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 -ml-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 flex items-center justify-center border border-gray-100 bg-white shadow-xs"
          >
            <svg 
              className={`w-4 h-4 text-black transition-transform duration-300 ease-out transform ${menuOpen ? 'rotate-90' : 'rotate-0'}`} 
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

          {/* Elevated High-Presence Story Mark */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-base md:text-lg font-black tracking-tight text-black capitalize">{globalTitle || "Untitled Story"}</h1>
            <span className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded-md">{globalGenre}</span>
          </div>
        </div>

        {saving && <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">Autosaving...</span>}
      </header>

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

      {/* ─── VIEW WORKSPACE FRAME ASSEMBLY ─── */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden relative bg-white">
        
        {/* ─── UNIFIED SIDEBAR (Dynamic Width Allocation) ─── */}
        <aside className={`
          fixed md:static inset-y-16 left-0 bg-white border-r border-gray-200 z-40 flex flex-col transition-all duration-300 ease-in-out h-full overflow-hidden
          ${menuOpen ? 'w-96 translate-x-0 shadow-2xl md:shadow-none' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 md:border-none'}
        `}>
          
          {/* Minimal Tab Switch Assembly */}
          <div className="p-4 border-b border-gray-100 flex gap-2 bg-white">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`flex-1 text-center py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'chapters' ? 'bg-black text-white shadow-xs' : 'bg-gray-50 text-gray-400 hover:text-black'
              }`}
            >
              Chapters
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 text-center py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'notes' ? 'bg-black text-white shadow-xs' : 'bg-gray-50 text-gray-400 hover:text-black'
              }`}
            >
              Notes & Codex
            </button>
          </div>

          {/* Dynamic Core Panel Window */}
          <div className="flex-1 overflow-y-auto h-full min-h-0">
            {activeTab === 'chapters' ? (
              <ManuscriptSidebar
                isOpen={true}
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
                isOpen={true}
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

        {/* Mobile Sidebar Close Backdrop Filter Overlay */}
        {menuOpen && (
          <div 
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/5 backdrop-blur-xs z-30 md:hidden transition-opacity" 
          />
        )}

        {/* ─── MAIN PROSE SHEET EDITOR CONTAINER ─── */}
        <main className="flex-1 bg-white flex flex-col overflow-y-auto px-6 py-8 md:p-12 lg:p-16 transition-all h-full">
          {canvasFocus === 'novel' ? (
            <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 space-y-8 animate-in fade-in duration-200">
              <PublishControls 
                mode="novel"
                status={globalStatus}
                onSave={() => handleUpdateGlobalNovel('Draft')}
                onPublish={() => handleUpdateGlobalNovel('Published')}
              />

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Story Title</label>
                  <input 
                    type="text"
                    value={globalTitle}
                    onChange={(e) => setGlobalTitle(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 font-bold text-sm focus:outline-black bg-white text-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Genre Category</label>
                  <input 
                    type="text"
                    value={globalGenre}
                    onChange={(e) => setGlobalGenre(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 font-bold text-sm focus:outline-black bg-white text-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Story Description</label>
                  <textarea 
                    value={globalSummary}
                    onChange={(e) => setGlobalSummary(e.target.value)}
                    className="w-full h-40 px-4 py-3.5 rounded-xl border border-gray-200 font-medium text-sm focus:outline-black resize-none leading-relaxed bg-white text-black"
                  />
                </div>
              </div>
            </div>
          ) : activeChapter ? (
            <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 space-y-6 animate-in fade-in duration-200">
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
                className="w-full flex-1 bg-transparent text-gray-900 leading-relaxed font-medium text-base placeholder:text-gray-300 resize-none focus:outline-none min-h-[350px]"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <button onClick={handleCreateChapter} className="bg-black text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
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