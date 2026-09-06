import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type ProductSummary = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  image_url: string | null;
  serving_label: string;
  serving_weight: string;
  nutri_score: string | null;
  badges: string[];
  calories: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  additives: number;
  ingredients: number;
  alerts: number;
};

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [{ data: products }, { data: additives }, { data: ingredients }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: true }),
    supabase.from("additives").select("product_id"),
    supabase.from("ingredients").select("product_id, category"),
  ]);

  return (products ?? []).map((p) => ({
    ...p,
    badges: p.badges ?? [],
    additives: (additives ?? []).filter((a) => a.product_id === p.id).length,
    ingredients: (ingredients ?? []).filter((i) => i.product_id === p.id).length,
    alerts: (ingredients ?? []).filter((i) => i.product_id === p.id && i.category === "concern")
      .length,
  })) as ProductSummary[];
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!product) return null;

    const [additives, ingredients, nutrients, inspections] = await Promise.all([
      supabase
        .from("additives")
        .select("*")
        .eq("product_id", product.id)
        .order("position", { ascending: true }),
      supabase
        .from("ingredients")
        .select("*")
        .eq("product_id", product.id)
        .order("position", { ascending: true }),
      supabase
        .from("nutrients")
        .select("*")
        .eq("product_id", product.id)
        .order("position", { ascending: true }),
      supabase
        .from("inspections")
        .select("id, status, created_at")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return {
      product: { ...product, badges: product.badges ?? [] },
      additives: additives.data ?? [],
      ingredients: ingredients.data ?? [],
      nutrients: nutrients.data ?? [],
      inspections: inspections.data ?? [],
    };
  });

export const verifyProduct = createServerFn({ method: "POST" })
  .inputValidator((data: { productId: string }) => {
    if (typeof data?.productId !== "string" || data.productId.length < 10)
      throw new Error("Invalid product");
    return data;
  })
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("inspections")
      .insert({ product_id: data.productId, status: "verified" })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
