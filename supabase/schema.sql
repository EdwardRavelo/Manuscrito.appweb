-- ================================================================
-- Manuscrito — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ── Proyectos ────────────────────────────────────────────────────
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  description text default '',
  cover_color text,
  palette     text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Documentos ───────────────────────────────────────────────────
create table public.documents (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid references public.projects(id) on delete cascade not null,
  user_id          uuid references auth.users(id) on delete cascade not null,
  title            text not null default 'Sin título',
  type             text not null default 'chapter',
  "order"          integer default 0,
  content          jsonb default '{}',
  status           text not null default 'draft',
  tags             text[] default '{}',
  card_color       text,
  margin_comments  jsonb default '[]',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── Notas sticky ─────────────────────────────────────────────────
create table public.sticky_notes (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  content    text default '',
  color      text,
  x          float default 0,
  y          float default 0,
  width      float default 200,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Row Level Security ───────────────────────────────────────────
alter table public.projects     enable row level security;
alter table public.documents    enable row level security;
alter table public.sticky_notes enable row level security;

create policy "Usuarios: sus proyectos" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuarios: sus documentos" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuarios: sus notas" on public.sticky_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Índices de performance ────────────────────────────────────────
create index idx_documents_project_id  on public.documents(project_id);
create index idx_documents_order       on public.documents(project_id, "order");
create index idx_sticky_notes_project  on public.sticky_notes(project_id);
create index idx_projects_user         on public.projects(user_id, updated_at desc);
