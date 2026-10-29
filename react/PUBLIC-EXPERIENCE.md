# NovelForge public experience

The public pages inherit Home's ivory, charcoal, amber, fine borders, literary type, and physical book presentation. The author dashboard and serious writing workspace were not redesigned. No database schema, policies, authentication credentials, or live records were changed.

## Route inventory

| Route | Visitor experience |
| --- | --- |
| `/` | Existing redesigned homepage, preserved |
| `/explore` | Live published catalogue; title/author search, real genre filters, Recent/Popular/Title sorting, featured story, horizontal shelf, genre directory |
| `/search?q=…` | Explicitly labelled sample collection using the existing eight sample records; functional query and genre filters; clear path into the live catalogue |
| `/read/:id` | Cinematic story entrance, synopsis, author, published chapter list |
| `/read/:id?chapter=:chapterId` | Quiet reading canvas with chapter navigation, size controls, paper/night themes, shareable chapter URL |
| `/read` | Polished entry directing visitors to the catalogue |
| `/profile/:username` | Editorial author profile and genuinely published works |
| `/profile` | Sign-in entry for visitors; original account/profile editor retained for authenticated users |
| `/library` | Honest public sign-in entry; original authenticated Library retained |
| `/write` | Public writer invitation; original authenticated dashboard retained |
| `/auth` | Existing email/password and Google entry with atmospheric artwork |
| `/auth?mode=signup` | Signup on the same existing route |
| `/auth/callback` | Existing session exchange/subscription and six-second fallback; failures return to login with useful inline feedback |
| `/publish`, `/write/create`, `/write/edit/:id` | Visitors enter authentication; authenticated destination components remain in place |
| Unmatched paths | Consistent, useful not-found state |

The original profile editor and logged-in Library live in `src/pages/AccountProfilePage.jsx` and `src/pages/AccountLibraryPage.jsx`. Their behavior was retained. `WriteDashboard` and the manuscript/Codex/analytics workspace were not redesigned.

## Shared implementation

- `src/components/public/PublicLayout.jsx`: navigation, footer, loading/error/empty surfaces, section headings.
- `src/components/public/StoryBook.jsx`: accessible story links, author links, physical covers, image failure handling, readable cover fallback.
- `src/components/public/Public.css`: scoped public design system and responsive layouts.
- `src/lib/publicCatalog.js`: existing published Supabase catalogue query, genre normalization, author names, artwork selection.
- `Navbar` accepts optional `tone="world"`; its default appearance and authentication controls remain shared.

World artwork prefers an author's `world_art_url` or `banner_url` when present, then a local story-specific illustration, then the existing cover. These optional fields do not require or apply a schema migration. Local illustrations are intentionally assigned to a matching story rather than used as generic art for every book. Author-supplied covers take precedence on book jackets. Missing/failed covers render a designed title jacket, with genre-specific tones.

## Validation

- Production build passes. Vite still reports the existing large-bundle warning.
- Public redesign lint checks have no errors. Full-project lint retains unrelated errors in `NovelCard.jsx`, `workspace/CodexSidebar.jsx`, and `context/AuthContext.jsx`; the retained account profile and writing workspace have existing effect-dependency warnings.
- Browser checks at 1440, 1280, 1024, 768, 430, 390, and 360 pixels: Explore, sample Search, story entrance, chapter reader, public author, Library entry, writer invitation, and authentication. No document horizontal overflow observed.
- Catalogue genre filter, author query, no-match reset, and title sort verified against actual published records.
- Story opening, next chapter, return to story, text-size change, and night mode verified. Author links resolve to public profiles.
- Login/signup switching, show/hide password, browser-required field validation, callback no-session feedback, and guarded authoring routes verified without creating accounts or submitting credentials.
- Session provider, email/password service, Google provider, and callback origin were preserved. An authenticated provider round trip was not performed because it requires account credentials.
- Reduced motion: incoming story animations use `useReducedMotion`; scoped CSS disables animations/transitions for the matching media preference. Navigation, reading, and forms use semantic, labelled controls and visible keyboard focus.
- No fake ratings, reviews, private library progress, publication counts, or loading-duration claims were added. Search intentionally remains sample-backed.

## Generated artwork

Both assets were generated with the built-in image generation tool, inspected, and encoded as WebP for delivery. Original PNGs remain in the tool's generated-image directory, outside the application. The two shipped files total approximately 778 KiB.

- `public/images/novelforge-portal.webp`: authentication environment, approximately 421 KiB.
- `public/images/aurelius-academy.webp`: story-specific demo illustration for **Crimsone Halo**, approximately 357 KiB; grounded in the published opening's Aurelius estate, Royal Knight Apprentice Academy, black gates, autumn courtyard, and arena. It is a local visual illustration, not an author-uploaded cover or database update.

### Authentication generation prompt

Use case: stylized-concept. Asset type: production website authentication environment for NovelForge, a premium literary fiction platform. Create one magnificent cinematic landscape image, wide 3:2 framing. A quiet ancient stone archway on the far left opens onto an immense sunlit valley with a distant, intricate ivory city and an ancient library on a cliff, narrow winding river, cypress silhouettes, weathered pale sandstone steps in the near foreground. We are standing at the edge of a story. Sophisticated painterly realism, atmospheric depth, beautiful fine foliage and architecture, believable organic details, restrained warm ivory and sage palette, antique gold sunlight, misty blue distant mountains. Composition: dramatic architectural framing and foliage mostly on the left third and upper left, the open luminous valley and distant city visible across center, right third soft misty light with calm detail for a floating cream interface panel that will be added in code. A subtle warm dawn, not oversaturated. No people facing camera, no dragons, no cartoon, no neon. This is environmental artwork only: absolutely no text, letters, typography, signage, book covers, interface, logos or watermark. Image should also crop beautifully to portrait on mobile. Save as a landscape image.

### Story generation prompt

Use case: illustration-story. Asset type: cinematic story-world background for the published fantasy novel Crimsone Halo in NovelForge. Create a single premium atmospheric landscape painting, wide 3:2, environmental artwork with no text. Grounded scene from its first chapter The Golden Prelude: the Royal Knight Apprentice Academy, soaring pale sandstone spires beyond tall black wrought-iron gates, a grand empty stone courtyard and the distant arched entrance to an arena. A stately Aurelius-estate atmosphere of old parchment, polished wood and nobility translated into architecture. Clear autumn morning, crisp gold sunlight falling across a dark foreground arch, restrained burgundy fallen leaves, subtle cold mist at the gate suggesting something unsettling just outside the light. Right two thirds have beautifully detailed architecture and rising towers; left third is a shadowed stone arch with clean dark negative space for cream story title added later in code. Beautiful cinematic painterly realism, sophisticated literary book-jacket quality, believable buildings, subtle depth, sage, charcoal, antique gold, ivory stone palette. No generic wizard hats, no dragons, no characters, no monsters, no weapons foreground, no modern elements, no typography, no signage, no logos, no text, no UI, no watermark. It must also crop beautifully into a vertical book-cover image and mobile website background.
