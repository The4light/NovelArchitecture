import React, { useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const FloatingSticky = ({ note, setCodexEntries, spawnNewStickyNote }) => {
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // --- ENGINE DRAG HANDLERS ---
  const startNoteDrag = (e) => {
    isDragging.current = true;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    dragOffset.current = {
      x: clientX - note.position_x,
      y: clientY - note.position_y
    };

    document.addEventListener('mousemove', handleNoteDragging);
    document.addEventListener('mouseup', stopNoteDrag);
    document.addEventListener('touchmove', handleNoteDragging, { passive: false });
    document.addEventListener('touchend', stopNoteDrag);
  };

  const handleNoteDragging = (e) => {
    if (!isDragging.current) return;
    
    // Prevent screen bouncing on mobile webview drag
    if (e.type === 'touchmove') e.preventDefault();

    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    if (!clientX || !clientY) return;

    const newX = clientX - dragOffset.current.x;
    const newY = clientY - dragOffset.current.y;

    setCodexEntries(prev => prev.map(entry => 
      entry.id === note.id ? { ...entry, position_x: newX, position_y: newY } : entry
    ));
  };

  const stopNoteDrag = async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    document.removeEventListener('mousemove', handleNoteDragging);
    document.removeEventListener('mouseup', stopNoteDrag);
    document.removeEventListener('touchmove', handleNoteDragging);
    document.removeEventListener('touchend', stopNoteDrag);

    // Sync final coordinate values back to database vault
    await supabase.from('codex_entries').update({ 
      position_x: note.position_x, 
      position_y: note.position_y 
    }).eq('id', note.id);
  };

  // --- INLINE DATA UPDATES ---
  const handleTextChange = async (text) => {
    setCodexEntries(prev => prev.map(e => e.id === note.id ? { ...e, content: text } : e));
    await supabase.from('codex_entries').update({ content: text }).eq('id', note.id);
  };

  const handleTitleChange = async (title) => {
    setCodexEntries(prev => prev.map(e => e.id === note.id ? { ...e, title } : e));
    await supabase.from('codex_entries').update({ title }).eq('id', note.id);
  };

  const dockStickyBack = async () => {
    setCodexEntries(prev => prev.map(e => e.id === note.id ? { ...e, is_floating: false } : e));
    await supabase.from('codex_entries').update({ is_floating: false }).eq('id', note.id);
  };

  return (
    <div
      style={{ top: `${note.position_y}px`, left: `${note.position_x}px`, backgroundColor: note.bg_color }}
      className="absolute w-72 md:w-80 shadow-2xl rounded-2xl border border-black/10 overflow-hidden flex flex-col z-50 text-gray-900 animate-in zoom-in-95 duration-100 touch-none"
    >
      {/* Windows Style Drag Header Bar */}
      <div 
        onMouseDown={startNoteDrag}
        onTouchStart={startNoteDrag}
        className="h-9 bg-black/5 cursor-move flex items-center justify-between px-3 border-b border-black/5"
      >
        <button onClick={spawnNewStickyNote} className="text-lg font-bold opacity-60 hover:opacity-100 px-1">+</button>
        <span className="text-[9px] font-black tracking-widest uppercase opacity-40 select-none">Sticky Note</span>
        <button onClick={dockStickyBack} className="text-xs font-bold opacity-60 hover:opacity-100 px-1">✕</button>
      </div>

      {/* Writing Canvas */}
      <div className="p-4 flex-1 flex flex-col">
        <input 
          type="text" 
          value={note.title || ''} 
          onChange={(e) => handleTitleChange(e.target.value)}
          className="bg-transparent text-sm font-black border-none focus:outline-none w-full mb-2 tracking-tight"
          placeholder="Sticky Title"
        />
        <textarea
          value={note.content || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Jot down quick details..."
          className="bg-transparent text-xs font-medium border-none focus:outline-none w-full h-32 resize-none leading-relaxed placeholder:text-black/20"
        />
      </div>
    </div>
  );
};

export default FloatingSticky;