# Deploy NovelForge to Vercel

## Project configuration

- Repository: this repository, branch `main`.
- Root Directory: `react` (the repository root is not the frontend).
- Framework: Vite.
- Install Command: default (`npm install` / lockfile-driven install).
- Build Command: `npm run build`.
- Output Directory: `dist`.
- `react/vercel.json` keeps direct links such as `/library`, `/write/edit/123` and `/auth/callback` routed through the React app.

## Environment variables

Add these in the Vercel project’s Environment Variables settings for Production and any Preview environments you use, then deploy again:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your public Supabase anon key |

Vite embeds `VITE_*` values into the public JavaScript bundle. Never use a service-role key in place of the anon key. Access control must remain enforced by Supabase policies. The frontend needs no OpenRouter or Supabase service-role key. Local `.env` files are ignored by Git; copy `.env.example` to `.env` for a fresh local checkout and supply your own public settings.

Private keys belong only in an authenticated backend or server function environment. The unused experimental handler at `src/pages/api/ai/test.js` is not a Vite or Vercel API route and is not used by the current UI. Do not expose an unauthenticated paid AI endpoint by moving it into a function folder without implementing authentication and request limits.

## Supabase sign-in redirects

In Supabase Authentication URL Configuration, set the Site URL to your production domain and allow `https://YOUR_DOMAIN/auth/callback`. The frontend uses the current site origin for Google sign-in. Add exact preview callback URLs if you intend to test authentication on preview deployments. Preserve any local callback URL you still use. Verify email and Google sign-in against your deployed domain.

## Credentials found in Git history

The blocked local commit contained an OpenRouter API key. A Supabase service-role key was also tracked in `.env`, including already-published history. Rotate/revoke both with their providers and update any legitimate server-side consumers. Removing a file from the latest commit does not revoke a key or remove older published copies.

The two rejected/unpushed commits were replaced with a clean commit based on `origin/main`, preserving the source changes but removing `.env` from the pushed tip and its new commits. The private file remains on your computer. No force-push is necessary for this correction. Older already-published history is not rewritten; credential rotation is essential.

## Final checks

1. From `react`, run `npm run lint` and `npm run build`.
2. `git ls-files .env` should print nothing; `git check-ignore .env` should identify the ignored local file.
3. Push `main` normally and watch the Vercel deployment logs.
4. Open `/`, `/explore` and a direct nested route, then test sign-in, chapter saving and reader navigation with your own account.
5. The dashboard demo collection is still enabled intentionally. See `READING-DASHBOARD-DATA.md` to disable it when ready.
