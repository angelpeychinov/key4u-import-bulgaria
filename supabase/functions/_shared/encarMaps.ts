// Shared Korean -> English maps for Encar data. Mirrored by the SQL backfill.
export const BRAND_MAP: Record<string, string> = {
  "벤츠": "Mercedes-Benz", "아우디": "Audi", "폭스바겐": "Volkswagen", "포르쉐": "Porsche",
  "볼보": "Volvo", "렉서스": "Lexus", "랜드로버": "Land Rover", "도요타": "Toyota", "미니": "Mini",
  "벤틀리": "Bentley", "롤스로이스": "Rolls-Royce", "재규어": "Jaguar", "마세라티": "Maserati",
  "페라리": "Ferrari", "람보르기니": "Lamborghini", "캐딜락": "Cadillac", "쉐보레": "Chevrolet",
  "포드": "Ford", "푸조": "Peugeot", "크라이슬러": "Chrysler", "지프": "Jeep", "인피니티": "Infiniti",
  "혼다": "Honda", "닛산": "Nissan", "스바루": "Subaru", "미쯔비시": "Mitsubishi", "스마트": "Smart",
  "현대": "Hyundai", "기아": "Kia", "BMW": "BMW",
};

export const REGION_MAP: Record<string, string> = {
  "서울": "Seoul", "경기": "Gyeonggi", "인천": "Incheon", "부산": "Busan", "대구": "Daegu",
  "대전": "Daejeon", "광주": "Gwangju", "울산": "Ulsan", "세종": "Sejong", "강원": "Gangwon",
  "충북": "Chungbuk", "충남": "Chungnam", "전북": "Jeonbuk", "전남": "Jeonnam", "경북": "Gyeongbuk",
  "경남": "Gyeongnam", "제주": "Jeju", "전남광주": "Jeonnam/Gwangju",
};

export const FUEL_MAP: Record<string, string> = {
  "가솔린": "gasoline", "디젤": "diesel", "전기": "electric", "가솔린+전기": "hybrid",
  "디젤+전기": "hybrid", "가솔린+LPG": "gasoline+lpg", "LPG": "lpg", "수소": "hydrogen",
};

export const TRANSMISSION_MAP: Record<string, string> = {
  "오토": "auto", "수동": "manual", "기타": "other", "CVT": "cvt",
};

// Word-level replacements for model/trim text.
export const TEXT_MAP: [string, string][] = [
  ["디스커버리 스포츠", "Discovery Sport"], ["2세대", "2nd Gen"], ["프리미엄", "Premium"],
  ["페이버드", "Favoured"],
];

export const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-+|-+$/g, "");

const mapText = (s?: string) => {
  if (!s) return s;
  let out = s;
  for (const [k, v] of TEXT_MAP) out = out.split(k).join(v);
  return out;
};

// deno-lint-ignore no-explicit-any
export function translateListing<T extends Record<string, any>>(l: T): T {
  const out: Record<string, unknown> = { ...l };
  if (l.brand_name) {
    const en = BRAND_MAP[String(l.brand_name).trim()];
    if (en) { out.brand_name = en; out.brand_slug = slugify(en); }
  }
  if (l.region) out.region = REGION_MAP[l.region] ?? l.region;
  if (l.fuel_type) out.fuel_type = FUEL_MAP[l.fuel_type] ?? l.fuel_type;
  if (l.transmission) out.transmission = TRANSMISSION_MAP[l.transmission] ?? l.transmission;
  if (l.model_name) {
    const m = mapText(l.model_name)!;
    if (m !== l.model_name) { out.model_name = m; out.model_slug = slugify(m); }
  }
  if (l.trim) out.trim = mapText(l.trim);
  return out as T;
}
