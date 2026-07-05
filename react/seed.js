import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import process from "process";
import { fileURLToPath } from 'url';

// Set up directory paths for ES Modules in Node
const __filename = fileURLToPath(import.meta.env?.url || import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically look for your .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, './.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// ⚡ Integrated user UUID to satisfy the NOT NULL database schema constraint
const SEED_USER_ID = "5b351a6c-704e-4155-819d-0c803224f911";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error("❌ Error: Could not load required environment variables from your .env file.");
  process.exit(1);
}

// Initialize Supabase with the service role key to bypass RLS barriers
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false }
});

const mockNovels = [
  { title: "Neon Horizon", genre: "Sci-Fi", synopsis: "A gritty cyber-detective tracks a phantom AI signature through the rainy skyscrapers of neo-Lagos." },
  { title: "Chamber of Echoes", genre: "Fantasy", synopsis: "An ancient mage finds a broken stone vault containing the memories of an extinct dynasty." },
  { title: "Shadows Over Rivers", genre: "Thriller", synopsis: "When a deep-sea drilling rig goes dark off the coast, a maritime engineer discovers something breathing below." },
  { title: "The Jade Syndicate", genre: "Action", synopsis: "A retired martial arts master is drawn back into the criminal underworld to pay off a familial debt." },
  { title: "Whispers of the Cosmos", genre: "Sci-Fi", synopsis: "Deep space explorers pick up a harmonic radio frequency coming from the interior of a dying star." },
  { title: "Chronicles of the Iron Crown", genre: "Fantasy", synopsis: "Rebel lords attempt to overthrow an immortal tyrant whose soul is bound directly to the kingdom's throne." },
  { title: "Code Obsidian", genre: "Cyberpunk", synopsis: "A rogue software architect uncovers a line of code capable of rewriting human motor function across the neural web." },
  { title: "The Forgotten Alchemist", genre: "Fantasy", synopsis: "An apprentice accidental discovers a recipe for gold that requires a price far heavier than currency." },
  { title: "Rust and Ruin", genre: "Dystopian", synopsis: "Scavengers navigating the endless sand wastes discover a pristine, fully operational pre-collapse bunker." },
  { title: "Silent Symphony", genre: "Mystery", synopsis: "A brilliant classical composer is implicated in a string of high-profile thefts executing perfectly to his scores." }
];

async function seedDatabase() {
  console.log("🚀 Populating workspace records with valid user ownership...");

  for (let i = 0; i < mockNovels.length; i++) {
    const novelData = mockNovels[i];
    
    const { data: insertedNovel, error: novelError } = await supabase
      .from('novels')
      .insert([{
        title: novelData.title,
        genre: novelData.genre,
        synopsis: novelData.synopsis,
        status: 'Draft',
        user_id: SEED_USER_ID
      }])
      .select()
      .single();

    if (novelError) {
      console.error(`❌ Error creating "${novelData.title}":`, novelError.message);
      continue;
    }

    console.log(`📚 Added Story [${i + 1}/10]: "${insertedNovel.title}"`);

    const chaptersToInsert = [];
    for (let c = 1; c <= 10; c++) {
      chaptersToInsert.push({
        novel_id: insertedNovel.id,
        title: `Chapter ${c}: ${getChapterKeyword(c, novelData.genre)}`,
        content: `This is the placeholder draft text for Chapter ${c} of ${insertedNovel.title}.`,
        chapter_order: c,
        status: 'Draft'
      });
    }

    const { error: chapterError } = await supabase
      .from('chapters')
      .insert(chaptersToInsert);

    if (chapterError) {
      console.error(`  ❌ Chapter error for "${insertedNovel.title}":`, chapterError.message);
    } else {
      console.log(`  ✅ Inserted 10 draft chapters`);
    }
  }

  console.log("\n✨ All done! Your workspace database is packed.");
}

function getChapterKeyword(index, genre) {
  const scifi = ["Awakening", "Grid Vector", "Quantum Shift", "Data Breach", "Signal Lost", "Cyber Nexus", "Protocol Zero", "Hardware Check", "Dark Orbit", "System Reboot"];
  const general = ["Discovery", "First Encounter", "Hidden Path", "Rising Tension", "Broken Trust", "The Crossroads", "Confrontation", "Deep Secret", "Turning Point", "New Beginnings"];
  return genre === "Sci-Fi" || genre === "Cyberpunk" ? scifi[index - 1] : general[index - 1];
}

seedDatabase();