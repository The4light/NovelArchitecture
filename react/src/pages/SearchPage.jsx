import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { novelsData } from '../data/novel';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [isLoading, setIsLoading] = useState(!!query);

  // Simulated API Delay for that "Professional" feel
useEffect(() => {
        
        if (!isLoading && query) {
            setIsLoading(true);
        }

        // Use the effect ONLY to schedule the "Stop Loading" event
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 400);

        return () => clearTimeout(timer);
        
        // We include isLoading in the dependency so the timer resets 
        // correctly if we manually toggle it.
        }, [query, isLoading]);

  const results = novelsData.filter(novel => 
    novel.title.toLowerCase().includes(query.toLowerCase()) ||
    novel.author.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Header with Meta Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-8 border-b border-gray-100">
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-purple-600 mb-4">Search Engine</h1>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
              {query ? `Results for "${query}"` : "All Archives"}
            </h2>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4 md:mt-0">
            {results.length} Matches found in 0.02s
          </p>
        </div>

        {isLoading ? (
          /* Professional Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-6">
                <div className="w-24 h-36 bg-gray-100 rounded-xl"></div>
                <div className="flex-1 space-y-4 py-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          /* Result List: Optimized for Reading Precision */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            {results.map((novel) => (
              <Link 
                to={`/read/${novel.id}`} 
                key={novel.id}
                className="group flex gap-6 p-4 rounded-3xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all"
              >
                <div className="w-28 shrink-0 shadow-xl rounded-xl overflow-hidden group-hover:-rotate-2 transition-transform">
                  <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">{novel.genre}</span>
                  <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{novel.title}</h3>
                  <p className="text-sm font-bold text-gray-400 mb-3">by {novel.author}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 italic font-medium">"{novel.description}"</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* High-End Empty State */
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
              <Icons.Edit className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No direct matches.</h3>
            <p className="text-gray-400 font-medium mb-10">Try a more general term or browse our curated genres.</p>
            <div className="flex justify-center gap-4">
              <Link to="/explore" className="px-8 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-600 transition-all">
                Browse Genres
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;