import React, { useState } from 'react';
import { novelsData, genreColors } from '../data/novel';
import Navbar from '../components/Navbar';

const Genres = ["All Genres", "Action", "Romance", "Fantasy", "Mystery", "Scifi", "Thriller", "Historical"];

const ExplorePage = () => {
  const [activeGenre, setActiveGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState("Popular");

  // Filter logic
  const filteredNovels = novelsData.filter(novel => 
    activeGenre === "All Genres" || novel.genre === activeGenre
  );

  return (
    <>
        <Navbar/>
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
          placeholder="Search by title or author..."
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
              {["Popular", "Recent", "Title"].map(option => (
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
            {filteredNovels.length} novels found
          </div>
        </div>
      </div>

      {/* Novel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {filteredNovels.map(novel => (
          <div key={novel.id} className="cursor-pointer group">
            <div className="relative overflow-hidden rounded-xl mb-3 bg-gray-100 aspect-[2/3] shadow-sm">
              <img
                src={novel.cover}
                alt={novel.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {novel.views.toLocaleString()}
              </div>
            </div>
            <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 border ${genreColors[novel.genre]}`}>
              {novel.genre.toUpperCase()}
            </div>
            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors line-clamp-1">
              {novel.title}
            </h3>
            <p className="text-xs text-gray-500 mb-2">by {novel.author}</p>
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {novel.description}
            </p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default ExplorePage;