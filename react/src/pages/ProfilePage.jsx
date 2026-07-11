import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';
import { genreColors } from '../data/novel'; // Keeping your aesthetic styling tags
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
  const { username } = useParams(); // Captured from route configuration parameter (e.g., /user/:username)
  const navigate = useNavigate();
  const { user: currentLoggedUser } = useContext(AuthContext);

  // Core Identity State Blocks
  const [profile, setProfile] = useState(null);
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Editable Profile Form States
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  // Determine if the current session token matches this profile record node
  const isOwner = currentLoggedUser && profile && currentLoggedUser.id === profile.id;

  useEffect(() => {
    fetchProfileAndNovels();
  }, [username]);

  const fetchProfileAndNovels = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch public profile metadata details matching url text string parameter
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError || !profileData) {
        console.error("Profile structural node resolution error:", profileError);
        setProfile(null);
        return;
      }

      setProfile(profileData);
      setDisplayName(profileData.display_name);
      setBio(profileData.bio || '');

      // 2. Fetch all books matching the owner user_id mapping
      const { data: novelsData, error: novelsError } = await supabase
        .from('novels')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (!novelsError) {
        setNovels(novelsData || []);
      }
    } catch (err) {
      console.error("Data orchestration pipeline failure:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cloudinary Direct Streaming Avatar Pipeline Engine Handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !isOwner) return;

    try {
      setUploadingAvatar(true);
      
      const CLOUD_NAME = "dl4b62svx"; 
      const UPLOAD_PRESET = "Novel_Dive"; 

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      // Stream binary block directly to Cloudinary media stack
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        // Sync the brand new CDN address back to Supabase Core Profile Table Node
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.secure_url })
          .eq('id', profile.id);

        if (!updateError) {
          setProfile(prev => ({ ...prev, avatar_url: data.secure_url }));
        } else {
          console.error("Supabase avatar sync rollback:", updateError);
        }
      }
    } catch (err) {
      console.error("Cloudinary target streaming crash:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Submit Text Identity Field Mutations
  const handleSaveChanges = async () => {
    if (!isOwner) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio
        })
        .eq('id', profile.id);

      if (!error) {
        setProfile(prev => ({ ...prev, display_name: displayName, bio: bio }));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Profile sync exception:", err);
    }
  };

if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-purple-600">
          {/* Bulletproof Inline SVG Spinner Engine */}
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Resolving Creator Node Identity...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-40 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">404: Identity Void</h2>
          <p className="text-sm text-gray-400 font-bold mb-6">The storyteller handle "@ {username}" does not exist in our system logs.</p>
          <button onClick={() => navigate('/')} className="bg-black text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
            Return to Core Feed
          </button>
        </div>
      </div>
    );
  }

  // Calculate platform aggregate metadata points
  const authorStats = [
    { label: 'novels', value: novels.length.toString(), icon: <Icons.Book className="w-4 h-4" /> },
    { label: 'joined', value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: <Icons.Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-purple-100">
      <Navbar />

      {/* ─── PROFILE FRAME CONTAINER ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-24 sm:pt-28 pb-20">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 border-b border-gray-100 pb-12">
          
          {/* Avatar Component Frame Stacked with Cloudinary Uploader Controls */}
          <div className="relative shrink-0 group">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 bg-gray-50 shadow-xl transition-all duration-300 ${uploadingAvatar ? 'animate-pulse border-purple-500' : 'border-black'}`}>
              <img 
                src={profile.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + profile.id} 
                alt={profile.display_name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Owner Overlay to swap profiles directly via Cloudinary */}
            {isOwner && (
              <label className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer text-white">
                <Icons.UploadCloud className="w-5 h-5 mb-1 text-purple-400" />
                <span className="text-[8px] font-black uppercase tracking-widest text-center px-2">Update Avatar</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                  disabled={uploadingAvatar}
                />
              </label>
            )}
          </div>

          {/* Identity Matrix Field Panels */}
          <div className="flex-1 text-center md:text-left space-y-4 w-full max-w-2xl">
            {isEditing ? (
              <div className="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-100">
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-purple-600">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white text-black border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-purple-600">Short Identity Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full h-24 bg-white text-black border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-xs focus:outline-none focus:border-black transition-colors resize-none leading-relaxed"
                    placeholder="Tell your readers about your design approach or world-building workflow..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-200 hover:bg-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSaveChanges} className="px-4 py-2 bg-purple-600 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm">
                    Save Nodes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black tracking-tight text-gray-900 capitalize">{profile.display_name}</h2>
                  <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 text-gray-500 rounded font-bold">@{profile.username}</span>
                  
                  {isOwner && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="sm:ml-2 p-2 hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-xl transition-all border border-gray-100 shadow-xs bg-white flex items-center justify-center active:scale-95"
                    >
                      <Icons.Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {profile.bio || "This wordsmith hasn't deployed an identity introduction script yet."}
                </p>
              </div>
            )}

            {/* Metrics Ribbon Array */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 pt-2">
              {authorStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                  <span className="text-purple-600 bg-purple-50 p-2 rounded-xl border border-purple-100/40">{stat.icon}</span>
                  <div>
                    <span className="text-gray-900 font-black mr-1">{stat.value}</span>
                    <span className="text-[10px] lowercase text-gray-400 font-medium">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── CREATOR PORTFOLIO NOVELS DISPLAY GRID ─── */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px bg-gray-100 flex-1" />
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 font-mono">Published Bibliographic Ledger</h4>
            <span className="h-px bg-gray-100 flex-1" />
          </div>

          {novels.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
              <Icons.Book className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-bold">No active books linked to this profile cluster yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {novels.map((novel) => (
                <div 
                  key={novel.id} 
                  onClick={() => navigate(`/novel/${novel.id}`)}
                  className="group cursor-pointer bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Layer with Adaptive Styling Anchor */}
                    <div className="relative aspect-3/4 w-full bg-gray-50 rounded-xl overflow-hidden mb-5 shadow-sm border-b-4 border-purple-500/0 group-hover:border-purple-500 transition-all duration-300">
                      <img 
                        src={novel.thumbnail_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=cover"} 
                        alt={novel.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white font-mono text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                        {novel.status}
                      </div>
                    </div>
                    
                    <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black tracking-widest mb-3 border ${genreColors[novel.genre] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {novel.genre.toUpperCase()}
                    </div>
                    
                    <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-purple-600 transition-colors capitalize truncate">
                      {novel.title}
                    </h3>
                  </div>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium mt-1">
                    {novel.synopsis || novel.description || "No public canvas abstract details provided."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;