# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:5173
npm run build     # Type-check + build for production (tsc -b && vite build)
npm run preview   # Preview production build
```

No test suite is configured.

## Environment

Requires a `.env` file with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

The app throws at startup if these are missing (`src/lib/supabase.ts`).

## Architecture

**Manuscrito** is a personal writing editor. All data is stored in Supabase (PostgreSQL + Auth). There is no local/offline persistence layer.

### Path alias
`@/` maps to `./src/` (configured in `vite.config.ts` and `tsconfig.json`).

### Data flow
```
Supabase (PostgreSQL)
  └── src/db/database.ts   — async CRUD helpers, snake_case→camelCase mappers
        └── src/store/projectStore.ts  — Zustand: projects + documents
        └── src/store/editorStore.ts   — Zustand: active mode, active document, panel state
```

`database.ts` never talks to Supabase directly from components — all DB access goes through Zustand store actions.

DB columns use `snake_case`; TypeScript types use `camelCase`. The mappers in `database.ts` (`mapProject`, `mapDocument`, `mapStickyNote`) handle the conversion. When adding new columns, update both the mapper and the relevant `updateX` patch builder.

### Auth
`src/store/authStore.ts` wraps Supabase Auth (email/password). `App.tsx` listens to `onAuthStateChange` and guards all routes — unauthenticated users are redirected to `/login`.

### Routing
- `/login` — Login page
- `/` — Home: project grid (requires auth)
- `/project/:projectId/*` — Project view (requires auth)

### Editor modes (set via `editorStore.mode`)
- `write` — Full-width distraction-free editor (`WriteMode.tsx`)
- `chapters` — Left panel (chapter list) + editor + right panel (`ChaptersMode.tsx`)
- `chapters` uses `LeftPanel`/`RightPanel` components and `ChapterList` sidebar
- `outline` — Kanban board (draft/revision/final columns) (`OutlineMode.tsx`)
- `ideas` — Freeform sticky notes canvas (`IdeasMode.tsx`)

### TipTap editor
`src/components/Editor/TipTapEditor.tsx` — auto-saves document content to Supabase with an 800ms debounce. Content is stored as TipTap JSON in the `content` JSONB column of the `documents` table.

Extensions in use: StarterKit, Placeholder, Highlight, Underline, Typography, CharacterCount.

### Dark mode
Persisted in `localStorage` under key `mss-dark`. Applied by toggling the `dark` class on `document.documentElement`. Initialized before React mounts (top of `editorStore.ts`).

## Visual system

CSS custom properties are defined in `src/index.css`. Always use these variables — do not hardcode colors.

Key variables: `--bg`, `--bg-panel`, `--bg-surface`, `--bg-hover`, `--bg-active`, `--border`, `--border-mid`, `--border-strong`, `--text`, `--text-mid`, `--text-muted`, `--accent`, `--accent-dim`, `--accent-amber`, `--accent-red`, `--accent-blue`, `--accent-purple`, `--shadow-warm`, `--shadow-warm-lg`.

Old variables (`--bg-primary`, `--bg-secondary`, `--surface`, `--accent-warm`, `--text-primary`, `--text-secondary`) no longer exist.

Fonts: **Lora** (editor content), **Plus Jakarta Sans** (UI), **JetBrains Mono** (monospace).

## Types

`src/types/index.ts` — canonical TypeScript types: `Project`, `Document`, `StickyNote`, `EditorMode`, `MarginComment`. Always update these when changing the data model.

## Supabase tables

| Table | Key columns |
|-------|-------------|
| `projects` | `id`, `user_id`, `title`, `description`, `cover_color`, `palette` |
| `documents` | `id`, `user_id`, `project_id`, `title`, `type`, `order`, `content` (jsonb), `status`, `tags`, `card_color`, `margin_comments` |
| `sticky_notes` | `id`, `user_id`, `project_id`, `content`, `color`, `x`, `y`, `width` |

`projects` uses `ON DELETE CASCADE` for documents and sticky notes. Row-level security is enforced via `user_id`.

Column enums:
- `documents.status`: `'draft' | 'revision' | 'final'`
- `documents.type`: `'chapter' | 'note' | 'idea' | 'character' | 'scene'`
