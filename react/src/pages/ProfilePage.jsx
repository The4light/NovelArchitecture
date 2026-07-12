import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { genreColors } from '../data/novel'; // Keeping your aesthetic styling tags
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';

// ─── Motion choreography ───
// Everything on this page enters once, in a quiet, deliberate sequence.
// No bouncing, no confetti — just a calm settle, the way Apple product
// pages resolve into place.
const EASE = [0.22, 1, 0.36, 1];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const fontStack =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Helvetica Neue", Arial, sans-serif';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentLoggedUser, loading: authLoading } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const isOwner = currentLoggedUser && profile && currentLoggedUser.id === profile.id;

  useEffect(() => {
    if (!authLoading) {
      fetchProfileAndNovels();
    }
  }, [username, currentLoggedUser, authLoading]);

  const fetchProfileAndNovels = async () => {
    try {
      setLoading(true);

      let query = supabase.from('profiles').select('*');

      if (username) {
        query = query.eq('username', username);
      } else if (currentLoggedUser?.id) {
        query = query.eq('id', currentLoggedUser.id);
      } else {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await query.maybeSingle();

      if (profileError || !profileData) {
        console.error('Profile resolution error:', profileError);
        setProfile(null);
        return;
      }

      setProfile(profileData);
      setDisplayName(profileData.display_name);
      setBio(profileData.bio || '');

      const { data: novelsData, error: novelsError } = await supabase
        .from('novels')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (!novelsError) {
        setNovels(novelsData || []);
      }
    } catch (err) {
      console.error('Data orchestration pipeline failure:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !isOwner) return;

    try {
      setUploadingAvatar(true);

      const CLOUD_NAME = 'dl4b62svx';
      const UPLOAD_PRESET = 'Novel_Dive';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.secure_url) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.secure_url })
          .eq('id', profile.id);

        if (!updateError) {
          setProfile((prev) => ({ ...prev, avatar_url: data.secure_url }));
        } else {
          console.error('Supabase avatar sync rollback:', updateError);
        }
      }
    } catch (err) {
      console.error('Cloudinary target streaming crash:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!isOwner) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName, bio: bio })
        .eq('id', profile.id);

      if (!error) {
        setProfile((prev) => ({ ...prev, display_name: displayName, bio: bio }));
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Profile sync exception:', err);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#FBFBFD] flex items-center justify-center"
        style={{ fontFamily: fontStack }}
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-7 h-7 rounded-full border-2 border-[#E5E5EA] border-t-[#4B3869]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          />
          <span className="text-[11px] font-medium tracking-wide text-[#6E6E73]">
            Loading profile
          </span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FBFBFD]" style={{ fontFamily: fontStack }}>
        <Navbar />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-lg mx-auto px-6 py-44 text-center"
        >
          <h2 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight mb-2">
            No one here yet
          </h2>
          <p className="text-sm text-[#6E6E73] mb-8 leading-relaxed">
            @{username} doesn't have a page on Novel Dive.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#1D1D1F] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#4B3869] transition-colors duration-300"
          >
            Back to the feed
          </button>
        </motion.div>
      </div>
    );
  }

  const authorStats = [
    { label: 'novels', value: novels.length.toString() },
    {
      label: 'joined',
      value: profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })
        : 'recently',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] selection:bg-[#EDE9F7]" style={{ fontFamily: fontStack }}>
      <Navbar />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto px-6 sm:px-8 pt-28 pb-24"
      >
        {/* ─── Hero ─── */}
        <div className="relative flex flex-col items-center text-center border-b border-[#E5E5EA] pb-16">
          {/* ambient glow — the one quiet accessory on the page */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, #EDE9F7 0%, transparent 70%)' }}
            animate={
              uploadingAvatar
                ? { opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }
                : { opacity: [0.4, 0.6, 0.4] }
            }
            transition={{ repeat: Infinity, duration: uploadingAvatar ? 1.4 : 5, ease: 'easeInOut' }}
          />

          <motion.div variants={rise} className="relative shrink-0 group z-10">
            <div
              className={`w-28 h-28 rounded-full overflow-hidden ring-1 ring-[#E5E5EA] shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ${
                uploadingAvatar ? 'opacity-70' : ''
              }`}
            >
              <img
                src={profile.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + profile.id}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            </div>

            {isOwner && (
              <label className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                <span className="text-white text-[10px] font-medium tracking-wide">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            )}
          </motion.div>

          <motion.div variants={rise} className="mt-7 z-10 w-full max-w-xl">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="text-left bg-white border border-[#E5E5EA] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-4">
                    <label className="text-[11px] font-medium text-[#6E6E73] block mb-1.5">
                      Display name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#FBFBFD] border border-[#E5E5EA] px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4B3869] focus:ring-1 focus:ring-[#4B3869] transition-colors"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="text-[11px] font-medium text-[#6E6E73] block mb-1.5">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full h-24 bg-[#FBFBFD] border border-[#E5E5EA] px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4B3869] focus:ring-1 focus:ring-[#4B3869] transition-colors resize-none leading-relaxed"
                      placeholder="Tell readers about your writing..."
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-[13px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-[#4B3869] hover:bg-[#1D1D1F] text-white text-[13px] font-medium rounded-full transition-colors duration-300"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="display"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className="flex items-center justify-center gap-2.5">
                    <h1 className="text-[2.5rem] leading-none font-semibold tracking-tight text-[#1D1D1F] capitalize">
                      {profile.display_name}
                    </h1>
                    {isOwner && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 rounded-full text-[#6E6E73] hover:text-[#4B3869] hover:bg-[#EDE9F7] transition-colors duration-200"
                        aria-label="Edit profile"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13px] font-medium text-[#6E6E73] tracking-wide">
                    @{profile.username}
                  </p>
                  <p className="mt-4 text-[15px] text-[#6E6E73] leading-relaxed max-w-md mx-auto">
                    {profile.bio || "This writer hasn't added a bio yet."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-7 flex items-center justify-center gap-3 text-[13px] text-[#6E6E73]">
              {authorStats.map((stat, i) => (
                <React.Fragment key={stat.label}>
                  {i > 0 && <span className="text-[#D1D1D6]">·</span>}
                  <span>
                    <span className="font-semibold text-[#1D1D1F]">{stat.value}</span> {stat.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── Bibliography ─── */}
        <div className="mt-16">
          <motion.div variants={rise} className="flex items-center gap-4 mb-10">
            <h4 className="text-[13px] font-semibold text-[#1D1D1F] tracking-tight">
              Published work
            </h4>
            <span className="h-px bg-[#E5E5EA] flex-1" />
          </motion.div>

          {novels.length === 0 ? (
            <motion.div
              variants={rise}
              className="text-center py-24 border border-dashed border-[#E5E5EA] rounded-3xl"
            >
              <Icons.Book className="w-6 h-6 text-[#D1D1D6] mx-auto mb-3" />
              <p className="text-sm text-[#6E6E73]">No novels published yet.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} onClick={() => navigate(`/read/${novel.id}`)} />
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Novel card ───
// The one interactive signature on the page: a restrained, mouse-tracked
// tilt with a soft shadow lift — the kind of quiet depth Apple product
// pages use, kept subtle enough not to feel gimmicky.
const NovelCard = ({ novel, onClick }) => {
  const ref = useRef(null);
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mvY, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mvX, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width - 0.5);
    mvY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mvX.set(0);
    mvY.set(0);
  };

  return (
    <motion.div
      variants={rise}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[3/4] w-full bg-[#F1F1F3] rounded-2xl overflow-hidden mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-shadow duration-500">
        <img
          src={
            novel.thumbnail_url ||
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=cover'
          }
          alt={novel.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#1D1D1F] text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
          {novel.status}
        </div>
      </div>

      <div
        className={`inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-widest mb-2 border ${
          genreColors[novel.genre] || 'bg-[#F1F1F3] text-[#6E6E73] border-[#E5E5EA]'
        }`}
      >
        {novel.genre.toUpperCase()}
      </div>

      <h3 className="text-[15px] font-semibold text-[#1D1D1F] mb-1 group-hover:text-[#4B3869] transition-colors capitalize truncate">
        {novel.title}
      </h3>

      <p className="text-[13px] text-[#6E6E73] line-clamp-2 leading-relaxed">
        {novel.synopsis || novel.description || 'No description provided.'}
      </p>
    </motion.div>
  );
};

export default ProfilePage;