import { supabase } from "@/integrations/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
const KRW_PER_EUR = 1544;
const HANGUL = /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/;

export interface ListingDetails {
  specs: [string, string][];
  history: [string, string][];
  equipment: string[];
  photos: string[];
}

const BODY_BG: Record<string, string> = {
  sedan: "Седан", hatchback: "Хечбек", coupe: "Купе", convertible: "Кабриолет", suv: "SUV",
  wagon: "Комби", pickup: "Пикап", van: "Ван", minivan: "Миниван", other: "Друго",
  "세단": "Седан", "해치백": "Хечбек", "쿠페": "Купе", "컨버터블": "Кабриолет", "왜건": "Комби",
  "픽업트럭": "Пикап", "승합": "Ван", "밴": "Ван", "RV": "Миниван", "경차": "Хечбек", "기타": "Друго",
};
const COLOR_BG: Record<string, string> = {
  "흰색": "Бял", "화이트": "Бял", "검정색": "Черен", "블랙": "Черен", "은색": "Сребрист", "실버": "Сребрист",
  "쥐색": "Сив", "회색": "Сив", "그레이": "Сив", "파란색": "Син", "청색": "Син", "빨간색": "Червен",
  "갈색": "Кафяв", "진주색": "Перлено бял", "녹색": "Зелен", "베이지": "Бежов",
};
const DRIVE_BG: Record<string, string> = {
  "4WD": "4x4", AWD: "4x4 (AWD)", "2WD": "Предно/задно", FF: "Предно", FR: "Задно",
  "전륜": "Предно", "후륜": "Задно", "사륜": "4x4",
};

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};
const safe = (v?: string) => (v && !HANGUL.test(v) ? v : undefined);
const eur = (krw: number) =>
  new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(krw / KRW_PER_EUR);

const firstReg = (ym: unknown) => {
  const s = String(ym ?? "").replace(/\D/g, "");
  if (s.length < 6) return undefined;
  const mm = s.slice(4, 6);
  return Number(mm) >= 1 && Number(mm) <= 12 ? `${mm}.${s.slice(0, 4)}` : undefined;
};

export function parseDetails(d: any): ListingDetails {
  const v = d?.vehicle;
  const spec = v?.spec;
  const insp = d?.inspection;
  const rec = d?.record;

  const body = str(spec?.bodyName);
  const cc = num(spec?.displacement);
  const color = str(spec?.colorName);
  const seats = num(spec?.seatCount);
  const drive = str(spec?.driveType ?? spec?.driveTypeName ?? spec?.drivingSystem);

  const specs: [string, string][] = [];
  const push = (arr: [string, string][], label: string, value?: string) => { if (value) arr.push([label, value]); };
  push(specs, "Тип купе", body ? BODY_BG[body] ?? safe(body) : undefined);
  push(specs, "Кубатура", cc && cc > 0 ? `${new Intl.NumberFormat("bg-BG").format(cc)} cc` : undefined);
  push(specs, "Цвят", color ? COLOR_BG[color] ?? safe(color) : undefined);
  push(specs, "Брой места", seats && seats > 0 ? String(seats) : undefined);
  push(specs, "Задвижване", drive ? DRIVE_BG[drive] ?? safe(drive) : undefined);
  push(specs, "Дата на първа регистрация", firstReg(v?.category?.yearMonth));

  const history: [string, string][] = [];
  const acc = insp?.master?.accdient ?? insp?.master?.accident;
  if (typeof acc === "boolean") history.push(["ПТП", acc ? "Да" : "Не"]);
  const simple = insp?.master?.simpleRepair;
  if (typeof simple === "boolean") history.push(["Леки ремонти (без конструктивни)", simple ? "Да" : "Не"]);
  const flooded = insp?.master?.detail?.waterlog === true || (num(rec?.floodTotalLossCnt) ?? 0) > 0 || (num(rec?.floodPartLossCnt) ?? 0) > 0;
  if (insp?.master?.detail || rec) history.push(["Наводнение", flooded ? "Да" : "Не"]);
  const totalLoss = num(rec?.totalLossCnt);
  if (totalLoss !== undefined) history.push(["Тотална щета", totalLoss > 0 ? "Да" : "Не"]);
  const my = num(rec?.myAccidentCnt);
  const other = num(rec?.otherAccidentCnt);
  if (my !== undefined) history.push(["Застрахователни щети (собствени)", String(my)]);
  if (other !== undefined) history.push(["Застрахователни щети (от други)", String(other)]);
  const myCost = num(rec?.myAccidentCost);
  const otherCost = num(rec?.otherAccidentCost);
  if (myCost !== undefined || otherCost !== undefined) {
    history.push(["Обща сума на щетите", `~${eur((myCost ?? 0) + (otherCost ?? 0))}`]);
  }
  const owners = num(rec?.ownerChangeCnt);
  if (owners !== undefined) history.push(["Сменени собственици", String(owners)]);

  // Equipment: only human-readable, non-Korean names (codes are skipped).
  const equipment: string[] = [];
  const collect = (x: any) => {
    if (Array.isArray(x)) x.forEach(collect);
    else if (x && typeof x === "object") {
      const n = str(x.name ?? x.optionName ?? x.title);
      if (n) collect(n); else Object.values(x).forEach((y) => Array.isArray(y) && collect(y));
    } else if (typeof x === "string") {
      const s = x.trim();
      if (s && /[a-z]{3}/i.test(s) && !/^[A-Z0-9_-]+$/.test(s) && !HANGUL.test(s)) equipment.push(s);
    }
  };
  collect(v?.options);

  const photos = Array.isArray(v?.photos)
    ? [...v.photos]
        .sort((a: any, b: any) => (num(a?.ordering) ?? 0) - (num(b?.ordering) ?? 0))
        .map((p: any) => str(p?.path))
        .filter((p): p is string => !!p)
        .map((p) => (p.startsWith("http") ? p : `https://ci.encar.com${p.startsWith("/") ? "" : "/"}${p}`))
    : [];

  return { specs, history, equipment: [...new Set(equipment)].slice(0, 60), photos };
}

export async function fetchListingDetails(encarId: string): Promise<ListingDetails | null> {
  const { data, error } = await supabase.functions.invoke(`encar-detail?id=${encodeURIComponent(encarId)}`, { method: "GET" });
  if (error || !data || data.unavailable) return null;
  const parsed = parseDetails(data);
  const empty = !parsed.specs.length && !parsed.history.length && !parsed.equipment.length && !parsed.photos.length;
  return empty ? null : parsed;
}
