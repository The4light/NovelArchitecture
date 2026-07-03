import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { genreColors } from '../data/novel';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Genres = ["All Genres", "Action", "Romance", "Fantasy", "Mystery", "Scifi", "Thriller", "Historical"];

const ExplorePage = () => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState("Recent");

  const navigate = useNavigate();

  // Fetch only published novels from Supabase on mount
  useEffect(() => {
    const fetchPublishedNovels = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('novels')
          .select('*')
          .eq('status', 'Published'); // RLS handles the security, but explicitly filtering optimizes the request

        if (error) throw error;
        setNovels(data || []);
      } catch (err) {
        console.error("Error fetching live directory payload:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedNovels();
  }, []);

  // Filter logic covering both genre attributes and search parameters
  const filteredNovels = novels
    .filter(novel => activeGenre === "All Genres" || novel.genre.toLowerCase() === activeGenre.toLowerCase())
    .filter(novel => 
      novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (novel.synopsis && novel.synopsis.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (novel.description && novel.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Sorting logic execution
  const sortedNovels = [...filteredNovels].sort((a, b) => {
    if (sortBy === "Recent") {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === "Title") {
      return a.title.localeCompare(b.title);
    }
    return 0; // Fallback default
  });

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Novels</h1>
          <p className="text-gray-600">Discover your next favorite story</p>
        </div>

        {/* Search Input */}
        <div className="relative mb-8 max-w-xl">
          <input 
            type="text" 
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col gap-6 mb-10">
          {/* Genre Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg shrink-0">
               <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
               </svg>
            </div>
            {Genres.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                  activeGenre === genre 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900 shadow-sm'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Sort by:</span>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {["Recent", "Title"].map(option => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      sortBy === option ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {sortedNovels.length} novels found
            </div>
          </div>
        </div>

        {/* Dynamic State Feedback Renderer */}
        {loading ? (
          <div className="text-center text-xs font-black tracking-widest text-gray-400 py-20">
            SYNCING LIVE CATALOG STREAM...
          </div>
        ) : sortedNovels.length === 0 ? (
          <div className="text-center text-gray-400 font-medium py-20">
            No published manuscripts matching those attributes were discovered.
          </div>
        ) : (
          /* Novel Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {sortedNovels.map(novel => (
              <div key={novel.id} 
              key={novel.id} 
              onClick={() => navigate(`/read/${novel.id}`)} // ← Navigates to the details page
              className="cursor-pointer group"
              >
                <div className="relative overflow-hidden rounded-xl mb-3 bg-gray-100 aspect-[2/3] shadow-sm">
                  {/* Graceful fallback if no thumbnail column or image value exists */}
                  <img
                    src={novel.thumbnail_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000"}
                    alt={novel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 border ${genreColors[novel.genre] || 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                  {novel.genre.toUpperCase()}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors line-clamp-1">
                  {novel.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                  {novel.synopsis || novel.description || "No public overview descriptive data committed."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ExplorePage;