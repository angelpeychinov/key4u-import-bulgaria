export const escapeEmailHtml = (text: string) => text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] ?? char));

export function emailSendResult(response: { data?: { id?: string } | null; error?: unknown }) {
  if (response.error) return { status: 500, body: { error: response.error } };
  const emailId = response.data?.id;
  if (!emailId) return { status: 500, body: { error: "Resend returned no email id" } };
  return { status: 200, body: { success: true, emailId } };
}

export function requestSubject(model: string, listing?: { title: string }) {
  return listing ? `Запитване за обява: ${listing.title}` : `Нова заявка за автомобил: ${model}`;
}