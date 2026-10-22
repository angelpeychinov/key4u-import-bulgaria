import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { selectionValues } from "@/lib/listings";

const POPULAR = ["hyundai", "kia", "genesis", "bmw", "mercedes-benz", "audi"];
export interface PickerOption { slug: string; name: string; count?: number; group?: string }

export function MobileFacetPicker({ title, options, value, searchPlaceholder, emptyLabel, onChange, onClose }: {
  title: string; options: PickerOption[]; value: string; searchPlaceholder: string; emptyLabel: string;
  onChange: (value: string) => void; onClose: () => void;
}) {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const back = useRef<HTMLButtonElement>(null);
  useEffect(() => { back.current?.focus(); }, []);
  const selected = selectionValues(value);
  const filtered = options.filter(o => o.name.toLowerCase().includes(query.trim().toLowerCase()));
  const grouped = options.some(o => o.group);
  const popular = POPULAR.flatMap(slug => filtered.filter(o => o.slug === slug));
  const all = [...filtered].sort((a, b) => (a.group ?? "").localeCompare(b.group ?? "") || a.name.localeCompare(b.name, "en"));
  const rows = (items: PickerOption[]) => items.map((o, i) => <div key={o.slug}>
    {o.group && o.group !== items[i - 1]?.group && <h3 className="border-b border-border bg-muted px-4 py-3 text-sm font-semibold">{o.group}</h3>}
    <label className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-border/50 px-4 py-3 text-base">
      <Checkbox aria-label={o.group ? `${o.group}: ${o.name}` : o.name} checked={selected.includes(o.slug)} onCheckedChange={() => onChange(selected.includes(o.slug) ? selected.filter(v => v !== o.slug).join(",") : [...selected, o.slug].join(","))} />
      <span className="min-w-0 flex-1 break-words">{o.name}</span>
      <span className="shrink-0 text-sm text-muted-foreground">{o.count?.toLocaleString(language === "bg" ? "bg-BG" : "en-GB") ?? "—"}</span>
    </label>
  </div>);
  return <div role="dialog" aria-label={title} data-mobile-picker className="catalog-mobile-picker fixed inset-0 z-[60] flex flex-col bg-background text-foreground" onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); } }}>
    <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
      <Button ref={back} variant="ghost" size="icon" className="h-11 w-11" aria-label={t("catalog.back")} onClick={onClose}><ArrowLeft className="h-5 w-5" /></Button>
      <h2 className="flex-1 text-lg font-semibold">{title}</h2>
      <Button variant="ghost" className="min-h-11" disabled={!value} onClick={() => onChange("")}>{t("catalog.clear")}</Button>
    </header>
    <div className="relative shrink-0 border-b border-border p-3"><Search className="absolute left-6 top-6 h-5 w-5 text-muted-foreground" /><Input className="h-12 pl-10 text-base" aria-label={searchPlaceholder} placeholder={searchPlaceholder} value={query} onChange={e => setQuery(e.target.value)} /></div>
    <div data-picker-scroll className="catalog-touch-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {!grouped && popular.length > 0 && <><h3 className="bg-muted px-4 py-3 text-sm font-semibold">{t("catalog.popular")}</h3>{rows(popular)}</>}
      {!grouped && <h3 className="bg-muted px-4 py-3 text-sm font-semibold">{t("catalog.allBrands")}</h3>}
      {rows(all)}{all.length === 0 && <p className="p-4 text-muted-foreground">{emptyLabel}</p>}
    </div>
    <footer className="catalog-safe-bottom shrink-0 border-t border-border bg-background p-3"><Button className="min-h-12 w-full text-base" onClick={onClose}>{t("catalog.doneSelected").replace("{n}", String(selected.length))}</Button></footer>
  </div>;
}