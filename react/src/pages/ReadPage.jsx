import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { novelsData, genreColors } from '../data/novel';

const ReadPage = () => {
  const { id } = useParams();
  const [isReading, setIsReading] = useState(false);

  const novel = novelsData.find(n => n.id === parseInt(id)) || novelsData[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, isReading]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {!isReading ? (
        /* --- ELEGANT BOOK LANDING STATE --- */
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
          {/* Refined Hero Section */}
          <header className="relative pt-16 pb-12 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
              
              {/* Massive Elegant Cover */}
              <div className="w-full md:w-[400px] shrink-0">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20">
                    <img 
                      src={novel.cover} 
                      alt={novel.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  </div>
                </div>
              </div>

              {/* Sophisticated Meta Data */}
              <div className="flex-1 text-center md:text-left">
                <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black tracking-[0.3em] uppercase mb-8 border-2 ${genreColors[novel.genre]}`}>
                  {novel.genre}
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
                  {novel.title}
                </h1>
                
                <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-100 p-0.5">
                    <img src="https://i.pravatar.cc/100?u=sarah" className="w-full h-full rounded-full object-cover" alt="" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Written By</p>
                    <Link to="/profile" className="text-sm font-black text-gray-900 hover:text-purple-600 transition-colors uppercase">
                      {novel.author}
                    </Link>
                  </div>
                </div>

                <p className="text-xl text-gray-500 leading-relaxed max-w-xl mb-10 font-medium italic">
                  "{novel.description}"
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><Icons.Book className="w-4 h-4"/> 12 Chapters</span>
                  <span className="flex items-center gap-2"><Icons.Eye className="w-4 h-4"/> {novel.views.toLocaleString()} Reads</span>
                </div>
              </div>
            </div>
          </header>

          {/* PREVIEW SECTION (The Teaser) */}
          <section className="max-w-3xl mx-auto px-4 py-20 relative">
            <div className="text-center mb-16">
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-purple-500 mb-4">First Look</h3>
              <div className="w-12 h-1 bg-black mx-auto rounded-full"></div>
            </div>

            {/* Faded Teaser Text */}
            <div className="relative">
              <div className="prose prose-xl prose-slate mx-auto text-gray-400 select-none pointer-events-none line-clamp-[6] leading-[2.2] font-serif italic">
                <p>
                  The air in the library was thick with the scent of old parchment and forgotten dreams. 
                  Elias traced his fingers along the leather-bound spines, feeling the hum of magic 
                  vibrating beneath his touch. He had spent years searching for this specific volume...
                  The legends said it contained the map to the Last Kingdom, a place where time stood 
                  still and the stars whispered the truth to those who dared to listen.
                </p>
              </div>
              
              {/* Elegant Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white flex items-end justify-center pb-4">
                <button 
                  onClick={() => setIsReading(true)}
                  className="group relative px-12 py-5 bg-black text-white rounded-2xl font-black text-sm tracking-[0.2em] shadow-2xl hover:bg-purple-700 transition-all active:scale-95 flex items-center gap-4"
                >
                  START READING
                  <Icons.TrendingUp className="w-4 h-4 rotate-90 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        
        /* --- FOCUSED READING MODE --- */
        <div className="animate-in slide-in-from-bottom-8 duration-700">
          <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <button 
                onClick={() => setIsReading(false)}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black flex items-center gap-2 group"
              >
                <Icons.Book className="w-4 h-4 group-hover:-rotate-12 transition-transform" /> 
                Exit Reader
              </button>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600">{novel.title}</span>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <Icons.Edit className="w-4 h-4 text-gray-300"/>
              </div>
            </div>
          </div>

          <main className="max-w-3xl mx-auto px-4 py-24">
            <article className="prose prose-2xl prose-slate mx-auto text-gray-800 font-serif leading-[2.4] tracking-tight">
              <div className="text-center mb-24">
                <h2 className="text-5xl font-black text-gray-900 mb-4 font-sans tracking-tighter">Chapter One</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
              </div>
              
              <p className="drop-cap text-gray-900">
                The air in the library was thick with the scent of old parchment and forgotten dreams. 
                Elias traced his fingers along the leather-bound spines, feeling the hum of magic 
                vibrating beneath his touch.
              </p>
              <p>
                He had spent years searching for this specific volume. The legends said it contained 
                the map to the Last Kingdom, a place where time stood still and the stars whispered 
                the truth to those who dared to listen.
              </p>
              <p>
                Every shadow in this room felt like it was holding its breath. Outside, the world was 
                changing, but here, between these shelves, the old laws still held weight.
              </p>
            </article>

            <div className="mt-32 pt-16 border-t border-gray-100 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Previous Chapter</p>
                <button className="text-sm font-bold text-gray-200 cursor-not-allowed uppercase">None</button>
              </div>
              <button className="bg-black hover:bg-purple-600 text-white px-12 py-4 rounded-2xl font-black text-xs tracking-widest flex items-center gap-3 transition-all shadow-xl">
                NEXT CHAPTER <Icons.TrendingUp className="w-4 h-4 rotate-90"/>
              </button>
            </div>
            {/* --- NEW COMMENT SECTION --- */}
        <section className="mt-32 bg-gray-50 rounded-[2rem] p-8 md:p-12">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Discussion</h3>
            <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-gray-400 border border-gray-100 uppercase tracking-widest">
              2 Comments
            </span>
          </div>

          {/* Comment Input */}
          <div className="flex gap-4 mb-12">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Icons.User className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <textarea 
                placeholder="What are your thoughts on this chapter?"
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none min-h-[100px]"
              ></textarea>
              <div className="mt-3 flex justify-end">
                <button className="bg-black text-white px-6 py-2 rounded-xl text-xs font-black tracking-widest hover:bg-purple-600 transition-colors">
                  POST COMMENT
                </button>
              </div>
            </div>
          </div>

          {/* Comment List */}
          <div className="space-y-8">
            {[
              { user: "Alex Rivers", date: "2 hours ago", text: "The way the magic system is described here is so unique. I didn't expect Elias to have that reaction to the book!" },
              { user: "Luna_Reads", date: "5 hours ago", text: "This cliffhanger is killing me! Can't wait for Chapter 2." }
            ].map((comment, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-gray-900">{comment.user}</span>
                    <span className="text-[10px] font-bold text-gray-300 uppercase">{comment.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {comment.text}
                  </p>
                  <div className="mt-3 flex gap-4">
                    <button className="text-[10px] font-black text-gray-400 hover:text-purple-600 uppercase tracking-widest transition-colors">Like</button>
                    <button className="text-[10px] font-black text-gray-400 hover:text-purple-600 uppercase tracking-widest transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
          </main>
        </div>
      )}
    </div>
  );
};

export default ReadPage;