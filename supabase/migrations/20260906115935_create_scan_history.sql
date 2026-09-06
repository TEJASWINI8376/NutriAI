/*
# Create shared NutriAI scan history

1. New Tables
- `scan_history` stores each completed food-label analysis.
- `id` uniquely identifies the saved scan.
- `food_name` stores the detected food name.
- `allergens` stores a short, display-ready allergen summary.
- `confidence` stores the analysis confidence percentage.
- `created_at` stores when the scan was saved.

2. Security
- Row level security is enabled.
- This prototype intentionally has no sign-in screen, so scan history is shared between anonymous and authenticated app visitors.
- Separate policies allow reading, creating, editing, and deleting shared scan records.

3. Notes
- The table is intentionally small and contains no sensitive personal data.
- The `created_at` index supports newest-first history loading.
*/

CREATE TABLE IF NOT EXISTS public.scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name text NOT NULL,
  allergens text NOT NULL DEFAULT 'None detected',
  confidence integer NOT NULL DEFAULT 94 CHECK (confidence BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS scan_history_created_at_idx
  ON public.scan_history (created_at DESC);

DROP POLICY IF EXISTS "Anyone can view shared scan history" ON public.scan_history;
CREATE POLICY "Anyone can view shared scan history"
  ON public.scan_history FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can create shared scans" ON public.scan_history;
CREATE POLICY "Anyone can create shared scans"
  ON public.scan_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update shared scans" ON public.scan_history;
CREATE POLICY "Anyone can update shared scans"
  ON public.scan_history FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete shared scans" ON public.scan_history;
CREATE POLICY "Anyone can delete shared scans"
  ON public.scan_history FOR DELETE
  TO anon, authenticated
  USING (true);