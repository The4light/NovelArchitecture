import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { novelsData, genreColors } from '../data/novel';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState('reading');

  // For now, we'll just slice our mock data to simulate a personal collection
  const reading = novelsData.slice(0, 2);
  const saved = novelsData.slice(2, 5);

  const currentList = activeTab === 'reading' ? reading : saved;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">My Library</h1>
            <p className="text-gray-500 font-medium text-lg">Your personal collection of infinite worlds.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('reading')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reading' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Reading
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'saved' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Saved
            </button>
          </div>
        </div>

        {/* Library Grid */}
        {currentList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {currentList.map((novel) => (
              <div key={novel.id} className="group flex gap-6 p-4 rounded-[2rem] border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all duration-500">
                {/* Book Cover */}
                <Link to={`/read/${novel.id}`} className="w-32 shrink-0">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                    <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover" />
                  </div>
                </Link>

                {/* Book Info */}
                <div className="flex flex-col justify-center flex-1">
                  <div className={`inline-block w-fit px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mb-3 border ${genreColors[novel.genre]}`}>
                    {novel.genre}
                  </div>
                  <Link to={`/read/${novel.id}`}>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors leading-tight mb-2">
                      {novel.title}
                    </h3>
                  </Link>
                  <p className="text-sm font-bold text-gray-400 mb-4">by {novel.author}</p>
                  
                  {/* Progress Bar (Only for Reading tab) */}
                  {activeTab === 'reading' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-300">
                        <span>Progress</span>
                        <span>45%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="w-[45%] h-full bg-black rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Icons.Edit className="w-4 h-4 rotate-45" title="Remove" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.Book className="w-8 h-8 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Your shelf is empty</h3>
            <p className="text-gray-400 font-medium mb-8">Adventure is just a click away.</p>
            <Link to="/explore">
              <button className="bg-black text-white px-8 py-3 rounded-xl font-black text-xs tracking-widest uppercase hover:bg-purple-600 transition-all">
                Explore Stories
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default LibraryPage;