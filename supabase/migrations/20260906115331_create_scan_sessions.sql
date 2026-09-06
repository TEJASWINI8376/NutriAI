/*
# Create NutriAI scan sessions

1. New Tables
- `scan_sessions` stores the current analysis session so pause, resume, cancel, and progress survive reloads.
- `id` uniquely identifies a session.
- `progress` stores the visible completion percentage from 0 to 100.
- `is_paused` stores whether analysis is paused.
- `status` stores the current lifecycle state: active, paused, complete, or cancelled.
- `created_at` and `updated_at` store session timestamps.

2. Security
- Row-level security is enabled.
- This is a deliberately single-tenant, no-sign-in experience, so the anon and authenticated roles can use the shared session record.
- Separate policies cover select, insert, update, and delete operations.

3. Important Notes
- The table uses a stable single-row pattern in the client so the app restores the latest session after refresh.
- No user identity or personal data is stored.
*/

CREATE TABLE IF NOT EXISTS public.scan_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_paused boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'complete', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view scan sessions" ON public.scan_sessions;
CREATE POLICY "Public can view scan sessions" ON public.scan_sessions
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can create scan sessions" ON public.scan_sessions;
CREATE POLICY "Public can create scan sessions" ON public.scan_sessions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update scan sessions" ON public.scan_sessions;
CREATE POLICY "Public can update scan sessions" ON public.scan_sessions
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete scan sessions" ON public.scan_sessions;
CREATE POLICY "Public can delete scan sessions" ON public.scan_sessions
  FOR DELETE TO anon, authenticated USING (true);
