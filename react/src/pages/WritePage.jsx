import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';

/* --- COMPONENT 1: THE LANDING PAGE (Not Logged In) --- */
const WriteLanding = ({ onJoin }) => (
  <div className="animate-in fade-in duration-700">
    <header className="relative pt-20 pb-32 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
          The Future of Storytelling
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-8">
          Your story <br /> starts <span className="text-purple-600 italic font-serif">here.</span>
        </h1>
        <p className="max-w-xl mx-auto text-xl text-gray-500 font-medium mb-12">
          Join a global community of creators. Write, publish, and grow your audience with NovelForge.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onJoin}
            className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-purple-700 transition-all shadow-2xl active:scale-95"
          >
            Start Writing for Free
          </button>
          <button className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-gray-50 transition-all">
            Browse Guide
          </button>
        </div>
      </div>
      
      {/* Decorative Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-50/50 rounded-full blur-3xl -z-0"></div>
    </header>

    <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { title: "Ownership", desc: "You keep 100% of the rights to your work.", icon: <Icons.Book /> },
          { title: "Analytics", desc: "Track your readers in real-time.", icon: <Icons.TrendingUp /> },
          { title: "Community", desc: "Direct feedback from a passionate audience.", icon: <Icons.User /> }
        ].map((feature, i) => (
          <div key={i} className="space-y-4 text-center md:text-left">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black mx-auto md:mx-0">
              {feature.icon}
            </div>
            <h3 className="text-xl font-black tracking-tight">{feature.title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

/* --- COMPONENT 2: THE STUDIO DASHBOARD (Logged In) --- */
const WriterStudio = () => {
  const myNovels = [
    { id: 1, title: "The Last Aethelgard", status: "Published", chapters: 12, views: 1420 },
    { id: 2, title: "Shadows of Tokyo", status: "Draft", chapters: 3, views: 0 },
  ];

  return (
    <div className="animate-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Writer Studio</h1>
          <p className="text-gray-500 font-medium">Welcome back, Pen Name.</p>
        </div>
        <button className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-purple-600 transition-all shadow-xl active:scale-95">
          <Icons.Edit className="w-4 h-4" />
          Create New Story
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Reads</p>
          <p className="text-3xl font-black text-gray-900">4.5k</p>
        </div>
        {/* Add more stats as needed */}
      </div>

      <div className="space-y-6">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Active Manuscripts</h3>
        {myNovels.map((novel) => (
          <div key={novel.id} className="group flex items-center justify-between p-6 rounded-3xl border border-gray-100 hover:border-black transition-all">
            <div className="flex items-center gap-6">
              <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                 <Icons.Book className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 group-hover:text-purple-600 transition-colors">{novel.title}</h4>
                <div className="flex gap-4 mt-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400">{novel.chapters} Chapters</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${novel.status === 'Published' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {novel.status}
                  </span>
                </div>
              </div>
            </div>
            <button className="p-4 rounded-xl bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all">
              <Icons.Edit className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --- MAIN PAGE LOGIC --- */
const WritePage = () => {
  const navigate = useNavigate();
  // IMPORTANT: For now, manually toggle this to 'true' to see the dashboard
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {isLoggedIn ? (
        <WriterStudio />
      ) : (
        <WriteLanding onJoin={() => navigate('/auth')} />
      )}
    </div>
  );
};

export default WritePage;