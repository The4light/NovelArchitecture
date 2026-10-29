# Reading dashboard: replace the sample collection

The signed-in Home dashboard combines the existing published Supabase catalogue with 24 fictional books. Samples are display-only: they never enter Supabase or the personal library and never navigate to a fabricated reading route. Every sample card and its aggregate rating/review are labelled. Mock jackets are local CSS artwork; no external images or dependencies are required.

## Remove all sample data

1. Open `src/lib/readingShowcase.js` and change `SHOW_DEMO_BOOKS` to `false`.
2. This removes all fictional books, sample review scores, sample reviews and the preview notice. Live stories still come from `usePublicCatalog()` in `src/lib/publicCatalog.js`, restricted to `status = Published`.
3. Test Home with zero, one and many published records. Empty shelves disappear; the carousel hides with zero records and does not autoplay with one. Missing public ratings display “Not yet reviewed”; missing format displays “Unspecified”.
4. Once the sample collection is no longer useful, delete `demoBooks` and its construction data, and remove its import and conditional concatenation in `src/pages/StudioHome.jsx`. Keep `readingType` and `reviewStats`, which are also used for live records.

## Supply live metadata

The current published-book query already selects all novel columns and the public author profile. The dashboard consumes:

| Field | Purpose |
| --- | --- |
| `id`, `title`, `genre`, `synopsis` (or `description`) | Existing book identity and text |
| `thumbnail_url` (or `cover`) | Existing real book cover |
| `profiles.display_name`, `author_name`, `author` | Existing author display fallbacks |
| `book_type` | Optional format: Novel, Novella, Short story, Serial; do not infer from chapter count |
| `rating_average`, `review_count` | Optional public review aggregates from a trusted backend |

If the backend uses different field names, map its results to this shape before constructing `books` in StudioHome. No schema changes are part of this UI work. Keep aggregates absent until a real review service is available; never copy sample scores onto live books.

Home currently features the first ten catalogue entries, ordered by the existing newest-first query. The carousel uses the first five. Genre collections preserve that order; their numbers are editorial list positions, not a popularity ranking. To add real editorial featuring later, consume an explicit featured flag or curated ID list. Do not claim popularity or completion without corresponding data.

## Reviews: current behaviour and backend integration

The star picker and personal review form work now. They store a per-user/per-book record in browser localStorage at `novelforge:review:<userId>:<bookId>` with `{ stars, text, updatedAt }`. This is explicitly private to this browser, does not sync and does not change public aggregate ratings. Samples and live books use separate IDs. A review write failure leaves the form available and reports the error.

To publish real reviews later:

1. Add an authenticated review service with ownership enforcement, one review per user/book, stars constrained to 1–5, length limits, timestamps and appropriate moderation. Never trust a user-supplied aggregate.
2. Replace localStorage loading/saving in `ReadingDetails` (`src/components/studio/ReadingShowcase.jsx`) with that service. Await confirmed persistence, handle pending/error states and retain entered text on failure.
3. Return public aggregates as `rating_average` and `review_count`, and render actual review records instead of the sample review block. Sample review rendering is already guarded by `book.isDemo`.
4. Update the visible browser-only wording only after cross-device persistence and public publishing actually exist. Treat migration of private local reviews as an explicit reader action, not an automatic public upload.

## Carousel and accessibility

Autoplay advances every 4.8 seconds with an 850ms horizontal transition. Previous, next, slide selectors and pause controls are available. Rotation pauses on hover, keyboard focus, hidden document and an open book dialog. Reduced-motion preference disables autoplay and animation. Inactive slides are inert and hidden from accessibility navigation. Filters and search affect the discovery grid; curated shelves remain visible.

## Verification

Run `npm run build` and `npm run lint` from `react`. Use `/qa/studio.html?page=home` for isolated fictional live records without database writes. Check carousel movement/pause, genre/type/search combinations, sample preview versus live reading links, private star/review persistence, dialog dismissal and mobile bottom-navigation clearance.
