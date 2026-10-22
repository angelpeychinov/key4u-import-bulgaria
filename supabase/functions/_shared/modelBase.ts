/** Conservative generation removal; a lone model token is never stripped. */
export function normalizeModelBase(model: string | null | undefined, brand = "", standaloneModels: readonly string[] = []) {
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
  if (brand.trim().toLowerCase() === "hyundai" && name.toLowerCase() === "grand starex") name = "Starex";
  const known = new Map(standaloneModels.map(value => [value.trim().toLowerCase(), value.trim()]));
  // Preserve an established full model name before considering its shorter prefixes.
  if (!known.has(name.toLowerCase())) {
    const withoutCode = name.replace(/^[A-Z]{2}\s+/, "");
    if (withoutCode !== name && known.has(withoutCode.toLowerCase())) {
      name = known.get(withoutCode.toLowerCase()) ?? name;
    } else {
      const words = name.split(" ");
      for (let length = words.length - 1; length > 0; length--) {
        const canonical = known.get(words.slice(0, length).join(" ").toLowerCase());
        if (canonical) { name = canonical; break; }
      }
    }
  }
  return { model_base: name || null, model_base_slug: name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || null : null };
}

/** Small exact-name lookup set; never load the catalog to infer standalone models. */
export function modelBaseCandidates(model: string | null | undefined, brand = ""): string[] {
  const name = normalizeModelBase(model, brand).model_base;
  if (!name) return [];
  const words = name.split(" ");
  return [...new Set([name, name.replace(/^[A-Z]{2}\s+/, ""), ...words.slice(1).map((_, index) => words.slice(0, index + 1).join(" "))])];
}