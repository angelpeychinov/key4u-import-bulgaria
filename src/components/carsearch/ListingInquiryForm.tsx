import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { listingPath } from "@/lib/listingNavigation";
import type { Listing } from "@/lib/listings";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(20),
  email: z.union([z.string().trim().email().max(255), z.literal("")]),
  additional: z.string().trim().max(1000),
});

export function ListingInquiryForm({ listing, total, onClose }: { listing: Listing; total?: number; onClose: () => void }) {
  const { t } = useLanguage();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", additional: t("inquiry.messageDefault") });
  const title = [listing.brand, listing.model, listing.trim, listing.year].filter(Boolean).join(" ") || listing.title;
  const change = (key: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [key]: value }));
  return (
    <form className="mt-4 space-y-3 border-t border-border pt-4 text-foreground" onSubmit={async (event) => {
      event.preventDefault();
      if (sending) return;
      const parsed = schema.safeParse(form);
      if (!parsed.success || !listing.encarId) { toast.error(t("inquiry.invalid")); return; }
      setSending(true);
      try {
        const { data, error } = await supabase.functions.invoke("send-car-request", { body: {
          ...parsed.data, model: title,
          listing: {
            title, mileage: listing.mileage ?? null, encarId: listing.encarId,
            encarUrl: listing.url || `https://www.encar.com/dc/dc_cardetailview.do?carid=${encodeURIComponent(listing.encarId)}`,
            siteUrl: `https://key4u.bg${listingPath(listing)}`,
            priceKrw: listing.priceKrw ?? null, estimatedTotalEur: total ?? null,
          },
        } });
        if (error || !data?.success || !data?.emailId) throw new Error("Inquiry not sent");
        toast.success(t("inquiry.success"));
        onClose();
      } catch { toast.error(t("inquiry.error")); }
      finally { setSending(false); }
    }}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold">{t("inquiry.title")}</h4>
        <Button type="button" variant="ghost" size="icon" disabled={sending} onClick={onClose} aria-label={t("inquiry.close")}><X className="h-4 w-4" /></Button>
      </div>
      <fieldset disabled={sending} className="space-y-3">
        <label className="block text-sm">{t("inquiry.name")} *<Input autoFocus required maxLength={100} autoComplete="name" value={form.name} onChange={(e) => change("name", e.target.value)} /></label>
        <label className="block text-sm">{t("inquiry.phone")} *<Input required type="tel" maxLength={20} autoComplete="tel" value={form.phone} onChange={(e) => change("phone", e.target.value)} /></label>
        <label className="block text-sm">{t("inquiry.email")}<Input type="email" maxLength={255} autoComplete="email" value={form.email} onChange={(e) => change("email", e.target.value)} /></label>
        <label className="block text-sm">{t("inquiry.message")}<Textarea rows={3} maxLength={1000} value={form.additional} onChange={(e) => change("additional", e.target.value)} /></label>
        <Button type="submit" className="w-full">{sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}{t(sending ? "inquiry.sending" : "inquiry.send")}</Button>
      </fieldset>
    </form>
  );
}