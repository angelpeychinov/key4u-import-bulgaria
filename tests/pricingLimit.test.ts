import { describe, expect, test } from "bun:test";
import { filteredPriceMax, hasCalculatedPrice, resolveMaxPricedKrw } from "../supabase/functions/_shared/pricingLimit";

describe("Temporary expensive-car pricing", () => {
  test("missing config falls back to 100M KRW", () => {
    expect(resolveMaxPricedKrw(undefined)).toBe(100000000);
    expect(resolveMaxPricedKrw(NaN)).toBe(100000000);
  });
  test("above 100M is on request, while exactly 100M and 50M remain priced", () => {
    expect(hasCalculatedPrice(100000001, 100000000)).toBe(false);
    expect(hasCalculatedPrice(100000000, 100000000)).toBe(true);
    expect(hasCalculatedPrice(50000000, 100000000)).toBe(true);
  });
  test("editable config changes the cutoff", () => {
    const limit = resolveMaxPricedKrw(150000000);
    expect(limit).toBe(150000000);
    expect(hasCalculatedPrice(120000000, limit)).toBe(true);
  });
  test("EUR minimum-only filters cap at 100M", () => {
    expect(filteredPriceMax(10000, undefined, null, 100000000)).toBe(100000000);
  });
  test("EUR maximum filters cap at 100M and retain tighter bounds", () => {
    expect(filteredPriceMax(undefined, 500000, 700000000, 100000000)).toBe(100000000);
    expect(filteredPriceMax(undefined, 30000, 35000000, 100000000)).toBe(35000000);
  });
  test("unfiltered price sorting has no ceiling", () => {
    expect(filteredPriceMax(undefined, undefined, null, 100000000)).toBeNull();
  });
});