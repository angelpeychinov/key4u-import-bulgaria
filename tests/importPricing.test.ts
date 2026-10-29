import { describe, expect, test } from "bun:test";
import { calculateKoreaImportPrice, isOversizeVehicle, OVERSIZE_MODELS } from "../supabase/functions/_shared/importPricing";

describe("Owner-approved oversize pricing", () => {
  for (const [brand, models] of Object.entries(OVERSIZE_MODELS)) {
    for (const model of models) test(`${brand} ${model} is oversize without engine data`, () => {
      expect(isOversizeVehicle({ brand_name: brand.toUpperCase(), model_base: model.toLowerCase(), engine_cc: null })).toBe(true);
    });
  }
  test("Palisade and X5 add exactly 350 sea and 250 domestic, 600 total", () => {
    const normal = calculateKoreaImportPrice(30000000, false);
    for (const car of [{ brand_name: "Hyundai", model_base: "Palisade" }, { brand_name: "BMW", model_base: "X5" }]) {
      const large = calculateKoreaImportPrice(30000000, isOversizeVehicle(car));
      expect(large.price - normal.price).toBe(350);
      expect(large.transport - normal.transport).toBe(250);
      expect(large.total - normal.total).toBe(600);
    }
  });
  test("Avante and Elantra remain normal", () => {
    for (const model_base of ["Avante", "Elantra"]) expect(isOversizeVehicle({ brand_name: "Hyundai", model_base, body_type: "sedan", engine_cc: null })).toBe(false);
  });
  test("missing base falls back to original model containment, not another brand", () => {
    expect(isOversizeVehicle({ brand_name: "BMW", model_name: "X5 (G05)" })).toBe(true);
    expect(isOversizeVehicle({ brand_name: "Hyundai", model_name: "The New Palisade" })).toBe(true);
    expect(isOversizeVehicle({ brand_name: "Hyundai", model_base: "Avante", model_name: "X5" })).toBe(false);
    expect(isOversizeVehicle({ brand_name: "Kia", model_base: "X5" })).toBe(false);
  });
  test("brand slugs and KG Mobility aliases work", () => {
    expect(isOversizeVehicle({ brand_slug: "mercedes-benz", model_base: "GLE" })).toBe(true);
    expect(isOversizeVehicle({ brand_name: "KG Mobility", model_base: "Torres" })).toBe(true);
    expect(isOversizeVehicle({ brand_name: "SsangYong", model_base: "Rexton" })).toBe(true);
  });
  test("existing body and engine rules remain", () => {
    for (const body_type of ["pickup", "truck", "van", "minivan"]) expect(isOversizeVehicle({ body_type })).toBe(true);
    expect(isOversizeVehicle({ body_type: "suv", engine_cc: 2001 })).toBe(true);
    expect(isOversizeVehicle({ body_type: "suv", engine_cc: 2000 })).toBe(false);
  });
});