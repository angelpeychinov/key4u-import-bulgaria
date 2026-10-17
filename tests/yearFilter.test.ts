import { describe, expect, test } from "bun:test";
import { isCompleteYearInput, normalizeYearInput, yearPresets } from "../src/lib/yearFilter";

describe("catalog year inputs", () => {
  test("presets include every year from the current year to 2000 newest first", () => {
    expect(yearPresets(2026)).toEqual(Array.from({ length: 27 }, (_, i) => 2026 - i));
    expect(yearPresets(2027)[0]).toBe(2027);
  });

  test("only four-digit years or a cleared field are applied", () => {
    expect(normalizeYearInput("20a26!9")).toBe("2026");
    expect(isCompleteYearInput("2026")).toBe(true);
    expect(isCompleteYearInput("2000")).toBe(true);
    expect(isCompleteYearInput("202")).toBe(false);
    expect(isCompleteYearInput("20267")).toBe(false);
    expect(isCompleteYearInput("abcd")).toBe(false);
    expect(isCompleteYearInput("")).toBe(true);
  });
});