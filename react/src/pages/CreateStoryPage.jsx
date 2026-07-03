import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

const CreateStoryPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  // Form Field States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // Short logline hook
  const [synopsis, setSynopsis] = useState(""); // Deep backstory overview
  const [genre, setGenre] = useState("Fantasy");
  const [isMature, setIsMature] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Enforce Route Protection
  if (!loading && !user) {
    navigate("/auth");
    return null;
  }

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      // Setup payload matching our core data slice schema
      const { error: dbError } = await supabase
        .from("novels")
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            synopsis: synopsis.trim(),
            genre: genre,
            is_mature: isMature,
            user_id: user.id,
            status: "Draft", // Safely locked out of the public discovery stream on start
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // Clean redirect straight back to the master dashboard workspace
      navigate("/write");
    } catch (err) {
      setError(err.message || "Failed to initialize manuscript profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={() => navigate("/write")}
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-8 block transition-colors"
        >
          ← Cancel Workspace
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Forge New Manuscript
          </h1>
          <p className="text-gray-500 font-medium">
            Configure your core settings before generating chapters.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-900 text-sm font-medium mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateStory} className="space-y-8">
          {/* Title input */}
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-purple-600 transition-colors">
              Story Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter an evocative title..."
              className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-xl font-bold placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Genre Selection Dropdown */}
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Primary Narrative Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium text-gray-900 focus:outline-none focus:border-purple-600 transition-all"
            >
              <option value="Fantasy">Fantasy</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Thriller">Thriller</option>
              <option value="Slice of Life">Slice of Life</option>
            </select>
          </div>

          {/* One line summary placeholder */}
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-purple-600 transition-colors">
              Short Description / Logline
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief hook to capture reader interest (max 150 characters)..."
              className="w-full bg-transparent border-b-2 border-gray-100 py-3 font-medium placeholder:text-gray-300 focus:border-purple-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Core Full Context Synopsis Textarea */}
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-purple-600 transition-colors">
              Extended Book Synopsis
            </label>
            <textarea
              rows={5}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Outline the detailed premise, conflicts, and world dynamics..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-purple-600 transition-colors resize-none"
            />
          </div>

          {/* Mature Flag Content Rating Checklist Selector */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-sm font-black text-gray-900">
                Mature Audiences Only (18+)
              </p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Contains explicit violence, language, or themes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMature(!isMature)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${isMature ? "bg-black" : "bg-gray-200"}`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isMature ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="w-full bg-black text-white rounded-2xl py-5 mt-4 font-black text-sm tracking-[0.2em] uppercase shadow-xl hover:bg-purple-700 transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? "Initializing Workspace..." : "Initialize Manuscript"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryPage;
