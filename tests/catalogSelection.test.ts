import { describe, expect, test } from "bun:test";
import { catalogSelection, catalogOrFilter, removeCatalogBrand, catalogBrandBranches } from "../supabase/functions/_shared/catalogSelection";

describe("catalog brand/model selection", () => {
  test("BMW and Audi are OR branches", () => {
    expect(catalogOrFilter(["bmw", "audi"], [])).toBe("brand_slug.eq.bmw,brand_slug.eq.audi");
  });
  test("BMW X5 restricts BMW while Audi stays unrestricted", () => {
    expect(catalogOrFilter(["bmw", "audi"], ["bmw:x5"])).toBe("and(brand_slug.eq.bmw,model_slug.in.(x5)),brand_slug.eq.audi");
  });
  test("same model slug is isolated to its brand", () => {
    expect(catalogBrandBranches(["bmw", "audi"], ["bmw:x5", "audi:a6"])).toEqual([{brand:"bmw", models:["x5"]}, {brand:"audi", models:["a6"]}]);
  });
  test("removing BMW removes only BMW models", () => {
    expect(removeCatalogBrand("bmw,audi", "bmw:x5,audi:a6", "bmw")).toEqual({brand:"audi", model:"audi:a6"});
  });
  test("legacy model links qualify against selected brands", () => {
    expect(catalogSelection("bmw", "x5")).toEqual({brands:["bmw"],models:["bmw:x5"]});
  });
  test("orphan pairs and query syntax are rejected", () => {
    expect(catalogSelection("bmw,audi),status.eq.sold", "audi:a6,bmw:x5")).toEqual({brands:["bmw"],models:["bmw:x5"]});
  });
});