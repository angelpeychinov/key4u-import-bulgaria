import { describe, expect, test } from "bun:test";
import { priceKrwOr, PRICE_PLACEHOLDERS_WON } from "../supabase/functions/_shared/encarMaps";

describe("Encar price placeholders (만원)", () => {
  test("9999 is price on request", () => expect(priceKrwOr("9999")).toBeNull());
  test("99999 is price on request", () => expect(priceKrwOr(99999)).toBeNull());
  test("real prices convert 만원 to KRW", () => {
    expect(priceKrwOr("45000")).toBe(450000000);
    expect(priceKrwOr(19.99)).toBe(199900);
  });
  test("absent or zero price is null", () => {
    expect(priceKrwOr(0)).toBeNull();
    expect(priceKrwOr(null)).toBeNull();
    expect(priceKrwOr(undefined)).toBeNull();
  });
  test("placeholder list holds both values", () =>
    expect(PRICE_PLACEHOLDERS_WON).toEqual([9999, 99999]));
});
