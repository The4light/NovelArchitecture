import React from 'react';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { novelsData, genreColors } from '../data/novel';

const ProfilePage = () => {
  // Filtering for Sarah Mitchell as per the design reference
  const authorNovels = novelsData.filter(n => n.author === "Sarah Mitchell");

  const authorStats = [
    { label: 'novels', value: '2', icon: <Icons.Book className="w-4 h-4" /> },
    { label: 'chapters', value: '12', icon: <Icons.Edit className="w-4 h-4" /> },
    { label: 'total views', value: '26,620', icon: <Icons.Eye className="w-4 h-4" /> },
    { label: 'Joined January 2023', value: '', icon: <Icons.Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-24 sm:pt-28 pb:20">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Avatar with Shadow */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" 
                alt="Sarah Mitchell" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Author Details */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">
              Sarah Mitchell
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mb-8 leading-relaxed">
              Fantasy author with a passion for creating immersive worlds. Published 12 novels.
            </p>

            {/* Stats Grid - Using the New Icons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 mb-8">
              {authorStats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <div className="text-gray-400 group-hover:text-black transition-colors">
                    {stat.icon}
                  </div>
                  <div className="flex gap-1.5 text-sm font-bold">
                    {stat.value && <span className="text-gray-900">{stat.value}</span>}
                    <span className="text-gray-500 font-medium lowercase">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visitor Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <button className="px-10 py-2.5 border border-gray-200 rounded-xl text-sm font-bold hover:bg-black hover:text-white transition-all active:scale-95 shadow-sm">
                Follow
              </button>
              <button className="px-10 py-2.5 border border-gray-200 rounded-xl text-sm font-bold hover:bg-black hover:text-white transition-all active:scale-95 shadow-sm">
                Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center gap-3 mb-12">
          <h2 className="text-3xl font-black text-gray-900">Published Novels</h2>
          <div className="h-px flex-1 bg-gray-100 mt-2"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {authorNovels.map((novel) => (
            <div key={novel.id} className="group cursor-pointer">
              {/* Novel Cover with Purple Border Accent */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-5 shadow-md border-b-4 border-purple-500/0 group-hover:border-purple-500 transition-all duration-300">
                <img 
                  src={novel.cover} 
                  alt={novel.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <Icons.Eye className="w-3.5 h-3.5" />
                  {novel.views.toLocaleString()}
                </div>
              </div>
              
              <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest mb-3 border ${genreColors[novel.genre]}`}>
                {novel.genre.toUpperCase()}
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {novel.title}
              </h3>
              
              <p className="text-sm font-bold text-gray-400 mb-3">
                by {novel.author}
              </p>
              
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
                {novel.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;