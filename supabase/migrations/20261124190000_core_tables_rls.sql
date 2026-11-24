-- ============================================================
-- Migration: Core Tables Row Level Security & Access Policies
-- Ensures companions, session_history, and bookmarks tables
-- enforce strict user isolation and support Clerk user IDs (text).
-- ============================================================

-- ------------------------------------------------------------
-- Step 1: Drop all existing policies on these tables first
-- PostgreSQL prevents ALTER COLUMN TYPE if an active policy references it.
-- ------------------------------------------------------------
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('session_history', 'bookmarks', 'companions')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ------------------------------------------------------------
-- Step 2: Drop any legacy foreign key constraints to auth.users
-- ------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name IN ('session_history', 'bookmarks')
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'user_id'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- ------------------------------------------------------------
-- Step 3: Convert user_id and author columns from UUID to TEXT
-- Allows storing and querying Clerk alphanumeric IDs (e.g. "user_2...")
-- ------------------------------------------------------------
ALTER TABLE if exists public.session_history 
  ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE if exists public.bookmarks 
  ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE if exists public.companions 
  ALTER COLUMN author TYPE text USING author::text;

-- Quick lookup indexes
CREATE INDEX IF NOT EXISTS idx_session_history_user_id ON public.session_history (user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_companions_author ON public.companions (author);

-- ------------------------------------------------------------
-- 4. Table: companions
-- ------------------------------------------------------------
alter table if exists public.companions enable row level security;

-- Drop existing policies if any to ensure clean idempotent setup
drop policy if exists "Companions are viewable by everyone" on public.companions;
drop policy if exists "Authenticated users can create companions" on public.companions;
drop policy if exists "Authors can update their own companions" on public.companions;
drop policy if exists "Authors can delete their own companions" on public.companions;

-- Anyone (including public catalog browsers) can view tutors
create policy "Companions are viewable by everyone"
  on public.companions
  for select
  using (true);

-- Authenticated users can only create companions authored by themselves
create policy "Authenticated users can create companions"
  on public.companions
  for insert
  with check (
    (auth.jwt() ->> 'sub') = author
  );

-- Authors can update their own companions
create policy "Authors can update their own companions"
  on public.companions
  for update
  using (
    (auth.jwt() ->> 'sub') = author
  )
  with check (
    (auth.jwt() ->> 'sub') = author
  );

-- Authors can delete their own companions
create policy "Authors can delete their own companions"
  on public.companions
  for delete
  using (
    (auth.jwt() ->> 'sub') = author
  );

-- ------------------------------------------------------------
-- 5. Table: session_history
-- ------------------------------------------------------------
alter table if exists public.session_history enable row level security;

drop policy if exists "Users can view their own session history" on public.session_history;
drop policy if exists "Users can insert their own session history" on public.session_history;
drop policy if exists "Users can delete their own session history" on public.session_history;

create policy "Users can view their own session history"
  on public.session_history
  for select
  using (
    (auth.jwt() ->> 'sub') = user_id
  );

create policy "Users can insert their own session history"
  on public.session_history
  for insert
  with check (
    (auth.jwt() ->> 'sub') = user_id
  );

create policy "Users can delete their own session history"
  on public.session_history
  for delete
  using (
    (auth.jwt() ->> 'sub') = user_id
  );

-- ------------------------------------------------------------
-- 6. Table: bookmarks
-- ------------------------------------------------------------
alter table if exists public.bookmarks enable row level security;

drop policy if exists "Users can view their own bookmarks" on public.bookmarks;
drop policy if exists "Users can add bookmarks" on public.bookmarks;
drop policy if exists "Users can remove their own bookmarks" on public.bookmarks;

create policy "Users can view their own bookmarks"
  on public.bookmarks
  for select
  using (
    (auth.jwt() ->> 'sub') = user_id
  );

create policy "Users can add bookmarks"
  on public.bookmarks
  for insert
  with check (
    (auth.jwt() ->> 'sub') = user_id
  );

create policy "Users can remove their own bookmarks"
  on public.bookmarks
  for delete
  using (
    (auth.jwt() ->> 'sub') = user_id
  );
