import { z } from "npm:zod@3.25.76";

const text = (max: number) => z.string().trim().max(max);
const httpsUrl = text(2000).url().refine((value) => new URL(value).protocol === "https:", "HTTPS URL required");
export const requestSchema = z.object({
  name: text(100).min(1),
  phone: text(20).min(1),
  email: z.union([text(255).email(), z.literal("")]).optional(),
  model: text(300).min(1),
  year: text(4).optional(), color: text(50).optional(), trim: text(100).optional(),
  additional: text(1000).optional(),
  listing: z.object({
    title: text(300).min(1),
    mileage: z.number().int().nonnegative().max(10000000).nullable(),
    encarId: text(20).regex(/^\d+$/),
    encarUrl: httpsUrl.refine((v) => /(^|\.)encar\.com$/.test(new URL(v).hostname), "Encar URL required"),
    siteUrl: httpsUrl.refine((v) => new URL(v).hostname === "key4u.bg" && new URL(v).pathname === "/car-search", "Key4U listing URL required"),
    priceKrw: z.number().int().nonnegative().max(1000000000000).nullable(),
    estimatedTotalEur: z.number().nonnegative().max(100000000).nullable(),
  }).optional(),
}).superRefine((data, ctx) => {
  if (!data.listing && !data.email) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Email required for car requests" });
});