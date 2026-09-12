-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  brand text NOT NULL,
  name text NOT NULL,
  image_url text,
  serving_label text NOT NULL DEFAULT '1 Serving',
  serving_weight text NOT NULL DEFAULT '',
  nutri_score text,
  badges text[] NOT NULL DEFAULT '{}',
  ocr_verified boolean NOT NULL DEFAULT true,
  calibration integer NOT NULL DEFAULT 100,
  calories integer NOT NULL DEFAULT 0,
  carbs_g numeric NOT NULL DEFAULT 0,
  protein_g numeric NOT NULL DEFAULT 0,
  fat_g numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.additives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  technical_name text NOT NULL,
  plain_name text NOT NULL,
  purpose text NOT NULL,
  detail text NOT NULL,
  risk_level text NOT NULL DEFAULT 'safe',
  position integer NOT NULL DEFAULT 0
);

CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  tag text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'neutral',
  position integer NOT NULL DEFAULT 0
);

CREATE TABLE public.nutrients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label text NOT NULL,
  amount text NOT NULL,
  note text,
  dv_percent integer,
  why_it_matters text NOT NULL,
  position integer NOT NULL DEFAULT 0
);

CREATE TABLE public.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'verified',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.additives TO anon, authenticated;
GRANT SELECT ON public.ingredients TO anon, authenticated;
GRANT SELECT ON public.nutrients TO anon, authenticated;
GRANT SELECT, INSERT ON public.inspections TO anon, authenticated;
GRANT ALL ON public.products, public.additives, public.ingredients, public.nutrients, public.inspections TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.additives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are public" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Additives are public" ON public.additives FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Ingredients are public" ON public.ingredients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Nutrients are public" ON public.nutrients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Inspections are public" ON public.inspections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can log an inspection" ON public.inspections FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Seed: reference product
INSERT INTO public.products (id, slug, brand, name, image_url, serving_label, serving_weight, nutri_score, badges, calories, carbs_g, protein_g, fat_g)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'organic-whole-grain-granola-bar',
  'Nature''s Path',
  'Organic Whole Grain Granola Bar',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBcflvzRQAx4VqtE9MvZNHAS4pRRbXW0A1MiKH0CElp1-_9OMlnSzqmDMNdHzmxhl5j68Z2zYb_r2gCJrQKpxPy98aofCxIu0U_5QHC2AmsshZHKG5MNJJAo1BYdz_WQVLB3aYVTX6KcKu5XqnlL2n0NG6oJIgkXT62_25bBF9NDAD1YsYb_fSTjl5d5Xt1-eUkfImF0SuF2yifLXcK25Bwrj5hYUx0v7AjdYQjRbirLlPnM1j9ZqUS',
  '1 Bar (40g)', '40g', 'A', ARRAY['Nutri-Score: A','USDA Organic'], 190, 24, 4, 9
);

INSERT INTO public.additives (product_id, technical_name, plain_name, purpose, detail, risk_level, position) VALUES
('11111111-1111-1111-1111-111111111111','Ascorbic Acid','Vitamin C (Antioxidant)','Preserves natural crispness and freshness.','Safe, water-soluble antioxidant naturally found in citrus fruits. Essential for immune health; halts food oxidation without synthetic residues.','safe',1),
('11111111-1111-1111-1111-111111111111','Sodium Benzoate','Preservative','Prevents bacterial yeast growth in moist environments.','Regulated FDA safe standard. Widely employed in low quantities to ensure long pantry stability and protect against microbial fermentation.','regulated',2),
('11111111-1111-1111-1111-111111111111','Citric Acid','Acidity Regulator','Enhances natural flavor and controls acidity balance.','Derived organically from citrus fermentation. Rebalances natural tartness and safeguards micronutrient integrity.','safe',3),
('11111111-1111-1111-1111-111111111111','Tocopherols (Mixed)','Vitamin E (Antioxidant)','Protects natural oils from turning rancid.','Naturally occurring fat-soluble antioxidant extracted from plant oils. Keeps nut and seed lipids fresh without synthetic preservatives.','safe',4),
('11111111-1111-1111-1111-111111111111','Soy Lecithin','Natural Emulsifier','Keeps oils and dry ingredients evenly blended.','Plant-derived phospholipid used in small amounts. Generally recognised as safe, though it is a soy-derived allergen for sensitive profiles.','regulated',5),
('11111111-1111-1111-1111-111111111111','Sodium Bicarbonate','Baking Soda (Leavening)','Creates a light, even texture during baking.','Simple mineral salt that releases carbon dioxide when heated. Long-standing culinary staple with no known concerns at food levels.','safe',6),
('11111111-1111-1111-1111-111111111111','Natural Flavour','Flavour Compound','Rounds out the toasted grain and nut aroma.','Umbrella term for plant or fermentation derived aroma extracts. Composition is not itemised on the label, so exact sources are unspecified.','watch',7),
('11111111-1111-1111-1111-111111111111','Calcium Carbonate','Mineral Fortifier','Adds supplemental dietary calcium.','Common mineral fortificant identical to that used in supplements. Supports bone density; very high intakes are only a concern in supplement doses.','safe',8);

