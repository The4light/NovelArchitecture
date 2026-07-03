import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ImageUpload from '../components/ImageUpload';
import Icons from '../components/Icons'

const PublishStoryPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSavePipeline = async (targetStatus) => {
    if (!title.trim()) return alert("Your masterpiece needs a title.");
    setSaving(true);

    const payload = {
      user_id: user?.id,
      title,
      summary,
      content,
      thumbnail_url: thumbnailUrl,
      status: targetStatus,
      author_name: user?.user_metadata?.full_name || 'Anonymous Creator'
    };

    try {
      // Direct insertion hook into your modified database table
      const { error } = await supabase.from('codex_entries').insert([payload]);
      if (error) throw error;
      
      navigate('/'); // Bounce straight back to the central home feed view
    } catch (err) {
      console.error("Publishing pipeline broken:", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900 selection:bg-purple-100">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Focus: Manuscript Inputs */}
        <div className="md:col-span-2 space-y-6">
          <input 
            type="text"
            placeholder="Title your story..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-black tracking-tight border-none focus:outline-none placeholder:text-gray-200"
          />
          
          <input 
            type="text"
            placeholder="Add a brief summary sentence..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full text-sm font-medium border-none focus:outline-none placeholder:text-gray-300 text-gray-500"
          />

          <textarea 
            placeholder="Unleash your narrative stream..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 text-base font-medium border-none focus:outline-none placeholder:text-gray-200 resize-none leading-relaxed"
          />
        </div>

        {/* Right Focus: Cloudinary Meta Settings Controls */}
        <div className="space-y-6 bg-gray-50/30 p-6 rounded-3xl border border-gray-100 h-fit">
          <ImageUpload 
            currentImageUrl={thumbnailUrl} 
            onUploadSuccess={(url) => setThumbnailUrl(url)} 
          />

          <hr className="border-gray-100" />

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSavePipeline('Draft')}
              disabled={saving}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 animate-in fade-in duration-200"
            >
              <FileText size={12} />
              Save as Draft
            </button>
            
            <button
              onClick={() => handleSavePipeline('Published')}
              disabled={saving}
              className="w-full py-3 bg-black hover:bg-purple-600 text-white rounded-xl font-black text-[10px] tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Globe size={12} />
              {saving ? 'Syncing...' : 'Publish Live Feed'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublishStoryPage;