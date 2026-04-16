# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Aretusa Padel — web app per la gestione di un torneo di padel locale.
Gli utenti possono visualizzare gironi, classifiche, partite e tabellone finale.
Solo l'admin (con password) può inserire squadre, aggiungere partite e registrare risultati.
L'app è usata durante il torneo su dispositivi mobili (priorità mobile).

## Build & Development
```bash
npm run dev      # Vite dev server on localhost:5173
npm run build    # Production build to /dist
npm run preview  # Preview production build
```
No test runner or linter is configured.

## Deployment
Deployed on Vercel via `git push origin main`. 
SPA routing configured in `vercel.json` (all paths rewrite to index.html).

## Architecture
Single-page React 18 app with Vite. All application state lives in `App.jsx` 
and is passed down via props (no context/store).

### State & Persistence
Data is stored in **Firebase Firestore** with real-time sync across devices.
Three documents per level in collection `tournament_{A|B|C}`:
- `teams` — teams organized by girone {A, B, C}, max 4 per girone
- `matches` — { list: [...] } array of match objects (gironi phase)
- `bracket` — knockout bracket state (rounds, results, advancement)

Admin session stored in `sessionStorage` as `aretusa_token` (JWT).
Auth handled by Vercel Functions (`/api/login`, `/api/verify`).
Password is in `ADMIN_PASSWORD` env var on Vercel (same for all levels).

### Multi-level (Livelli A, B, C)
Three independent tournaments share the same codebase but have
completely separate Firestore data.
- Current level persisted in `localStorage['aretusa_level']` (default 'A')
- TopAppBar shows a dropdown to switch between levels
- Switching level re-subscribes Firestore listeners to the new collection
- Each level has its own teams, matches, and bracket

### Gironi (Group Stage)
`buildGironi()` in App.jsx computes standings from match results.
Stats: pg (played), v (wins), p (losses), sp (sets for), sm (sets against), pts (wins × 3).
Sorted by points then set difference.

### Bracket (Tabellone)
12 teams seeded from gironi standings. `generateBracket()` creates the initial bracket;
`advanceBracket()` propagates winners. Structure:
- **Round 0** (Primo Turno): seeds 5-12, 4 matches
- **Round 1** (Quarti): seeds 1-4 have byes, face PT winners
- **Round 2** (Semifinali): 2 matches
- **Round 3** (Finale): 1 match

The bracket visualization uses CSS Grid (8 rows × 7 columns) with SVG connector lines.

### Admin vs User
`isAdmin` boolean controls visibility of all edit/add/delete controls.
When `bracket.active` is true, adding girone matches is blocked in Calendario.
BottomNav, MatchCard, Calendario, and Admin pages all receive `isAdmin`.

## Styling
Tailwind CSS with custom dark Material Design 3 palette in `tailwind.config.js`.
Key tokens: `primary` (#77db90), `secondary` (#71ff74), `surface` (#0E2044).
Fonts: Space Grotesk (headlines), Inter (body).
Icons: Google Material Symbols Outlined (CDN in index.html).
Mobile-first design. Do not add desktop-only layouts.

## Code Conventions
- Functional components only, no class components
- Named exports for all components
- New components go in /src/components
- Keep all state in App.jsx — do not introduce context or new stores
- Use existing Tailwind tokens only, no arbitrary CSS values
- All UI text in Italian, component/variable names in English
- Domain terms stay in Italian: girone, casa, ospite, tabellone, squadra

## Things To Avoid
- Do NOT rename Firestore collections (`tournament_A`, `tournament_B`, `tournament_C`)
  — breaks all existing user data
- Do NOT touch the admin password logic without asking first
- Do NOT change the bracket seeding logic without presenting a plan
- Do NOT install new npm dependencies without asking
- Do NOT add desktop breakpoints or change the mobile-first approach
- Do NOT use arbitrary Tailwind values — use only tokens defined in tailwind.config.js