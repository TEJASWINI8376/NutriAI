/*
# Create NutriAI scan history

1. New Tables
- `scan_history` stores each product scan shown in the Recent Scans section.
- `id` is the durable row identifier.
- `product_name` stores the product display name.
- `brand` stores the product brand.
- `grade` stores the health grade label.
- `health_score` stores the numeric health score.
- `image_url` stores the product thumbnail URL.
- `scanned_at` stores when the scan was created.

2. Security
- Row Level Security is enabled.
- This is an intentionally shared, no-sign-in app, so anon and authenticated clients can read and write scan history.
- Separate policies cover SELECT, INSERT, UPDATE, and DELETE.

3. Important Notes
- Existing rows are preserved.
- The table is designed for the scanner's recent-results workflow.
*/

CREATE TABLE IF NOT EXISTS public.scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  brand text NOT NULL,
  grade text NOT NULL,
  health_score integer NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  image_url text NOT NULL,
  scanned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read scan history" ON public.scan_history;
CREATE POLICY "Public can read scan history"
  ON public.scan_history FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can create scan history" ON public.scan_history;
CREATE POLICY "Public can create scan history"
  ON public.scan_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update scan history" ON public.scan_history;
CREATE POLICY "Public can update scan history"
  ON public.scan_history FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete scan history" ON public.scan_history;
CREATE POLICY "Public can delete scan history"
  ON public.scan_history FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS scan_history_scanned_at_idx
  ON public.scan_history (scanned_at DESC);
