import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { Icon } from "@/components/Icon";
import { getProduct, verifyProduct } from "@/lib/inspection.functions";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProduct({ data: { slug } }),
  });

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — Label inspection` : "Product inspection details";
    const description = p
      ? `${p.brand} · ${p.calories} kcal per ${p.serving_label}. Additives, ingredients and nutrition explained in plain English.`
      : "Additives, ingredients and nutrition explained in plain English.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(p?.image_url
          ? [
              { property: "og:image", content: p.image_url },
              { name: "twitter:image", content: p.image_url },
            ]
          : []),
      ],
    };
  },
  component: ProductPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-on-surface-variant">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-6">That product isn't in your scan library.</div>,
});

const riskStyles: Record<string, { icon: string; chip: string }> = {
  safe: { icon: "check_circle", chip: "bg-primary-fixed text-on-primary-fixed" },
  regulated: { icon: "verified_user", chip: "bg-surface-container-highest text-on-surface-variant" },
  watch: { icon: "warning", chip: "bg-tertiary-fixed text-on-tertiary-fixed" },
};

const groups = [
  {
    key: "beneficial",
    label: "Beneficial / Useful",
    dot: "bg-primary",
    chip: "bg-primary-fixed text-on-primary-fixed",
  },
  {
    key: "neutral",
    label: "Functional / Neutral",
    dot: "bg-secondary",
    chip: "bg-surface-container-highest text-on-surface-variant",
  },
  {
    key: "concern",
    label: "Potential Concern / Allergens",
    dot: "bg-error",
    chip: "bg-error-container text-on-error-container",
  },
] as const;

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const queryClient = useQueryClient();
  const [openAdditive, setOpenAdditive] = useState<string | null>(null);
  const [showAllAdditives, setShowAllAdditives] = useState(false);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [openNutrient, setOpenNutrient] = useState<string | null>(null);

  const verify = useMutation({
    mutationFn: (productId: string) => verifyProduct({ data: { productId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product", slug] }),
  });

  if (!data) return null;
  const { product, additives, ingredients, nutrients, inspections } = data;

  const visibleAdditives = showAllAdditives ? additives : additives.slice(0, 3);
  const metrics = [
    { value: String(product.calories), unit: "", label: "Calories" },
    { value: String(product.carbs_g), unit: "g", label: "Carbs" },
    { value: String(product.protein_g), unit: "g", label: "Protein" },
    { value: String(product.fat_g), unit: "g", label: "Total Fat" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans text-on-surface antialiased">
      <AppHeader title="Product Inspection Details" backTo="/" />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-20 pb-14">
        {/* Context strip */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-2 shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
            <span className="text-sm font-semibold text-primary">Live OCR Optical Pass</span>
          </span>
          <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            {product.calibration}% Calibrated
          </span>
        </div>

        {/* Hero card */}
        <section className="mb-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container-low">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <Icon name="grocery" className="text-[30px] text-on-surface-variant" />
                </span>
              )}
              <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-surface-container-lowest/90 px-1 text-[9px] font-bold text-primary shadow-sm backdrop-blur-sm">
                <Icon name="document_scanner" className="text-[10px]" />
                {product.serving_weight}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                  {product.brand}
                </span>
                {product.ocr_verified ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-fixed px-1.5 py-0.5 text-[10px] font-bold text-on-primary-fixed">
                    <Icon name="verified" className="text-[12px]" />
                    Verified OCR
                  </span>
                ) : null}
              </div>
              <h2 className="mb-1 text-xl font-bold leading-snug text-on-surface">{product.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {product.badges.map((b) => (
                  <span
                    key={b}
                    className="rounded bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1 rounded-lg bg-surface-container-low/70 p-2 text-center">
            {metrics.map((m) => (
              <div key={m.label}>
                <span className="block text-lg font-extrabold text-on-surface">
                  {m.value}
                  <span className="text-xs font-bold">{m.unit}</span>
                </span>
                <span className="text-[11px] font-medium text-on-surface-variant">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Additives */}
        <section className="mb-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-on-surface">
              <Icon name="science" className="text-[20px] text-primary" />
              Additives &amp; Chemical Names
            </h3>
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
              {additives.length} Detected
            </span>
          </div>

          <p className="mb-3 flex gap-2 rounded-lg bg-surface-container-low p-3 text-xs leading-relaxed text-on-surface-variant">
            <Icon name="info" className="mt-0.5 text-[16px] text-secondary" />
            <span>
              Technical names converted to plain English. Chemical compounds are often standard
              culinary vitamins or natural minerals and are{" "}
              <strong className="font-bold text-on-surface">not automatically harmful</strong>.
            </span>
          </p>

          <ul className="flex flex-col gap-2">
            {visibleAdditives.map((a) => {
              const open = openAdditive === a.id;
              const tone = riskStyles[a.risk_level] ?? riskStyles["safe"]!;
              return (
                <li key={a.id} className="rounded-lg border border-outline-variant/60">
                  <button
                    type="button"
                    onClick={() => setOpenAdditive(open ? null : a.id)}
                    aria-expanded={open}
                    className="flex w-full items-start gap-3 p-3 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1 text-sm font-bold text-on-surface">
                        {a.technical_name}
                        <Icon name="arrow_right_alt" className="text-[16px] text-on-surface-variant" />
                        <span className="text-primary">{a.plain_name}</span>
                      </span>
                      <span className="mt-1 block text-xs text-on-surface-variant">
                        <strong className="font-semibold">Purpose:</strong> {a.purpose}
                      </span>
                    </span>
                    <Icon
                      name="expand_more"
                      className={`text-[20px] text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open ? (
                    <div className={`m-2 mt-0 flex gap-2 rounded-lg p-3 text-xs leading-relaxed ${tone.chip}`}>
                      <Icon name={tone.icon} className="mt-0.5 text-[16px]" />
                      <span>{a.detail}</span>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {additives.length > 3 ? (
            <button
              type="button"
              onClick={() => setShowAllAdditives((v) => !v)}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-surface-container py-2 text-sm font-bold text-primary"
            >
              {showAllAdditives ? "Show fewer additives" : `View All ${additives.length} Additives`}
              <Icon
                name={showAllAdditives ? "expand_less" : "arrow_forward"}
                className="text-[16px]"
              />
            </button>
          ) : null}
        </section>

        {/* Ingredients */}
        <section className="mb-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-on-surface">
              <Icon name="local_dining" className="text-[20px] text-primary" />
              Ingredients Breakdown
            </h3>
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
              {ingredients.length} Items Total
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {groups.map((g) => {
              const all = ingredients.filter((i) => i.category === g.key);
              if (all.length === 0) return null;
              const items = showAllIngredients ? all : all.slice(0, 3);
              return (
                <div key={g.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-bold text-on-surface">
                      <span className={`h-2 w-2 rounded-full ${g.dot}`} />
                      {g.label}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${g.chip}`}>
                      {g.key === "concern"
                        ? `${all.length} Alert${all.length === 1 ? "" : "s"}`
                        : `${all.length} Ingredient${all.length === 1 ? "" : "s"}`}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {items.map((i) => (
                      <li key={i.id} className="rounded-lg bg-surface-container-low p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-bold text-on-surface">{i.name}</span>
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${g.chip}`}>
                            {i.tag}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                          {i.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowAllIngredients((v) => !v)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-surface-container py-2 text-sm font-bold text-primary"
          >
            {showAllIngredients
              ? "Show fewer ingredients"
              : `View All Ingredients (${ingredients.length})`}
            <Icon
              name={showAllIngredients ? "expand_less" : "arrow_forward"}
              className="text-[16px]"
            />
          </button>
        </section>

        {/* Nutrition */}
        <section className="mb-5 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-on-surface">
              <Icon name="bar_chart" className="text-[20px] text-primary" />
              Nutritional Blueprint
            </h3>
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
              Per {product.serving_label}
            </span>
          </div>

          <ul className="flex flex-col gap-2">
            {nutrients.map((n) => {
              const open = openNutrient === n.id;
              return (
                <li key={n.id} className="rounded-lg bg-surface-container-low p-3">
                  <button
                    type="button"
                    onClick={() => setOpenNutrient(open ? null : n.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span className="text-sm font-bold text-on-surface">
                      {n.label}{" "}
                      <span className="font-medium text-on-surface-variant">
                        {n.amount} {n.note ?? ""}
                      </span>
                    </span>
                    <span className="shrink-0 rounded bg-surface-container px-1.5 py-0.5 text-[11px] font-bold text-on-surface-variant">
                      {n.dv_percent === null ? "DV N/A" : `${n.dv_percent}% DV`}
                    </span>
                  </button>
                  {n.dv_percent !== null ? (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, n.dv_percent)}%` }}
                      />
                    </div>
                  ) : null}
                  {open ? (
                    <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                      <strong className="font-semibold text-on-surface">Why it matters:</strong>{" "}
                      {n.why_it_matters}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Verification */}
        <button
          type="button"
          disabled={verify.isPending}
          onClick={() => verify.mutate(product.id)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60"
        >
          {verify.isPending ? "Verifying…" : "Proceed to Verification"}
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>

        {inspections.length > 0 ? (
          <div className="mt-4 rounded-xl bg-surface-container-low p-3">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Verification log
            </p>
            <ul className="flex flex-col gap-1">
              {inspections.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center gap-1.5 text-xs text-on-surface-variant"
                >
                  <Icon name="task_alt" className="text-[14px] text-primary" />
                  Verified on {new Date(i.created_at).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-on-surface-variant">
          <Icon name="security" className="text-[14px]" />
          Double-verified against FDA &amp; EFSA databases
        </p>
      </main>
    </div>
  );
}
