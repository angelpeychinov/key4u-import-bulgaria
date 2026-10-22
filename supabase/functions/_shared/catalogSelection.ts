/** Qualified model keys keep identically named models from different brands separate. */
export const selectionValues = (csv?: string | null): string[] =>
  [...new Set((csv ?? "").split(",").map((v) => v.trim().toLowerCase()).filter(Boolean))];

export const catalogSelection = (brand?: string | null, model?: string | null) => {
  const brands = selectionValues(brand).filter((v) => /^[a-z0-9-]{1,100}$/.test(v)).slice(0, 50);
  const models = selectionValues(model).flatMap((v) => {
    if (/^[a-z0-9-]{1,100}$/.test(v)) return brands.map((b) => `${b}:${v}`);
    const [b, m, extra] = v.split(":");
    return !extra && brands.includes(b) && /^[a-z0-9-]{1,100}$/.test(m ?? "") ? [v] : [];
  }).slice(0, 200);
  return { brands, models: [...new Set(models)] };
};

export const removeCatalogBrand = (brand: string | undefined, model: string | undefined, removed: string) => {
  const selection = catalogSelection(brand, model);
  return {
    brand: selection.brands.filter((b) => b !== removed).join(","),
    model: selection.models.filter((m) => !m.startsWith(`${removed}:`)).join(","),
  };
};

export const catalogBrandBranches = (brands: string[], models: string[]) => brands.map((brand) => ({
  brand,
  models: models.filter((m) => m.startsWith(`${brand}:`)).map((m) => m.slice(brand.length + 1)),
}));

export const catalogOrFilter = (brands: string[], models: string[], column: "model_slug" | "model_base_slug" = "model_slug") =>
  catalogBrandBranches(brands, models).map(({ brand, models: selected }) => selected.length
    ? `and(brand_slug.eq.${brand},${column}.in.(${selected.join(",")}))`
    : `brand_slug.eq.${brand}`).join(",");