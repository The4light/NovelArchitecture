# Authenticated NovelForge experience

## Structure

- `/`: public homepage when signed out; reader-only home when signed in. Home, Library and Explore exclude private manuscripts, writing statistics and writing actions from their content.
- `/home`: alias to `/`.
- `/write`: the manuscript collection; existing public writer invitation remains for signed-out visitors.
- `/write/create`: manuscript setup, then the manuscript’s story desk.
- `/write/edit/:id`: dedicated manuscript navigation, story desk, chapters, characters, lore, notes, publishing and settings.
- `/analytics`: real manuscript/chapter counts, current word totals, chapter creation dates, genre distribution and a manuscript ledger.
- `/library`: personal browser shelf. The public sign-in entry remains intact.
- `/profile`: private literary identity and profile editor. `/profile/:username` selects only Published stories.
- `/settings`: account details and a browser preference for editor Focus Mode.
- `/explore` and authenticated `/search`: live catalogue inside the application shell, with save/resume actions.
- `/read/:id`: story entry inside the shell. A valid `?chapter=` opens the sidebar-free reader.
- `/publish`: legacy alias to manuscript creation; publishing is reviewed inside the chosen manuscript. The old unrelated codex insertion form was retired.

Email sign-in and OAuth completion redirect to `/`. Session restoration is gated before choosing the public or authenticated home, and later auth events take precedence over a pending initial session lookup. Auth context lives separately from its provider for reliable Fast Refresh.

## Data and persistence

The existing Supabase tables, ownership keys, profile update/upload service and manuscript/chapter/codex mutation flows are retained. No schema, migrations, database policies or backend files were changed. The workspace explicitly restricts its parent manuscript query to the signed-in owner. A codex read failure leaves the manuscript available with a warning.

The previous library was sample data, and no account-wide library table exists in this repository. Saving, last opened chapter and explicit completion now work through account-scoped localStorage, with an on-screen explanation that these do not sync across devices. Completion is an explicit reader action, not inferred from opening the final chapter. Resume information describes a chapter last opened, not a fabricated percentage read. Writing navigation history and Focus Mode preference are also browser-local.

Analytics counts actual chapter rows and words from current chapter content. The time filter applies to chapter creation dates. Current collection totals are labelled separately. There are no invented reader counts, daily word histories, publishing timestamps or engagement rates.

## Writing

The editor uses the browser’s native content-editing/undo engine without introducing a new package dependency. Bold, italic, underline, strike, paragraph/headings, quotes, lists, alignment, undo/redo, links and scene breaks are available. Formatting has keyboard-accessible buttons; desktop and touch widths have a horizontally scrollable toolbar. Focus Mode removes desktop manuscript navigation; mobile manuscript destinations remain available in a bottom bar.

Legacy plain-text chapters remain literal text. Rich chapters use the `<!--novelforge-rich-->` marker in the existing content field. A shared allowlist sanitizer removes scripts, executable attributes, embeds and unsafe links. The reader understands both formats. Paste/drop insert plain text. Counts preserve word boundaries across paragraphs without incorrectly splitting inline formatting.

Chapter writes are serialized and confirmed with a returned record. Saved status appears only after persistence succeeds; dirty and failed states stay visible. Autosave waits 1.4 seconds after a change. A per-user/per-book/per-chapter browser recovery copy is written while typing and cleared after a successful matching save. Failed saves block intentional chapter/workspace navigation, and the browser receives an unload warning while writing remains unsaved. Browser recovery can restore interrupted writing. Browser history navigation still relies on the recovery copy; cross-device/offline server synchronization is not claimed.

Floating notes are managed above the route layouts, remain open across reader and writer pages, and restore from persisted open records. Explicit close persists before removing a note. A minimise control keeps the note available as a slim draggable strip without closing it. Floating notes use pointer capture, keyboard arrows and constrained coordinates. The last drag position is persisted, rather than the stale position at drag start. Text saves on field blur; note writes are serialized and errors offer retry. Docked notes, lore and character fragments retain their angular paper treatment.

The shared visual theme uses ice-blue surfaces, blue accents and rounded panels throughout public, reader and writer areas. Desktop navigation groups Reading and Create separately. Mobile uses bottom navigation instead of hamburger menus: Home, Library, Explore, Studio and You in the application shell; Desk, Chapters, People, Lore, Notes and Publish inside a manuscript. Account settings are linked from You; manuscript settings from the story desk.

Publishing includes an explicit review dialog. Publishing the manuscript also marks its chapters Published. A manuscript can return to private Draft without deleting text. These remain multiple requests against the existing API; they are not a database transaction. Partial failures are reported and the current state must be reviewed before retrying.

## Verification

Run `npm run dev` from `react/`, then visit `/qa/studio.html`. This separate development entry renders the actual app components with an injected in-memory client and clearly labelled fictional records. It does not write to the real database, create accounts or bypass real authentication. Normal production routes always use Supabase, and this QA entry is not included by the standard Vite build.

The QA page includes a simulated save-failure switch and nine assertions covering safe rendering, legacy prose, script/event removal, safe links, inline word boundaries, paragraph boundaries, entities and alignment sanitization.

Verified in the browser:

- authenticated Home entry and separation from the public homepage;
- sidebar collapse and mobile bottom navigation;
- manuscript filters, search and empty results;
- manuscript and chapter creation;
- formatting, undo/redo, live counts, autosave, failed save, retry, blocked chapter switching and browser recovery;
- Focus Mode and mobile chapter navigation;
- character creation, note edits, docking, keyboard movement and pointer drag;
- manuscript publication and return to private draft using isolated records;
- book saving, chapter tracking, library completion/reopening and resume;
- analytics totals and manuscript/time filters;
- profile editing and exclusion of private drafts from the public author page;
- no application or workspace sidebar during chapter reading;
- reduced-motion CSS and keyboard focus styling;
- overflow checks at 1440, 1280, 1024, 768, 430, 390 and 360 pixels for Home, manuscripts, Explore, Library, profile, analytics, creation, story entry and reading; editor checked at all seven widths. All five additional workspace views also passed 35 combined width checks.

Production build and full frontend lint pass. Vite retains its existing large-bundle advisory. Real-account email/Google sign-in, Cloudinary upload and production database mutations were not performed; those require the user’s own signed-in session to validate end to end. The isolated preview validates component behavior and request/error handling, not deployed database policy configuration.


## Readable archive and chapter navigation
Existing characters, lore and notes open in a reading dialog before editing. Common Markdown headings, lists, emphasis and quotes render as safe React text. Long entries scroll within the dialog. New entries still open directly in their creation form.
The editor always shows Return to chapters, including Focus Mode and mobile. This action awaits persistence and stays in the editor on save failure. The desktop sidebar toggle exits Focus Mode when reopening navigation. Verified in isolated QA: reading-to-edit flow, Focus Mode sidebar reopen, return after successful save, blocked return on simulated failure, and mobile header without horizontal overflow.


## Dense reading dashboard
Home now uses a looping featured-book carousel, compact book grids, combined genre/type/search filters, genre selections and short-read shelves. Existing reading positions remain linked to real chapters. The display-only collection adds 24 clearly labelled fictional books without touching the database. Personal star ratings and review text save in account-scoped browser storage and are explicitly not published reviews. Public aggregates remain absent for live books unless supplied by the backend. See READING-DASHBOARD-DATA.md for the demo switch and live-data integration.
Verified with isolated records: carousel forward wrap, inactive-slide accessibility, combined filters and empty results, sample/live action separation, personal review persistence after reopening, and no horizontal overflow at 1440, 1280, 1024, 768, 430, 390 and 360 pixels.

