import React from 'react';
import { Link } from 'react-router-dom';
import { novelsData, genreColors } from '../data/novel';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';

const NovelCard = ({ novel }) => (
  <div className="group">
    {/* Link wrapped around the image area */}
    <Link to={`/read/${novel.id}`} className="block">
      <div className="relative overflow-hidden rounded-xl mb-3 bg-gray-100 shadow-sm aspect-[2/3]">
        <img
          src={novel.cover}
          alt={novel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] flex items-center gap-1 font-bold">
          <Icons.Eye className="w-3 h-3" />
          {novel.views.toLocaleString()}
        </div>
      </div>
    </Link>

    <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 border ${genreColors[novel.genre]}`}>
      {novel.genre.toUpperCase()}
    </div>
    
    {/* Link wrapped around the title */}
    <Link to={`/read/${novel.id}`}>
      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors line-clamp-1">
        {novel.title}
      </h3>
    </Link>

    <p className="text-xs text-gray-500 mb-2 font-medium">by {novel.author}</p>
    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{novel.description}</p>
  </div>
);

const FeaturedSection = () => {
  const featured = novelsData[2]; // The Last Kingdom of Shadows
  return (
    <div className="relative bg-gradient-to-br from-gray-50 via-purple-50/40 to-white py-12 lg:py-20 overflow-hidden border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-white rounded-full shadow-sm border border-purple-100">
              <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">Featured Story</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 text-[10px] font-bold">{featured.genre.toUpperCase()}</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-6 text-gray-900 leading-tight">
              {featured.title}
            </h1>
            <p className="text-gray-600 mb-8 text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {featured.description}
            </p>
            <div className="flex gap-4 justify-center lg:justify-start">
              <Link to={`/read/${featured.id}`}>
                <button className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95">
                  <Icons.Book className="w-5 h-5" />
                  Start Reading
                </button>
              </Link>
              <button className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
                Add to Library
              </button>
            </div>
          </div>
          <Link to={`/read/${featured.id}`} className="relative group">
            <div className="absolute -inset-4 bg-purple-500/10 rounded-[2rem] blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
            <img
              src={featured.cover}
              alt={featured.title}
              className="w-64 lg:w-[400px] rounded-2xl shadow-2xl relative z-10 transform lg:rotate-2 group-hover:rotate-0 transition-transform duration-500"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const trending = novelsData.slice(0, 4);
  const recent = novelsData.slice(4, 8);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <FeaturedSection />
      
      {/* Trending Now */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
              <Icons.TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">Trending Now</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trending.map(novel => <NovelCard key={novel.id} novel={novel} />)}
        </div>
      </div>

      {/* Recently Published */}
      <div className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <Icons.Clock className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">Recently Published</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recent.map(novel => <NovelCard key={novel.id} novel={novel} />)}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-black rounded-[2.5rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex justify-center mb-8 opacity-50">
              {/* Using TrendingUp as a star-like icon or generic spark */}
              <Icons.Edit className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">Your Story Starts Here</h2>
            <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto font-medium">
              Join a global community of writers and readers. Turn your imagination into a masterpiece.
            </p>
            <Link to="/write">
              <button className="bg-white text-black px-10 py-4 rounded-xl font-black text-lg hover:bg-gray-100 transition-all active:scale-95 shadow-xl">
                Start Writing Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;