import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { genreColors } from '../data/novel';
import Navbar from '../components/Navbar';

const Genres = ["All Genres", "Action", "Romance", "Fantasy", "Mystery", "Scifi", "Thriller", "Historical"];

const ExplorePage = () => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState("Popular");
  const [loading, setLoading] = useState(true);

  // Synchronize live system entries from Supabase
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('novels')
          .select('*')
          .eq('status', 'Published');

        if (error) throw error;
        setNovels(data || []);
      } catch (err) {
        console.error("Catalog stream synchronization failure:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  // Multi-tier search and genre configuration metrics matrix
  const filteredNovels = novels.filter(novel => {
    const matchesGenre = activeGenre === "All Genres" || novel.genre === activeGenre;
    const cleanQuery = searchQuery.toLowerCase().trim();
    const matchesSearch = !cleanQuery || 
      novel.title?.toLowerCase().includes(cleanQuery) || 
      novel.author_name?.toLowerCase().includes(cleanQuery);
    
    return matchesGenre && matchesSearch;
  });

  // Structural sorting algorithm deck execution
  const sortedNovels = [...filteredNovels].sort((a, b) => {
    if (sortBy === "Recent") {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
    if (sortBy === "Title") {
      return (a.title || "").localeCompare(b.title || "");
    }
    // Default: Popular sort algorithm tracking metrics mapping
    return (b.views || 0) - (a.views || 0);
  });

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-24 sm:pt-28 pb-20 selection:bg-purple-600 selection:text-white antialiased bg-white min-h-screen">
        
        {/* Typographic Hero Deck Header */}
        <div className="mb-12 space-y-2">
          <span className="text-[10px] font-black uppercase text-purple-600 tracking-[0.3em]">System Archive</span>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter sm:text-6xl">Explore Masterpieces</h1>
          <p className="text-gray-400 text-sm font-medium">Scan and discover the latest node transmissions.</p>
        </div>

        {/* High Fidelity Search Module */}
        <div className="relative mb-10 max-w-2xl">
          <input 
            type="text" 
            placeholder="Search by title, author, or logs tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-5 py-4.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-600 focus:bg-white text-sm font-medium tracking-wide transition-all shadow-[0_4px_20px_rgba(0,0,0,0.01)] placeholder:text-gray-300"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters Matrix Module */}
        <div className="flex flex-col gap-6 mb-12 border-b border-gray-100 pb-8">
          {/* Genre Scrollable Filter Bar Container */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 no-scrollbar scroll-smooth">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl shrink-0">
               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
               </svg>
            </div>
            {Genres.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                  activeGenre === genre 
                    ? 'bg-black text-white border-black shadow-md shadow-black/5' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-900 shadow-sm'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Sort Metrics Selector Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Sort Matrix:</span>
              <div className="flex bg-gray-50 border border-gray-100 p-1 rounded-xl">
                {["Popular", "Recent", "Title"].map(option => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                      sortBy === option ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-purple-600 bg-purple-50/60 px-3.5 py-1.5 rounded-lg border border-purple-100">
              {sortedNovels.length} Masterpieces Active
            </div>
          </div>
        </div>

        {/* Catalog Vault Rendering Workspace Grid */}
        {loading ? (
          <div className="text-center font-black tracking-[0.3em] text-xs py-24 text-purple-500">
            STREAMING REGISTERED BLOCKS...
          </div>
        ) : sortedNovels.length === 0 ? (
          <div className="text-center py-24 border border-dashed rounded-[32px] bg-gray-50/20 border-gray-200">
            <p className="text-sm font-medium text-gray-400 italic">No published items trackable within matching filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {sortedNovels.map(novel => (
              <div 
                key={novel.id} // ✅ FIXED: One absolute unique structural key attribute
                onClick={() => navigate(`/read/${novel.id}`)}
                className="cursor-pointer group flex flex-col space-y-4"
              >
                {/* Visual Aspect Ratio Image Container */}
                <div className="relative overflow-hidden rounded-[20px] bg-gray-950 aspect-[2/3] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 group-hover:border-purple-500/30 transition-all duration-500">
                  <img
                    src={novel.thumbnail_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000"}
                    alt={novel.title}
                    className="w-full h-full object-cover scale-100 group-hover:scale-105 grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 ease-out"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl text-[9px] font-black tracking-widest flex items-center gap-1.5 shadow-xl border border-white/10">
                    <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{(novel.views || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Metadata Tracking Matrix */}
                <div className="space-y-1.5 px-1">
                  <div className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border ${genreColors[novel.genre] || 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                    {novel.genre}
                  </div>
                  <h3 className="font-black text-gray-900 text-base group-hover:text-purple-700 transition-colors line-clamp-1 tracking-tight">
                    {novel.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">by {novel.author_name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium pt-1">
                    {novel.synopsis || novel.description || 'No summary canvas data committed to database.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ExplorePage;