import { expect, test } from "bun:test";
import { isEmptySavedSearch } from "./savedSearch";

test("zero favorites must not query the full catalog", () => {
  expect(isEmptySavedSearch({ ids: "" })).toBe(true);
});
test("saved cars remain searchable when IDs exist", () => {
  expect(isEmptySavedSearch({ ids: "42688779" })).toBe(false);
});
test("ordinary catalog is not an empty saved search", () => {
  expect(isEmptySavedSearch({})).toBe(false);
});