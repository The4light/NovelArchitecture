import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import NovelCard from '../components/NovelCard';
// ==========================================
// TYPOGRAPHY STACK
// ==========================================
const gothicFont = '"Cinzel Decorative", "Cinzel", "Playfair Display", Georgia, serif';
const sansFont = '"Plus Jakarta Sans", "Inter", system-ui, sans-serif';
const EASE = [0.22, 1, 0.36, 1];

// ==========================================
// LINE-ART BUTTERFLY — drawn in the same stroke
// language as lucide (no butterfly glyph exists there),
// so the decorative motif stays on-brand with the icon set.
// ==========================================
const ButterflyGlyph = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M12 7.2v10.3" />
    <path d="M12 7.2c0-1.4-.5-2.4-1.3-3.1" />
    <path d="M12 7.2c0-1.4.5-2.4 1.3-3.1" />
    <path d="M11 8c-1.6-2.5-4.4-4.4-6.7-3.7-1.7.5-2.2 2.6-1.2 4.7 1.2 2.5 4 3.7 6.8 3.1" />
    <path d="M13 8c1.6-2.5 4.4-4.4 6.7-3.7 1.7.5 2.2 2.6 1.2 4.7-1.2 2.5-4 3.7-6.8 3.1" />
    <path d="M10.3 13c-2.3 1-3.9 3.3-3.5 5.6.3 1.6 2.2 2 3.6.9 1.8-1.3 2.5-3.6 2.2-5.7" />
    <path d="M13.7 13c2.3 1 3.9 3.3 3.5 5.6-.3 1.6-2.2 2-3.6.9-1.8-1.3-2.5-3.6-2.2-5.7" />
  </svg>
);

// Gentle, staggered drift — never more than a few degrees of rotation,
// so it reads as "alive" rather than distracting.
const drift = (delay = 0, distance = 8, duration = 6) => ({
  animate: {
    y: [0, -distance, 0],
    rotate: [0, 4, -2, 0],
    opacity: [0.5, 0.85, 0.5],
  },
  transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
});

const FloatingButterflies = ({ variant = 'default' }) => {
  const clusters = {
    default: [
      { top: '10%', right: '8%', size: 22, color: '#F59E0B', delay: 0, dur: 6 },
      { top: '22%', right: '18%', size: 13, color: '#A855F7', delay: 1.1, dur: 7.5 },
      { bottom: '16%', left: '6%', size: 18, color: '#A855F7', delay: 0.4, dur: 5.5 },
      { bottom: '30%', left: '15%', size: 11, color: '#F59E0B', delay: 1.8, dur: 8 },
      { top: '45%', left: '3%', size: 9, color: '#F59E0B', delay: 2.4, dur: 6.5 },
    ],
    edge: [
      { top: '12%', right: '4%', size: 16, color: '#A855F7', delay: 0.2, dur: 6.5 },
      { bottom: '18%', right: '10%', size: 12, color: '#F59E0B', delay: 1.4, dur: 5.8 },
      { top: '55%', left: '4%', size: 14, color: '#F59E0B', delay: 0.8, dur: 7 },
    ],
  };

  return (
    <>
      {clusters[variant].map((b, i) => (
        <motion.span
          key={i}
          {...drift(b.delay, 9, b.dur)}
          className="absolute pointer-events-none select-none z-20"
          style={{
            top: b.top,
            bottom: b.bottom,
            left: b.left,
            right: b.right,
            color: b.color,
            filter: `drop-shadow(0 0 6px ${b.color}55)`,
          }}
        >
          <ButterflyGlyph style={{ width: b.size, height: b.size }} />
        </motion.span>
      ))}
    </>
  );
};

// ==========================================
// PAINT — soft white splashes, like a brush was
// flicked across the dark canvas. Pure ambience,
// never claims attention from content.
// ==========================================
const PaintSplash = ({ top, left, right, bottom, size = 420, opacity = 0.07 }) => (
  <div
    aria-hidden
    className="absolute pointer-events-none rounded-full"
    style={{
      top,
      left,
      right,
      bottom,
      width: size,
      height: size,
      background: `radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, transparent 72%)`,
      filter: 'blur(10px)',
    }}
  />
);

// ==========================================
// NOVEL CARD — let loose from its box. Image
// leads, everything else breathes underneath it.
// ==========================================

// const NovelCard = ({ novel }) => {
//   const navigate = useNavigate();
//   const authorProfile = novel.profiles;

