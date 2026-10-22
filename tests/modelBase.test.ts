import { expect, test } from "bun:test";
import { normalizeModelBase } from "../supabase/functions/_shared/modelBase";
for (const [original, brand, base] of [
  ["X5 (G05)", "BMW", "X5"], ["Grandeur IG", "Hyundai", "Grandeur"], ["The New Grandeur IG", "Hyundai", "Grandeur"], ["Grandeur HG", "Hyundai", "Grandeur"],
  ["Sorento 4th Gen", "Kia", "Sorento"], ["All New Sorento", "Kia", "Sorento"], ["The New Carnival", "Kia", "Carnival"], ["Carnival 4th Gen", "Kia", "Carnival"],
  ["E-Class W213", "Mercedes-Benz", "E-Class"], ["The New Kia Ray", "Kia", "Ray"], ["Sonata (DN8)", "Hyundai", "Sonata"], ["K5 3rd Gen", "Kia", "K5"],
  ...["X5", "K5", "Q7", "GV80", "EV6"].map(v => [v, "", v]),
]) test(`${original} keeps base ${base}`, () => expect(normalizeModelBase(original, brand).model_base).toBe(base));