INSERT INTO public.ingredients (product_id, name, tag, description, category, position) VALUES
('11111111-1111-1111-1111-111111111111','Rolled Oats*','Whole Grain','Whole grain soluble beta-glucan fiber beneficial for cardiovascular health.','beneficial',1),
('11111111-1111-1111-1111-111111111111','Flax Seeds*','Omega-3 Rich','Potent plant-based ALA fatty acids and natural lignans supporting cellular vitality.','beneficial',2),
('11111111-1111-1111-1111-111111111111','Almonds*','Bio-Protein','Clean plant protein, monounsaturated fats, and cellular Vitamin E protection.','beneficial',3),
('11111111-1111-1111-1111-111111111111','Sunflower Oil*','Carrier Fat','Provides crisp culinary mouthfeel and heat dispersion during gentle baking.','neutral',4),
('11111111-1111-1111-1111-111111111111','Brown Rice Syrup*','Binding Agent','Natural grain binder providing structural chew and gradual carb breakdown.','neutral',5),
('11111111-1111-1111-1111-111111111111','Sea Salt','Flavor Balance','Natural electrolyte mineral crystals used sparingly to balance sweetness.','neutral',6),
('11111111-1111-1111-1111-111111111111','Shredded Coconut*','Texture Fiber','Adds chew and insoluble fiber alongside naturally occurring saturated plant fats.','neutral',7),
('11111111-1111-1111-1111-111111111111','Cinnamon*','Aromatic Spice','Warm aromatic spice with polyphenols; used in culinary trace amounts.','neutral',8),
('11111111-1111-1111-1111-111111111111','Added Sugars (7g)','Glycemic Alert','Higher glycemic spike threshold; caution advised if strictly monitoring daily insulin or keto profile.','concern',9),
('11111111-1111-1111-1111-111111111111','Almond & Coconut','Major Allergen','Tree nut allergen presence. Strictly cross-checked against your profile allergen preferences.','concern',10);

INSERT INTO public.nutrients (product_id, label, amount, note, dv_percent, why_it_matters, position) VALUES
('11111111-1111-1111-1111-111111111111','Calories','190 kcal',NULL,10,'Provides balanced sustained physical energy for mid-day fuel.',1),
('11111111-1111-1111-1111-111111111111','Sugar','8g','(7g added)',14,'Quick fuel source; moderate level, monitor if tracking daily glycemic limits.',2),
('11111111-1111-1111-1111-111111111111','Protein','4g',NULL,8,'Helps support cellular repair and maintains muscular amino reserves.',3),
('11111111-1111-1111-1111-111111111111','Carbohydrates','24g',NULL,9,'Primary dietary energy from unrefined whole rolled grains and seed hulls.',4),
('11111111-1111-1111-1111-111111111111','Total Fat','9g',NULL,12,'Provides steady satiety; mostly healthy unsaturated plant lipids from organic nuts.',5),
('11111111-1111-1111-1111-111111111111','Saturated Fat','1.5g',NULL,8,'Low saturated fat profile largely from organic shredded coconut flakes.',6),
('11111111-1111-1111-1111-111111111111','Sodium','65mg',NULL,3,'Very low sodium content, completely safe for blood pressure and heart goals.',7),
('11111111-1111-1111-1111-111111111111','Serving Size','1 Bar (40g) Package',NULL,NULL,'Reference amount used for every value shown on this inspection sheet.',8);

-- Second seeded product for the scan library
INSERT INTO public.products (id, slug, brand, name, image_url, serving_label, serving_weight, nutri_score, badges, calories, carbs_g, protein_g, fat_g)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'sparkling-citrus-energy-drink',
  'Volt Botanics',
  'Sparkling Citrus Energy Drink',
  NULL,
  '1 Can (330ml)', '330ml', 'C', ARRAY['Nutri-Score: C','High Caffeine'], 110, 27, 0, 0
);

INSERT INTO public.additives (product_id, technical_name, plain_name, purpose, detail, risk_level, position) VALUES
('22222222-2222-2222-2222-222222222222','Caffeine Anhydrous','Stimulant','Delivers the alerting energy effect.','Concentrated dehydrated caffeine. Safe within roughly 400mg daily for adults, but stacks quickly across coffee, tea and energy drinks.','watch',1),
('22222222-2222-2222-2222-222222222222','Acesulfame Potassium','Sweetener (Ace-K)','Sweetens without adding sugar calories.','Approved high-intensity sweetener. Stable and calorie-free; some people report a lingering aftertaste.','regulated',2),
('22222222-2222-2222-2222-222222222222','Phosphoric Acid','Acidity Regulator','Adds tang and preserves the fizz profile.','Common in soft drinks. High habitual intake is associated with lower calcium retention, so moderation matters.','watch',3);

INSERT INTO public.ingredients (product_id, name, tag, description, category, position) VALUES
('22222222-2222-2222-2222-222222222222','Carbonated Water','Base','Plain sparkling water forming the bulk of the drink.','neutral',1),
('22222222-2222-2222-2222-222222222222','Green Tea Extract','Antioxidant','Natural polyphenols alongside a mild caffeine contribution.','beneficial',2),
('22222222-2222-2222-2222-222222222222','Citrus Juice Concentrate','Flavour','Provides natural citrus character and a little vitamin C.','beneficial',3),
('22222222-2222-2222-2222-222222222222','Cane Sugar (26g)','Glycemic Alert','High free-sugar load in a single can; a large share of a daily limit.','concern',4);

INSERT INTO public.nutrients (product_id, label, amount, note, dv_percent, why_it_matters, position) VALUES
('22222222-2222-2222-2222-222222222222','Calories','110 kcal',NULL,6,'Energy comes almost entirely from added sugar rather than nutrients.',1),
('22222222-2222-2222-2222-222222222222','Sugar','27g','(26g added)',52,'Over half a typical daily added-sugar allowance in one can.',2),
('22222222-2222-2222-2222-222222222222','Caffeine','160mg',NULL,NULL,'Roughly two espressos; consider timing if you are sensitive to sleep disruption.',3),
('22222222-2222-2222-2222-222222222222','Sodium','45mg',NULL,2,'Low sodium, no meaningful impact on blood pressure goals.',4);