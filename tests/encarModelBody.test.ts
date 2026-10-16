import { describe, expect, test } from "bun:test";
import { categoryBody, CATEGORY_BODY, mergeModelBody, pairKey, preserveBody } from "../supabase/functions/_shared/encarModelBody";
describe("Encar model body rules", () => {
 for (const [category, body] of Object.entries({ "경차":"hatchback", "소형차":"hatchback", "준중형차":"sedan", "중형차":"sedan", "대형차":"sedan", "스포츠카":"coupe", "SUV":"suv", "RV":"minivan", "승합차":"van", "경승합차":"van", "화물차":"truck", "경화물차":"truck" })) {
  test(category, () => expect(categoryBody(category, "model")).toBe(body));
 }
 test("small sedan exception", () => expect(categoryBody("소형차", "프라이드 세단")).toBe("sedan"));
 test("unknown category stays null", () => expect(categoryBody("알수없음", "model")).toBeNull());
 test("highest count wins", () => {
  const map = new Map();
  const candidate = { manufacturer:"기아", model:"test", category:"RV", body_type:CATEGORY_BODY.RV, category_count:10 };
  mergeModelBody(map, candidate);
  mergeModelBody(map, { ...candidate, category:"SUV", body_type:"suv", category_count:20 });
  mergeModelBody(map, { ...candidate, category_count:5 });
  expect(map.get(pairKey("기아", "test")).body_type).toBe("suv");
 });
 test("preserve detail body", () => expect(preserveBody("sedan", "convertible")).toBe("convertible"));
 test("fill missing body", () => expect(preserveBody("suv", null)).toBe("suv"));
});