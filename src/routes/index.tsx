import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { Icon } from "@/components/Icon";
import { listProducts } from "@/lib/inspection.functions";

const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scan library — NutriAI label inspection" },
      {
        name: "description",
        content:
          "Every packaged product you have scanned, with additive counts, allergen alerts and Nutri-Score at a glance.",
      },
      { property: "og:title", content: "Scan library — NutriAI label inspection" },
      {
        property: "og:description",
        content: "Every scanned product with additive counts, allergen alerts and Nutri-Score.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Index,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-on-surface-variant">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-6">No scans yet.</div>,
});

const scoreTone: Record<string, string> = {
  A: "bg-primary-fixed text-on-primary-fixed",
  B: "bg-primary-fixed text-on-primary-fixed",
  C: "bg-tertiary-fixed text-on-tertiary-fixed",
  D: "bg-error-container text-on-error-container",
  E: "bg-error-container text-on-error-container",
};

function Index() {
  const { data: products } = useSuspenseQuery(productsQuery);

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans text-on-surface antialiased">
      <AppHeader title="NutriAI Scan Library" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-20 pb-12">
        <div className="mb-4 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-2 shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
            <span className="text-sm font-semibold text-primary">Live OCR Optical Pass</span>
          </span>
          <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            {products.length} Scanned
          </span>
        </div>

        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-on-surface-variant">
          Recent inspections
        </h2>

        <ul className="flex flex-col gap-3">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container-low">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon name="grocery" className="text-[26px] text-on-surface-variant" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    {p.brand}
                  </p>
                  <p className="truncate font-bold leading-snug text-on-surface">{p.name}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {p.calories} kcal · {p.additives} additives · {p.ingredients} ingredients
                    {p.alerts > 0 ? ` · ${p.alerts} alerts` : ""}
                  </p>
                </div>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                    scoreTone[p.nutri_score ?? ""] ?? "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {p.nutri_score ?? "?"}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-on-surface-variant">
          <Icon name="security" className="text-[14px]" />
          Double-verified against FDA &amp; EFSA databases
        </p>
      </main>
    </div>
  );
}
