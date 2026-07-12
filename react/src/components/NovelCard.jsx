import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const gothicFont = '"Cinzel Decorative", "Cinzel", "Playfair Display", Georgia, serif';
const sansFont = '"Plus Jakarta Sans", "Inter", system-ui, sans-serif';
const EASE = [0.22, 1, 0.36, 1];

// The cover IS the card. No box, no padding fighting the image —
// title, genre, and author sit directly on the artwork like a real
// book jacket, and the whole thing gets weight on hover instead of
// just a border-color flick.
const NovelCard = ({ novel }) => {
  const navigate = useNavigate();
  const authorProfile = novel.profiles;

  return (
    <motion.div
      onClick={() => navigate(`/read/${novel.id}`)}
      whileHover={{ y: -10 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-[3/4] w-full shadow-[0_10px_30px_rgba(0,0,0,0.45)] group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
      style={{ fontFamily: sansFont }}
    >
      {/* COVER — fills the entire card */}
      <motion.img
        src={novel.thumbnail_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600'}
        alt={novel.title}
        className="absolute inset-0 w-full h-full object-cover"
        whileHover={{ scale: 1.07 }}
        transition={{ duration: 0.7, ease: EASE }}
      />

      {/* Ring that ignites on hover — the card's one accent move */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-[#F59E0B]/50 transition-all duration-500 pointer-events-none" />

      {/* Permanent bottom scrim so text is always legible, deepens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

      {/* STATUS TAG */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[#F59E0B] text-[9px] font-bold tracking-[0.2em] uppercase">
        {novel.status || 'Live'}
      </div>

      {/* CONTENT — sits on the cover, rises slightly on hover */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-5 space-y-2.5"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <span className="inline-block text-[9px] font-extrabold tracking-[0.2em] text-[#A855F7] uppercase drop-shadow">
          {novel.genre || 'Unclassified'}
        </span>

        <h4
          className="text-white text-xl leading-tight capitalize line-clamp-2 drop-shadow-lg"
          style={{ fontFamily: gothicFont }}
        >
          {novel.title}
        </h4>

        <p className="text-[12px] text-gray-300 leading-relaxed line-clamp-2 max-h-0 opacity-0 group-hover:max-h-16 group-hover:opacity-100 transition-all duration-400 overflow-hidden">
          {novel.synopsis || novel.description || 'No summary available yet.'}
        </p>

        <div
          onClick={(e) => {
            e.stopPropagation();
            if (authorProfile?.username) navigate(`/profile/${authorProfile.username}`);
          }}
          className="flex items-center justify-between pt-2.5 mt-1 border-t border-white/15"
        >
          <div className="flex items-center gap-2 group/auth">
            <img
              src={authorProfile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + novel.user_id}
              className="w-5 h-5 rounded-full ring-1 ring-white/20"
              alt=""
            />
            <span className="text-[11px] text-gray-300 group-hover/auth:text-white transition-colors">
              {authorProfile?.display_name || 'Anonymous'}
            </span>
          </div>
          <span className="text-[10px] text-[#F59E0B] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Read →
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NovelCard;