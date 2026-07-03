import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FloatingSticky from '../components/FloatingSticky';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

// Import our decoupled layout layers
import PublishControls from '../components/workspace/PublishControls';
import ManuscriptSidebar from '../components/workspace/ManuScriptSidebar';
import CodexSidebar from '../components/workspace/CodexSidebar';

const CreationWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  // Layout Controls
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [canvasFocus, setCanvasFocus] = useState('chapter'); // 'novel' or 'chapter'

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
      console.error("Global blueprint transmission failure:", err.message);
      alert(`Database Error: ${err.message}`);
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
      title: 'Sticky Scratchpad Idea',
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
    if (!window.confirm("Are you sure you want to permanently delete this entry from your vault?")) return;
    try {
      await supabase.from('codex_entries').delete().eq('id', entryId);
      setCodexEntries((prev) => prev.filter(item => item.id !== entryId));
    } catch (err) {
      console.error(err);
    }
  };

  if (pageLoading) return <div className="min-h-screen flex items-center justify-center bg-white text-xs font-black tracking-widest text-gray-400">LOADING HUB SYNC LAYER...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col h-screen overflow-hidden relative select-none">
      <Navbar />

      {/* Floating Notes Engine */}
      {codexEntries.filter(e => e.is_floating).map((note) => (
        <FloatingSticky
          key={note.id}
          note={note}
          codexEntries={codexEntries}
          setCodexEntries={setCodexEntries}
          spawnNewStickyNote={spawnNewStickyNote}
        />
      ))}

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* PANEL 1: MANUSCRIPT SEGMENTS LEFTSIDEBAR */}
        <ManuscriptSidebar
          isOpen={leftOpen}
          setIsOpen={setLeftOpen}
          novel={novel}
          chapters={chapters}
          activeChapter={activeChapter}
          canvasFocus={canvasFocus}
          setCanvasFocus={setCanvasFocus}
          onSelectChapter={(chap) => { selectChapter(chap); if(window.innerWidth < 768) setLeftOpen(false); }}
          onCreateChapter={handleCreateChapter}
          onBackToDashboard={() => navigate('/write')}
        />

        {/* PANEL 2: CANVAS EDITOR CORE */}
        <main className="flex-1 bg-white flex flex-col overflow-y-auto px-6 py-10 md:p-12 lg:p-16 transition-all">
          {canvasFocus === 'novel' ? (
            <div className="max-w-3xl w-full mx-auto flex flex-col flex-1 space-y-8 animate-in fade-in duration-200">
              <PublishControls 
                mode="novel"
                status={globalStatus}
                onSave={() => handleUpdateGlobalNovel('Draft')}
                onPublish={() => handleUpdateGlobalNovel('Published')}
              />

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Novel Title Registry</label>
                  <input 
                    type="text"
                    value={globalTitle}
                    onChange={(e) => setGlobalTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold text-base bg-gray-50/10 focus:outline-black placeholder:text-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Genre Matrix Attribute</label>
                  <input 
                    type="text"
                    value={globalGenre}
                    onChange={(e) => setGlobalGenre(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold text-base bg-gray-50/10 focus:outline-black placeholder:text-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Public Synoptic Narrative Context (Summary)</label>
                  <textarea 
                    value={globalSummary}
                    onChange={(e) => setGlobalSummary(e.target.value)}
                    className="w-full h-44 px-4 py-3 rounded-xl border border-gray-200 font-medium text-base bg-gray-50/10 focus:outline-black placeholder:text-gray-300 resize-none leading-relaxed"
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
                placeholder="Unleash structural narrative sequence descriptions here..."
                className="w-full flex-1 bg-transparent text-gray-800 leading-relaxed font-medium text-base md:text-lg placeholder:text-gray-300 resize-none focus:outline-none min-h-[400px]"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <button onClick={handleCreateChapter} className="bg-black text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-md">
                Initialize Content Stream
              </button>
            </div>
          )}
        </main>

        {/* PANEL 3: WORLD-BUILDING SYSTEM CODEX RIGHTSIDEBAR */}
        <CodexSidebar
          isOpen={rightOpen}
          setIsOpen={setRightOpen}
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

      </div>
    </div>
  );
};

export default CreationWorkspacePage;