//   return (
//     <motion.div
//       variants={cardRise}
//       onClick={() => navigate(`/read/${novel.id}`)}
//       whileHover={{ y: -10 }}
//       transition={{ type: 'spring', stiffness: 260, damping: 22 }}
//       className="group cursor-pointer flex flex-col"
//       style={{ fontFamily: sansFont }}
//     >
//       <div className="relative overflow-hidden rounded-2xl bg-[#0B1120] aspect-[3/4] shadow-lg shadow-black/20 group-hover:shadow-2xl group-hover:shadow-[#F59E0B]/10 transition-shadow duration-500">
//         <motion.img
//           src={novel.thumbnail_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600'}
//           alt={novel.title}
//           className="w-full h-full object-cover"
//           whileHover={{ scale: 1.06 }}
//           transition={{ duration: 0.7, ease: EASE }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//         <div className="absolute top-3 right-3 bg-[#0B1120]/85 backdrop-blur-md px-2 py-0.5 rounded border border-[#F59E0B]/30 text-[#F59E0B] text-[8px] font-bold tracking-[0.15em] uppercase">
//           {novel.status || 'LIVE'}
//         </div>
//       </div>

//       <div className="pt-4 space-y-1.5">
//         <span className="inline-block text-[8px] font-extrabold tracking-widest text-[#A855F7] uppercase">
//           {novel.genre}
//         </span>
//         <h4 className="font-semibold text-[#E5E7EB] text-sm group-hover:text-[#F59E0B] transition-colors line-clamp-1 capitalize tracking-tight">
//           {novel.title}
//         </h4>
//         <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed font-normal">
//           {novel.synopsis || novel.description || 'No summary available yet.'}
//         </p>

//         <div
//           onClick={(e) => {
//             e.stopPropagation();
//             if (authorProfile?.username) navigate(`/profile/${authorProfile.username}`);
//           }}
//           className="flex items-center gap-2 pt-3 mt-2 border-t border-white/5 group/auth w-fit"
//         >
//           <img
//             src={authorProfile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + novel.user_id}
//             className="w-4 h-4 rounded-full ring-1 ring-white/10"
//             alt=""
//           />
//           <span className="text-[11px] text-gray-500 group-hover/auth:text-white transition-colors">
//             {authorProfile?.display_name || 'Anonymous'}
//           </span>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

const CardGrid = ({ novels }) => (
  <motion.div
    variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.15 }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16"
    style={{ fontFamily: '"JetBrains Mono", monospace' }}
  >
    {novels.map((novel) => (
      <NovelCard key={novel.id} novel={novel} />
    ))}
  </motion.div>
);

