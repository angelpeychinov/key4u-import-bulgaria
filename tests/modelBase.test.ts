import { expect, test } from "bun:test";
import { modelBaseCandidates, normalizeModelBase } from "../supabase/functions/_shared/modelBase";
for (const [original, brand, base] of [
  ["X5 (G05)", "BMW", "X5"], ["Grandeur IG", "Hyundai", "Grandeur"], ["The New Grandeur IG", "Hyundai", "Grandeur"], ["Grandeur HG", "Hyundai", "Grandeur"],
  ["Sorento 4th Gen", "Kia", "Sorento"], ["All New Sorento", "Kia", "Sorento"], ["The New Carnival", "Kia", "Carnival"], ["Carnival 4th Gen", "Kia", "Carnival"],
  ["E-Class W213", "Mercedes-Benz", "E-Class"], ["The New Kia Ray", "Kia", "Ray"], ["Sonata (DN8)", "Hyundai", "Sonata"], ["K5 3rd Gen", "Kia", "K5"],
  ...["X5", "K5", "Q7", "GV80", "EV6"].map(v => [v, "", v]),
]) test(`${original} keeps base ${base}`, () => expect(normalizeModelBase(original, brand).model_base).toBe(base));

for (const code of ["LF", "YF", "NF", "EF"]) test(`${code} Sonata uses the standalone Hyundai model`, () => {
  expect(normalizeModelBase(`${code} Sonata`, "Hyundai", ["Sonata"]).model_base).toBe("Sonata");
});
for (const code of ["HD", "MD"]) test(`${code} Avante uses the standalone Hyundai model`, () => {
  expect(normalizeModelBase(`${code} Avante`, "Hyundai", ["Avante"]).model_base).toBe("Avante");
});
test("leading code stays without same-brand standalone evidence", () => {
  expect(normalizeModelBase("LF Sonata", "Hyundai", ["Avante"]).model_base).toBe("LF Sonata");
});
test("other models support leading two-letter codes", () => {
  expect(normalizeModelBase("AB Civic", "Honda", ["Civic"]).model_base).toBe("Civic");
});
for (const name of ["Grand Starex", "The New Grand Starex", "Starex"]) test(`Hyundai ${name} maps to Starex`, () => {
  expect(normalizeModelBase(name, "Hyundai").model_base).toBe("Starex");
});
test("Starex alias is Hyundai-only", () => {
  expect(normalizeModelBase("Grand Starex", "Other").model_base).toBe("Grand Starex");
});
test("Morning Urban (JA) collapses only with standalone Morning", () => {
  expect(normalizeModelBase("Morning Urban (JA)", "Kia", ["Morning"]).model_base).toBe("Morning");
});
test("Morning Urban survives without standalone Morning", () => {
  expect(normalizeModelBase("Morning Urban (JA)", "Kia", ["Ray"]).model_base).toBe("Morning Urban");
});
test("an established longer standalone model is not shortened", () => {
  expect(normalizeModelBase("Morning Urban (JA)", "Kia", ["Morning", "Morning Urban"]).model_base).toBe("Morning Urban");
});
test("subnames prefer the longest known standalone prefix", () => {
  expect(normalizeModelBase("Grand Cherokee Limited", "Jeep", ["Grand", "Grand Cherokee"]).model_base).toBe("Grand Cherokee");
});
test("lowercase or three-letter leading tokens are not generation codes", () => {
  expect(normalizeModelBase("lf Sonata", "Hyundai", ["Sonata"]).model_base).toBe("lf Sonata");
  expect(normalizeModelBase("ABC Sonata", "Hyundai", ["Sonata"]).model_base).toBe("ABC Sonata");
});
test("lookup candidates contain exact model and subname prefixes", () => {
  expect(modelBaseCandidates("LF Sonata (DN8)", "Hyundai")).toEqual(["LF Sonata", "Sonata", "LF"]);
  expect(modelBaseCandidates("Morning Urban (JA)", "Kia")).toEqual(["Morning Urban", "Morning"]);
});