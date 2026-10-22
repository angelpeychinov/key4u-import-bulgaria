/** Conservative generation removal; a lone model token is never stripped. */
export function normalizeModelBase(model: string | null | undefined, brand = "") {
  const original = (model ?? "").trim();
  let name = original.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefix = /^(?:(?:The New|All New|New|The|All)\s+)/i;
  let previous = "";
  while (previous !== name) {
    previous = name;
    name = name.replace(prefix, "");
    if (escapedBrand) name = name.replace(new RegExp(`^${escapedBrand}\\s+`, "i"), "");
  }
  previous = "";
  while (previous !== name) {
    previous = name;
    name = name.replace(/\s+(?:\d+(?:st|nd|rd|th)\s+Gen|Gen\s+\d+|Facelift)$/i, "");
    name = name.replace(/\s+[A-Z0-9]{2,4}$/, "");
  }
  name = name.trim() || original;
  return { model_base: name || null, model_base_slug: name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || null : null };
}