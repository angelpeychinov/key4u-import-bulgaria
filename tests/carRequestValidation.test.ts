import { expect, mock, test } from "bun:test";
import { z } from "zod";
mock.module("npm:zod@3.25.76", () => ({ z }));
const { requestSchema } = await import("../supabase/functions/send-car-request/request");
const listing = { title: "BMW X5 2022", mileage: 12345, encarId: "42733720", encarUrl: "https://www.encar.com/dc/dc_cardetailview.do?carid=42733720", siteUrl: "https://key4u.bg/car-search?listing=42733720", priceKrw: 50000000, estimatedTotalEur: 39220 };
const base = { name: "Test", phone: "0000000000", model: listing.title, listing, consent: true };
test("listing inquiry permits omitted email", () => {
  expect(requestSchema.safeParse(base).success).toBe(true);
  expect(requestSchema.safeParse({ ...base, email: "" }).success).toBe(true);
});
test("name and phone are required", () => {
  expect(requestSchema.safeParse({ ...base, name: "" }).success).toBe(false);
  expect(requestSchema.safeParse({ ...base, phone: "" }).success).toBe(false);
});
test("invalid optional email and oversize listing title rejected", () => {
  expect(requestSchema.safeParse({ ...base, email: "invalid" }).success).toBe(false);
  expect(requestSchema.safeParse({ ...base, listing: { ...listing, title: "a".repeat(301) } }).success).toBe(false);
});
test("listing URLs and numeric prices are validated", () => {
  expect(requestSchema.safeParse({ ...base, listing: { ...listing, siteUrl: "https://example.com/car-search" } }).success).toBe(false);
  expect(requestSchema.safeParse({ ...base, listing: { ...listing, priceKrw: -1 } }).success).toBe(false);
});
test("original Find Car form still requires email", () => {
  expect(requestSchema.safeParse({ name: "Test", phone: "0000000000", model: "BMW" }).success).toBe(false);
  expect(requestSchema.safeParse({ name: "Test", phone: "0000000000", model: "BMW", consent: true, email: "key4u.import@gmail.com" }).success).toBe(true);
});
test("origin accepts only the four allowed values and needs at least one", () => {
  const base = { name: "Test", phone: "0000000000", model: "BMW", consent: true, email: "key4u.import@gmail.com" };
  expect(requestSchema.safeParse({ ...base, origin: ["canada", "usa"] }).success).toBe(true);
  expect(requestSchema.safeParse({ ...base, origin: ["any"] }).success).toBe(true);
  expect(requestSchema.safeParse({ ...base, origin: ["canada", "usa", "south-korea", "any"] }).success).toBe(true);
  expect(requestSchema.safeParse({ ...base, origin: ["korea"] }).success).toBe(false);
  expect(requestSchema.safeParse({ ...base, origin: [] }).success).toBe(false);
});
test("inquiries accept new listing pages and reject unrelated site paths", () => {
  expect(requestSchema.safeParse({ ...base, listing: { ...listing, siteUrl: "https://key4u.bg/kola/bmw-x5-2022-42733720" } }).success).toBe(true);
  expect(requestSchema.safeParse({ ...base, listing: { ...listing, siteUrl: "https://key4u.bg/contact" } }).success).toBe(false);
});

test("both forms accept affirmative consent but reject false and string values", () => {
  for (const request of [base, { name: "Test", phone: "0000000000", model: "BMW", email: "key4u.import@gmail.com" }]) {
    expect(requestSchema.safeParse({ ...request, consent: true }).success).toBe(true);
    for (const consent of [false, "true"]) {
      expect(requestSchema.safeParse({ ...request, consent }).success).toBe(false);
    }
  }
});
test("previously published forms remain compatible until the site update is published", () => {
  expect(requestSchema.safeParse({ ...base, consent: undefined }).success).toBe(true);
});
