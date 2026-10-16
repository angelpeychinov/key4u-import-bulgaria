// Shared Korean -> English maps for Encar data. Mirrored by the SQL backfill.
export const BRAND_MAP: Record<string, string> = {
  "시트로엥/DS": "Citroen/DS", "알파 로메오": "Alfa Romeo", "BYD": "BYD", "GMC": "GMC", "다이하쯔": "Daihatsu",
  "동풍소콘": "Dongfeng Sokon", "로터스": "Lotus", "마이바흐": "Maybach", "맥라렌": "McLaren", "미쯔오까": "Mitsuoka",
  "북기은상": "BAIC", "사브": "Saab", "사이언": "Scion", "신위안": "Xinyuan", "스즈키": "Suzuki", "애스턴마틴": "Aston Martin",
  "어큐라": "Acura", "이네오스": "Ineos", "지리": "Geely", "험머": "Hummer", "부가티": "Bugatti", "코닉세그": "Koenigsegg",
  "파가니": "Pagani", "기타 제조사": "Other (Korea)", "기타 수입차": "Other (Import)", "머큐리": "Mercury", "뷰익": "Buick",
  "새턴": "Saturn", "오펠": "Opel", "올즈모빌": "Oldsmobile", "이스즈": "Isuzu", "지커": "Zeekr", "포톤": "Foton",
  "폰티악": "Pontiac", "MG로버": "MG Rover",
  "벤츠": "Mercedes-Benz", "아우디": "Audi", "폭스바겐": "Volkswagen", "포르쉐": "Porsche",
  "볼보": "Volvo", "렉서스": "Lexus", "랜드로버": "Land Rover", "도요타": "Toyota", "미니": "Mini",
  "벤틀리": "Bentley", "롤스로이스": "Rolls-Royce", "재규어": "Jaguar", "마세라티": "Maserati",
  "페라리": "Ferrari", "람보르기니": "Lamborghini", "캐딜락": "Cadillac", "쉐보레": "Chevrolet",
  "포드": "Ford", "푸조": "Peugeot", "크라이슬러": "Chrysler", "지프": "Jeep", "인피니티": "Infiniti",
  "혼다": "Honda", "닛산": "Nissan", "스바루": "Subaru", "미쯔비시": "Mitsubishi", "스마트": "Smart",
  "현대": "Hyundai", "기아": "Kia", "BMW": "BMW",
  "제네시스": "Genesis", "쉐보레(GM대우)": "Chevrolet", "르노코리아(삼성)": "Renault Korea",
  "KG모빌리티(쌍용)": "KG Mobility", "테슬라": "Tesla", "링컨": "Lincoln", "폴스타": "Polestar",
  "마쯔다": "Mazda", "르노": "Renault", "시트로엥": "Citroen", "알파로메오": "Alfa Romeo",
  "피아트": "Fiat", "닷지": "Dodge",
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
  "LPG+전기": "hybrid", "CNG": "cng",
};

export const TRANSMISSION_MAP: Record<string, string> = {
  "오토": "auto", "수동": "manual", "기타": "other", "CVT": "cvt", "세미오토": "semi_auto",
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

// Trim words (Badge/BadgeDetail). Applied longest key first so phrases win.
export const TRIM_MAP: Record<string, string> = {
  "콰트로": "Quattro", "프리미엄": "Premium", "프레스티지": "Prestige", "익스클루시브": "Exclusive",
  "럭셔리": "Luxury", "스포츠": "Sport", "다이나믹": "Dynamic", "인스크립션": "Inscription",
  "모멘텀": "Momentum", "노블레스": "Noblesse", "시그니처": "Signature", "트렌디": "Trendy",
  "모던": "Modern", "인스퍼레이션": "Inspiration", "캘리그래피": "Calligraphy", "그래비티": "Gravity",
  "디럭스": "Deluxe", "스탠다드": "Standard", "밸류": "Value", "패키지": "Package",
  "가솔린": "Gasoline", "디젤": "Diesel", "하이브리드": "Hybrid", "터보": "Turbo",
  "롱레인지": "Long Range", "퍼포먼스": "Performance", "인승": "-seater", "페이스리프트": "Facelift",
  "더 뉴": "The New", "올 뉴": "All New", "뉴": "New",
};
const TRIM_ENTRIES = Object.entries(TRIM_MAP).sort((a, b) => b[0].length - a[0].length);

export const mapTrim = (s?: string) => {
  if (!s) return s;
  let out = s;
  for (const [k, v] of TRIM_ENTRIES) out = out.split(k).join(v);
  return out.replace(/\s+/g, " ").trim();
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
  if (l.trim) out.trim = mapTrim(mapText(l.trim));
  return out as T;
}
