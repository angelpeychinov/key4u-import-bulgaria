import { expect, test } from "bun:test";
import { emailSendResult, requestSubject, escapeEmailHtml } from "../supabase/functions/_shared/carRequestEmail";

test("Resend error returns 500 even with a data value", () => {
  const error = { message: "rejected", name: "validation_error" };
  expect(emailSendResult({ data: { id: "unused" }, error })).toEqual({ status: 500, body: { error } });
});
test("success requires and exposes the Resend email id", () => {
  expect(emailSendResult({ data: { id: "email-123" }, error: null })).toEqual({ status: 200, body: { success: true, emailId: "email-123" } });
  expect(emailSendResult({ data: null }).status).toBe(500);
});
test("listing inquiry uses its car title in the subject", () => {
  expect(requestSubject("unused", { title: "BMW X5 2022" })).toBe("Запитване за обява: BMW X5 2022");
});
test("email HTML escapes submitted content", () => {
  expect(escapeEmailHtml('<script>"&')).toBe("&lt;script&gt;&quot;&amp;");
});