// ==========================================
// HERO CAROUSEL
// ==========================================
const HeroCarousel = ({ novels }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (novels.length === 0) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % novels.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [novels]);

  if (novels.length === 0) return null;
  const activeNovel = novels[activeIndex];
  const authorProfile = activeNovel.profiles;

  return (
    <div className="relative w-full min-h-[100vh] bg-[#0B1120] overflow-hidden flex items-center border-b border-[#1E294B]">
      <FloatingButterflies variant="default" />
      <PaintSplash top="-8%" left="12%" size={520} opacity={0.06} />
      <PaintSplash bottom="0%" right="20%" size={360} opacity={0.05} />

    <div className="absolute inset-0 h-full pointer-events-none z-0">  
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/75 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent z-10" />
        <AnimatePresence mode="wait">
          <motion.img
            key={activeNovel.id}
            src={activeNovel.thumbnail_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1200'}
            alt=""
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="w-full h-full object-cover opacity-40 lg:opacity-60 object-center"
          />
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-24 pb-16">
        <div className="lg:col-span-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNovel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-[#0E1424]/90 border border-[#1E294B] px-3 py-1 rounded-md w-fit">
                <span className="text-[#F59E0B] text-[9px] font-bold tracking-[0.25em] uppercase" style={{ fontFamily: sansFont }}>
                  Spotlight Chrono
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-[#A855F7] text-[9px] font-bold tracking-widest uppercase" style={{ fontFamily: sansFont }}>
                  {activeNovel.genre}
                </span>
              </div>

              <h1
                className="text-4xl sm:text-6xl lg:text-7xl font-normal text-[#F3F4F6] tracking-tight leading-[1.1] capitalize select-none"
                style={{ fontFamily: gothicFont }}
              >
                {activeNovel.title}
              </h1>

              <p className="text-gray-400 text-sm sm:text-base max-w-xl font-medium leading-relaxed font-serif italic">
                "{activeNovel.synopsis || activeNovel.description || 'No description available for this title yet.'}"
              </p>

              <div
                onClick={() => authorProfile?.username && navigate(`/profile/${authorProfile.username}`)}
                className="flex items-center gap-3 w-fit cursor-pointer group/heroAuth"
                style={{ fontFamily: sansFont }}
              >
                <img
                  src={authorProfile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + activeNovel.user_id}
                  className="w-5 h-5 rounded-full ring-1 ring-[#F59E0B]/30"
                  alt=""
                />
                <span className="text-xs text-gray-500 group-hover/heroAuth:text-white transition-colors">
                  Penned by <span className="text-[#F3F4F6] font-medium tracking-wide">{authorProfile?.display_name || 'Anonymous'}</span>
                </span>
              </div>

              <div className="pt-4 flex items-center gap-6" style={{ fontFamily: sansFont }}>
                <Link to={`/read/${activeNovel.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-[#F59E0B] text-black px-8 py-3.5 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors duration-300 shadow-xl shadow-[#F59E0B]/10"
                  >
                    Start Reading
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1E294B] z-20 flex">
        {novels.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className="flex-1 h-full cursor-pointer relative border-r border-[#0B1120] last:border-0"
          >
            {activeIndex === idx && (
              <div
                key={activeIndex}
                className="absolute top-0 left-0 h-full bg-[#F59E0B] animate-carousel-progress"
                style={{ animationDuration: '5000ms', animationTimingFunction: 'linear', fillMode: 'forwards' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Real splatter art. mix-blend-screen keeps the colors vivid while
// letting them melt into the dark background with no visible edge
// from the background removal. Drop-shadow adds a soft color glow
// so it reads as light hitting the canvas, not a sticker on top of it.
const Splatter = ({ src, className, size = 520, opacity = 1, glow, flip = false, duration = 11 }) => (
  <motion.img
    src={src}
    alt=""
    aria-hidden
    className={`absolute pointer-events-none select-none z-0 mix-blend-screen ${className}`}
    style={{
      width: size,
      opacity,
      transform: flip ? 'scaleX(-1)' : undefined,
      filter: glow ? `drop-shadow(0 0 40px ${glow})` : undefined,
    }}
    animate={{ scale: [1, 1.04, 1], rotate: flip ? [0, -3, 0] : [0, 3, 0] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const EditorialVisionSection = () => (
  <section className="bg-[#080C16] border-b border-[#1E294B] py-32 relative overflow-hidden">
    <Splatter
      src="/SplatterTwo.png"
      className="-top-[12%] -right-[6%]"
      size={620}
      opacity={0.85}
      glow="rgba(232,60,140,0.35)"
      duration={12}
    />
    <Splatter
      src="/SplatterOne.png"
      className="-bottom-[18%] -left-[10%]"
      size={460}
      opacity={0.35}
      flip
      duration={9}
    />

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10"
    >
      <div className="lg:col-span-5 space-y-6 text-left" style={{ fontFamily: sansFont }}>
        <div className="inline-flex px-2 py-0.5 bg-[#A855F7]/10 border border-[#A855F7]/30 rounded text-[#A855F7] text-[9px] font-bold tracking-widest uppercase">
          Platform Engine Forge
        </div>
        <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-[#F3F4F6] leading-[1.15]" style={{ fontFamily: gothicFont }}>
          Dive Deep Into <span className="text-[#A855F7]">Recent</span> Fantasies
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed font-normal">
          Command infinite dynamic manuscripts. Our systemic design pipeline bridges pristine writing engines directly with readers looking for their next escape.
        </p>
        <div className="pt-4">
          <Link to="/explore" className="group inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#F59E0B] hover:text-white transition-colors">
            Explore Compilations
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="lg:col-span-7 relative flex justify-center items-center">
        <div className="absolute w-[80%] h-[80%] bg-[#A855F7]/5 blur-[120px] rounded-full pointer-events-none" />
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[#1E294B] bg-[#0B1120] shadow-[0_30px_60px_rgba(0,0,0,0.6)] group"
        >
          <img
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200"
            alt="Fantasy backdrop"
            className="w-full h-full object-cover object-center grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-transparent to-transparent opacity-80" />

          <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-[#0B1120]/90 backdrop-blur-md border border-[#1E294B] px-4 py-2.5 rounded-xl shadow-lg">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <div>
              <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">AI Studio Grid</p>
              <p className="text-xs font-semibold text-[#F3F4F6]" style={{ fontFamily: sansFont }}>
                Answering your creative passions
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  </section>
);

// ==========================================
// SECTION HEADER — shared motion wrapper
// ==========================================
const SectionHeader = ({ eyebrow, title, action, actionLabel, gothic }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.6, ease: EASE }}
    className="flex items-end justify-between mb-14 border-b border-[#1E294B] pb-6"
  >
    <div>
      <span className="text-[10px] font-extrabold text-[#F59E0B] tracking-[0.2em] uppercase" style={{ fontFamily: sansFont }}>
        {eyebrow}
      </span>
      <h2
        className={gothic ? 'text-2xl font-normal text-[#F3F4F6] mt-1' : 'text-lg font-medium tracking-widest text-[#F3F4F6] uppercase mt-1'}
        style={{ fontFamily: gothic ? gothicFont : sansFont }}
      >
        {title}
      </h2>
    </div>
    {action && (
      <Link to={action} className="text-xs font-semibold tracking-wide text-gray-500 hover:text-[#F59E0B] transition-colors flex items-center gap-1.5" style={{ fontFamily: sansFont }}>
        {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    )}
  </motion.div>
);

// ==========================================
// MAIN HOMEPAGE
// ==========================================
const HomePage = () => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveDirectory = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('novels')
          .select(`
            *,
            profiles:user_id (
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('status', 'Published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNovels(data || []);
      } catch (err) {
        console.error('Catalog sync error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveDirectory();
  }, []);

  const topCarouselNovels = novels.slice(0, 5);
  const trendingNovels = novels.slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center gap-3" style={{ fontFamily: sansFont }}>
        <motion.div
          className="w-5 h-5 border-2 border-[#1E294B] border-t-[#F59E0B] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        />
        <span className="text-[9px] font-bold tracking-[0.25em] text-[#F59E0B]">SYNCHRONIZING SCROLL MATRIX</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#E5E7EB] antialiased selection:bg-[#F59E0B] selection:text-black">
      <style>{`
        @keyframes carouselProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-carousel-progress {
          animation-name: carouselProgress;
        }
      `}</style>

      <Navbar />

      <HeroCarousel novels={topCarouselNovels} />

      {/* TRENDING */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-32 relative">
        <PaintSplash top="0%" left="-4%" size={340} opacity={0.05} />
        <SectionHeader eyebrow="CURRENT DIRECTORY" title="Trending Novels" action="/explore" actionLabel="View Catalog" />

        {trendingNovels.length === 0 ? (
          <div className="text-center font-normal py-16 text-gray-500 border border-dashed border-[#1E294B] rounded-2xl bg-[#0E1424]/40" style={{ fontFamily: sansFont }}>
            No live catalog files loaded yet.
          </div>
        ) : (
          <CardGrid novels={trendingNovels} />
        )}
      </section>

      <EditorialVisionSection />

      {/* RECENTLY TRANSMITTED */}
      <section className="bg-[#0E1424]/30 border-t border-b border-[#1E294B] py-32 relative overflow-hidden">
        <FloatingButterflies variant="edge" />
        <PaintSplash bottom="-6%" right="8%" size={400} opacity={0.05} />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          <SectionHeader eyebrow="CHRONO ARCHIVE FEED" title="Recently Transmitted Scrolls" gothic />

          {novels.length === 0 ? (
            <p className="text-sm font-normal text-gray-500 italic text-center">Nothing in the feed yet.</p>
          ) : (
            <CardGrid novels={novels.slice(0, 4)} />
          )}
        </div>
      </section>

      {/* AI + NEWS */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ fontFamily: sansFont }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE }}
            whileHover={{ y: -6 }}
            className="bg-gradient-to-br from-[#0E1424] to-[#080C16] border border-[#1E294B] rounded-2xl p-8 lg:p-12 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/5 rounded-full blur-2xl group-hover:bg-[#F59E0B]/10 transition-all pointer-events-none" />
            <div className="space-y-4">
              <span className="text-[9px] font-bold text-[#F59E0B] tracking-[0.25em] uppercase">INTELLIGENT WORKSPACE</span>
              <h4 className="text-2xl font-semibold text-white tracking-tight">AI Copilot Engine</h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Stuck at a blank page? Expand outlines, rewrite dialogue, and polish drafts with premium models built right into your editor.
              </p>
              <div className="pt-4">
                <Link to="/write">
                  <button className="bg-white text-black hover:bg-[#F59E0B] px-6 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors shadow-lg active:scale-95">
                    Launch Engine
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="bg-gradient-to-br from-[#0E1424] to-[#080C16] border border-[#1E294B] rounded-2xl p-8 lg:p-12 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A855F7]/5 rounded-full blur-2xl group-hover:bg-[#A855F7]/10 transition-all pointer-events-none" />
            <div className="space-y-4">
              <span className="text-[9px] font-bold text-[#A855F7] tracking-[0.25em] uppercase">TRANSMISSION LOGGER</span>
              <h4 className="text-2xl font-semibold text-white tracking-tight">Global News Center</h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Track platform updates, feature releases, and upcoming community events inside our developer feed.
              </p>
              <div className="pt-4">
                <Link to="/explore">
                  <button className="bg-transparent text-white border border-[#1E294B] hover:border-[#A855F7] px-6 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all active:scale-95">
                    Read Log Streams
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;