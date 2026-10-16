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
  "LPG(일반인 구입)": "lpg", "LPG(일반인구입)": "lpg", "가솔린+CNG": "cng", "기타": "other", "전기+가솔린": "hybrid",
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
// Import-brand words: exact tokens (merged into WORD_MAP) and safe substrings for compounds like "GLC-클래스".
export const IMPORT_WORDS: Record<string, string> = {"클래스": "Class", "아방가르드": "Avantgarde", "익스클루시브": "Exclusive", "AMG라인": "AMG Line", "라인": "Line", "마이바흐": "Maybach", "쿠페": "Coupe", "카브리올레": "Cabriolet", "로드스터": "Roadster", "레인지로버": "Range Rover", "레인지": "Range", "로버": "Rover", "벨라": "Velar", "이보크": "Evoque", "디스커버리": "Discovery", "디펜더": "Defender", "프리우스": "Prius", "캠리": "Camry", "라브4": "RAV4", "시에나": "Sienna", "알파드": "Alphard", "아발론": "Avalon", "크라운": "Crown", "코롤라": "Corolla", "랜드크루저": "Land Cruiser", "하이랜더": "Highlander", "벨파이어": "Vellfire", "체로키": "Cherokee", "그랜드체로키": "Grand Cherokee", "랭글러": "Wrangler", "레니게이드": "Renegade", "컴패스": "Compass", "글래디에이터": "Gladiator", "롱지튜드": "Longitude", "오버랜드": "Overland", "루비콘": "Rubicon", "사하라": "Sahara", "언리미티드": "Unlimited", "트레일호크": "Trailhawk", "서밋": "Summit", "익스플로러": "Explorer", "머스탱": "Mustang", "레인저": "Ranger", "브롱코": "Bronco", "이스케이프": "Escape", "쿠가": "Kuga", "몬데오": "Mondeo", "포커스": "Focus", "토러스": "Taurus", "익스페디션": "Expedition", "에스컬레이드": "Escalade", "리릭": "Lyriq", "플라잉스퍼": "Flying Spur", "플라잉": "Flying", "스퍼": "Spur", "컨티넨탈": "Continental", "벤테이가": "Bentayga", "뮬산": "Mulsanne", "고스트": "Ghost", "컬리넌": "Cullinan", "레이스": "Wraith", "던": "Dawn", "팬텀": "Phantom", "스펙터": "Spectre", "콰트로포르테": "Quattroporte", "기블리": "Ghibli", "르반떼": "Levante", "그레칼레": "Grecale", "그란투리스모": "GranTurismo", "우루스": "Urus", "우라칸": "Huracan", "아벤타도르": "Aventador", "레부엘토": "Revuelto", "로마": "Roma", "포르토피노": "Portofino", "푸로산게": "Purosangue", "이트론": "e-tron", "e-트론": "e-tron", "트론": "tron", "스포트백": "Sportback", "아반트": "Avant", "올로드": "Allroad", "콰트로": "Quattro", "티구안": "Tiguan", "골프": "Golf", "파사트": "Passat", "아테온": "Arteon", "투아렉": "Touareg", "제타": "Jetta", "폴로": "Polo", "시로코": "Scirocco", "페이톤": "Phaeton", "카이엔": "Cayenne", "마칸": "Macan", "파나메라": "Panamera", "타이칸": "Taycan", "박스터": "Boxster", "카이맨": "Cayman", "까레라": "Carrera", "카레라": "Carrera", "타르가": "Targa", "쿠퍼": "Cooper", "컨트리맨": "Countryman", "클럽맨": "Clubman", "페이스맨": "Paceman", "에이스맨": "Aceman", "컨버터블": "Convertible", "모델": "Model", "어코드": "Accord", "시빅": "Civic", "오딧세이": "Odyssey", "파일럿": "Pilot", "알티마": "Altima", "무라노": "Murano", "패스파인더": "Pathfinder", "큐브": "Cube", "맥시마": "Maxima", "로그": "Rogue", "쥬크": "Juke", "에비에이터": "Aviator", "노틸러스": "Nautilus", "네비게이터": "Navigator", "코세어": "Corsair", "퍼시피카": "Pacifica", "F-페이스": "F-Pace", "E-페이스": "E-Pace", "I-페이스": "I-Pace", "페이스": "Pace", "에스클래스": "S-Class", "디자인": "Design", "인스크립션": "Inscription", "모멘텀": "Momentum", "울트라": "Ultra", "얼티밋": "Ultimate", "크로스컨트리": "Cross Country", "폴스타": "Polestar", "수프림": "Supreme", "이그제큐티브": "Executive", "스포츠백": "Sportback", "그란": "Gran", "투어링": "Touring", "액티브": "Active", "투어러": "Tourer", "아이": "i", "GT라인": "GT Line", "알뤼르": "Allure", "에어크로스": "Aircross", "카라반": "Caravan", "파이브": "Five", "하이랜드": "Highland", "퍼포먼스": "Performance", "스탠다드": "Standard", "레인지플러스": "Range Plus"};
const IMPORT_SUBSTR: Record<string, string> = {"클래스": "Class", "아방가르드": "Avantgarde", "익스클루시브": "Exclusive", "AMG라인": "AMG Line", "마이바흐": "Maybach", "카브리올레": "Cabriolet", "로드스터": "Roadster", "레인지로버": "Range Rover", "벨라": "Velar", "이보크": "Evoque", "디스커버리": "Discovery", "디펜더": "Defender", "프리우스": "Prius", "캠리": "Camry", "라브4": "RAV4", "시에나": "Sienna", "알파드": "Alphard", "아발론": "Avalon", "크라운": "Crown", "코롤라": "Corolla", "랜드크루저": "Land Cruiser", "하이랜더": "Highlander", "벨파이어": "Vellfire", "체로키": "Cherokee", "그랜드체로키": "Grand Cherokee", "랭글러": "Wrangler", "레니게이드": "Renegade", "컴패스": "Compass", "글래디에이터": "Gladiator", "롱지튜드": "Longitude", "오버랜드": "Overland", "루비콘": "Rubicon", "사하라": "Sahara", "언리미티드": "Unlimited", "트레일호크": "Trailhawk", "서밋": "Summit", "익스플로러": "Explorer", "머스탱": "Mustang", "레인저": "Ranger", "브롱코": "Bronco", "이스케이프": "Escape", "쿠가": "Kuga", "몬데오": "Mondeo", "포커스": "Focus", "토러스": "Taurus", "익스페디션": "Expedition", "에스컬레이드": "Escalade", "리릭": "Lyriq", "플라잉스퍼": "Flying Spur", "컨티넨탈": "Continental", "벤테이가": "Bentayga", "뮬산": "Mulsanne", "고스트": "Ghost", "컬리넌": "Cullinan", "스펙터": "Spectre", "콰트로포르테": "Quattroporte", "기블리": "Ghibli", "르반떼": "Levante", "그레칼레": "Grecale", "그란투리스모": "GranTurismo", "우루스": "Urus", "우라칸": "Huracan", "아벤타도르": "Aventador", "레부엘토": "Revuelto", "포르토피노": "Portofino", "푸로산게": "Purosangue", "이트론": "e-tron", "e-트론": "e-tron", "스포트백": "Sportback", "아반트": "Avant", "올로드": "Allroad", "콰트로": "Quattro", "티구안": "Tiguan", "골프": "Golf", "파사트": "Passat", "아테온": "Arteon", "투아렉": "Touareg", "제타": "Jetta", "폴로": "Polo", "시로코": "Scirocco", "페이톤": "Phaeton", "카이엔": "Cayenne", "마칸": "Macan", "파나메라": "Panamera", "타이칸": "Taycan", "박스터": "Boxster", "카이맨": "Cayman", "까레라": "Carrera", "카레라": "Carrera", "타르가": "Targa", "쿠퍼": "Cooper", "컨트리맨": "Countryman", "클럽맨": "Clubman", "페이스맨": "Paceman", "에이스맨": "Aceman", "컨버터블": "Convertible", "어코드": "Accord", "시빅": "Civic", "오딧세이": "Odyssey", "파일럿": "Pilot", "알티마": "Altima", "무라노": "Murano", "패스파인더": "Pathfinder", "맥시마": "Maxima", "쥬크": "Juke", "에비에이터": "Aviator", "노틸러스": "Nautilus", "네비게이터": "Navigator", "코세어": "Corsair", "퍼시피카": "Pacifica", "F-페이스": "F-Pace", "E-페이스": "E-Pace", "I-페이스": "I-Pace", "에스클래스": "S-Class", "디자인": "Design", "인스크립션": "Inscription", "모멘텀": "Momentum", "울트라": "Ultra", "얼티밋": "Ultimate", "크로스컨트리": "Cross Country", "폴스타": "Polestar", "수프림": "Supreme", "이그제큐티브": "Executive", "스포츠백": "Sportback", "투어링": "Touring", "액티브": "Active", "투어러": "Tourer", "GT라인": "GT Line", "알뤼르": "Allure", "에어크로스": "Aircross", "카라반": "Caravan", "파이브": "Five", "하이랜드": "Highland", "퍼포먼스": "Performance", "스탠다드": "Standard", "레인지플러스": "Range Plus"};

export const TRIM_MAP: Record<string, string> = {
  "콰트로": "Quattro", "프리미엄": "Premium", "프레스티지": "Prestige", "익스클루시브": "Exclusive",
  "럭셔리": "Luxury", "스포츠": "Sport", "다이나믹": "Dynamic", "인스크립션": "Inscription",
  "모멘텀": "Momentum", "노블레스": "Noblesse", "시그니처": "Signature", "트렌디": "Trendy",
  "모던": "Modern", "인스퍼레이션": "Inspiration", "캘리그래피": "Calligraphy", "그래비티": "Gravity",
  "디럭스": "Deluxe", "스탠다드": "Standard", "밸류": "Value", "패키지": "Package",
  "가솔린": "Gasoline", "디젤": "Diesel", "하이브리드": "Hybrid", "터보": "Turbo",
  "롱레인지": "Long Range", "퍼포먼스": "Performance", "인승": "-seater", "페이스리프트": "Facelift",
  "더 뉴": "The New", "올 뉴": "All New", "뉴": "New",
  "기본형": "Base", "스타일": "Style", "어드밴스팩": "Advance Pack", "스마트": "Smart",
  "밸류 플러스": "Value Plus", "플러스": "Plus", "베스트 셀렉션": "Best Selection", "블랙잉크": "Black Ink",
  "마스터즈": "Masters", "고급형": "Premium", "최고급형": "Top", "일반형": "Standard", "초이스": "Choice",
  "에디션": "Edition", "스페셜": "Special", "팩": "Pack", "오토": "Auto", "수동": "Manual",
  "롱바디": "Long Body", "전기": "EV", "밴": "Van", "카고": "Cargo", "초장축": "Super Long", "장축": "Long",
  "슈퍼캡": "Super Cab", "더블캡": "Double Cab", "킹캡": "King Cab",
};
const TRIM_ENTRIES = Object.entries({ ...IMPORT_SUBSTR, ...TRIM_MAP }).sort((a, b) => b[0].length - a[0].length);

export const MODEL_MAP: Record<string, string> = {
  "아반떼": "Avante", "쏘나타": "Sonata", "그랜저": "Grandeur", "싼타페": "Santa Fe", "투싼": "Tucson",
  "팰리세이드": "Palisade", "코나": "Kona", "베뉴": "Venue", "캐스퍼": "Casper", "스타리아": "Staria",
  "스타렉스": "Starex", "그랜드 스타렉스": "Grand Starex", "포터": "Porter", "아이오닉": "Ioniq", "넥쏘": "Nexo",
  "벨로스터": "Veloster", "엑센트": "Accent", "에쿠스": "Equus", "제네시스": "Genesis", "맥스크루즈": "Maxcruz",
  "베라크루즈": "Veracruz", "쏘렌토": "Sorento", "스포티지": "Sportage", "카니발": "Carnival", "모닝": "Morning",
  "레이": "Ray", "셀토스": "Seltos", "니로": "Niro", "봉고": "Bongo", "모하비": "Mohave", "스팅어": "Stinger",
  "쏘울": "Soul", "프라이드": "Pride", "카렌스": "Carens", "오피러스": "Opirus", "포르테": "Forte", "로체": "Lotze",
  "스토닉": "Stonic", "트랙스": "Trax", "트레일블레이저": "Trailblazer", "말리부": "Malibu", "스파크": "Spark",
  "올란도": "Orlando", "크루즈": "Cruze", "캡티바": "Captiva", "임팔라": "Impala", "이쿼녹스": "Equinox",
  "콜로라도": "Colorado", "타호": "Tahoe", "볼트": "Bolt", "다마스": "Damas", "라보": "Labo", "렉스턴": "Rexton",
  "티볼리": "Tivoli", "코란도": "Korando", "토레스": "Torres", "액티언": "Actyon", "체어맨": "Chairman",
  "무쏘": "Musso", "카이런": "Kyron", "그랑 콜레오스": "Grand Koleos", "콜레오스": "Koleos", "아르카나": "Arkana",
  "클리오": "Clio", "마스터": "Master", "트위지": "Twizy", "디 올 뉴": "The All New", "더 뉴": "The New",
  "올 뉴": "All New", "뉴": "New", "신형": "New", "하이브리드": "Hybrid", "일렉트릭": "Electric", "전기": "EV",
};
const MODEL_ENTRIES = Object.entries({ ...IMPORT_SUBSTR, ...MODEL_MAP }).sort((a, b) => b[0].length - a[0].length);

export const mapTrim = (s?: string) => {
  if (!s) return s;
  let out = s;
  for (const [k, v] of TRIM_ENTRIES) out = out.split(k).join(v);
  return out.replace(/\s+/g, " ").trim();
};

export const mapModel = (s?: string) => {
  if (!s) return s;
  let out = s;
  for (const [k, v] of MODEL_ENTRIES) out = out.split(k).join(v);
  return out.replace(/\s+/g, " ").trim();
};

// Revised Romanization fallback for any Hangul syllables left after the maps.
const RR_I = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
const RR_V = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
const RR_F = ["","k","k","k","n","n","n","t","l","k","m","l","l","l","p","l","m","p","p","t","t","ng","t","t","k","t","p","t"];
export const HANGUL_RE = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/;
export function romanize(s: string): string {
  const latin = s.replace(/[\uAC00-\uD7A3]+/g, (word) => {
    let r = "";
    for (const ch of word) {
      const c = ch.charCodeAt(0) - 0xAC00;
      r += RR_I[Math.floor(c / 588)] + RR_V[Math.floor((c % 588) / 28)] + RR_F[c % 28];
    }
    return r.charAt(0).toUpperCase() + r.slice(1);
  });
  return latin.replace(/[\u1100-\u11FF\u3130-\u318F]/g, "").replace(/\s+/g, " ").trim();
}
export const WORD_MAP: Record<string, string> = {"세부등급 없음": "", "세부등급": "", "없음": "", "더": "The", "뉴": "New", "올": "All", "디": "The", "신형": "New", "그랜드": "Grand", "그랑": "Grand", "디젤": "Diesel", "가솔린": "Gasoline", "터보": "Turbo", "하이브리드": "Hybrid", "일렉트릭": "Electric", "전기차": "EV", "플러그인": "Plug-in", "바이퓨얼": "Bi-Fuel", "일렉트리파이드": "Electrified", "프레스티지": "Prestige", "프리미엄": "Premium", "노블레스": "Noblesse", "모던": "Modern", "시그니처": "Signature", "시그니쳐": "Signature", "럭셔리": "Luxury", "익스클루시브": "Exclusive", "스페셜": "Special", "스포츠": "Sport", "스마트": "Smart", "캘리그래피": "Calligraphy", "인스퍼레이션": "Inspiration", "플러스": "Plus", "트렌디": "Trendy", "트랜디": "Trendy", "롱레인지": "Long Range", "프리미어": "Premier", "디럭스": "Deluxe", "마스터": "Master", "기본형": "Base", "하이리무진": "Hi-Limousine", "에어": "Air", "에디션": "Edition", "그래비티": "Gravity", "프라임": "Prime", "마스터즈": "Masters", "스타일": "Style", "고급형": "Premium", "고급": "Premium", "스탠다드": "Standard", "칸": "Khan", "카고": "Cargo", "렌터카": "Rental", "렌터카용": "(ex-rental)", "렌트카용": "(ex-rental)", "택시렌터카": "(ex-taxi/rental)", "어반": "Urban", "초이스": "Choice", "르블랑": "Le Blanc", "넥스트": "Next", "밸류": "Value", "프레지던트": "President", "리무진": "Limousine", "최고급형": "Top", "엣지": "Edge", "왜건": "Wagon", "웨건": "Wagon", "볼드": "Bold", "베스트": "Best", "베리": "Very", "플래티넘": "Platinum", "플래티넘Ⅰ": "Platinum I", "플래티넘Ⅱ": "Platinum II", "플래티넘Ⅲ": "Platinum III", "장애인용": "(accessible)", "어스": "Earth", "라이즈": "Rise", "리미티드": "Limited", "셀렉션": "Selection", "셀렉션Ⅰ": "Selection I", "셀렉션Ⅱ": "Selection II", "투어러": "Tourer", "블랙": "Black", "뷰티풀": "Beautiful", "크로스오버": "Crossover", "노바": "Nova", "익스트림": "Extreme", "익스트림-X": "Extreme-X", "어린이보호차": "(school bus)", "어린이": "Child", "보호차": "Protection", "쿠페": "Coupe", "택시형": "(taxi)", "택시": "Taxi", "아머": "Armor", "5링크": "5-Link", "라운지": "Lounge", "투리스모": "Turismo", "특장업체": "Special Body", "패키지": "Package", "5도어": "5-door", "어드벤처": "Adventure", "엘리트": "Elite", "클럽": "Club", "패션": "Fashion", "에센셜": "Essential", "네오": "Neo", "캠핑카": "Camper", "쿨멘": "Coolmen", "슈프림": "Supreme", "아이코닉": "Iconic", "마이스터": "Meister", "프리미에르": "Premiere", "다이나믹": "Dynamic", "다이내믹": "Dynamic", "어메이징": "Amazing", "레드라인": "Red Line", "파이니스트": "Finest", "컬렉션": "Collection", "패밀리": "Family", "브릴리언트": "Brilliant", "세단": "Sedan", "디럭스팩": "Deluxe Pack", "에어로": "Aero", "라이트": "Lite", "액티브": "Active", "코어": "Core", "그란쿠페": "Gran Coupe", "유라시아": "Eurasia", "스타": "Star", "리얼": "Real", "기어": "Gear", "기어Ⅱ": "Gear II", "퍼펙트": "Perfect", "퍼팩트": "Perfect", "세이프티": "Safety", "인스파이어": "Inspire", "와일드": "Wild", "팝": "Pop", "블랙에디션": "Black Edition", "살룬": "Saloon", "이그제큐티브": "Executive", "조이": "Joy", "에스프리": "Esprit", "알핀": "Alpine", "익스페디션": "Expedition", "인텔리전트": "Intelligent", "프로페셔널": "Professional", "영업용": "(commercial)", "헤리티지": "Heritage", "베이직": "Basic", "플럭스": "Flux", "탑": "Top", "인텐스": "Intense", "아트": "Art", "스펙": "Spec", "아웃도어": "Outdoor", "해치백": "Hatchback", "마제스티": "Majesty", "세이프티팩": "Safety Pack", "기타": "Other", "테크": "Tech", "컨버터블": "Convertible", "어드밴스드": "Advanced", "어드밴스": "Advance", "스마트팩": "Smart Pack", "하이": "High", "위트": "Wit", "클래식": "Classic", "부스터": "Booster", "구조변경": "(modified)", "셀러브리티": "Celebrity", "노블": "Noble", "하이루프": "High Roof", "블랙프리미엄": "Black Premium", "크리에이티브": "Creative", "로얄": "Royal", "로열": "Royal", "래더패키지": "Leather Package", "레더": "Leather", "아레나": "Arena", "타입": "Type", "마이핏": "My Fit", "에코": "Eco", "에코플러스": "Eco Plus", "슈퍼": "Super", "케어플러스": "Care Plus", "모빌리티": "Mobility", "미드나잇": "Midnight", "피버": "Fever", "쿱": "Coupe", "리프트": "Lift", "딜라이트": "Delight", "비즈니스": "Business", "필": "Feel", "휠체어": "Wheelchair", "샤토": "Chateau", "슈팅브레이크": "Shooting Brake", "판넬밴": "Panel Van", "밴": "Van", "VIP팩": "VIP Pack", "밀리언": "Million", "텐밀리언": "Ten Million", "아크로": "Acro", "리프": "Leaf", "넘버원": "No.1", "롱카고": "Long Cargo", "프리미엄팩": "Premium Pack", "수출형": "Export", "재즈": "Jazz", "블랙휠": "Black Wheel", "화이트": "White", "밀레니얼": "Millennial", "컨비니언스팩": "Convenience Pack", "어드밴티지": "Advantage", "슬로프": "Slope", "쉐도우": "Shadow", "섀도우": "Shadow", "유니크": "Unique", "클러비": "Clubby", "30주년": "30th Anniversary", "성능형": "Performance", "프라임팩": "Prime Pack", "모범형": "(deluxe taxi)", "ED에디션": "ED Edition", "에이스": "Ace", "팩1": "Pack 1", "팩": "Pack", "이동사무차": "Mobile Office", "라이프": "Life", "퀀텀": "Quantum", "드라이빙": "Driving", "임프레션": "Impression", "R-플러스": "R-Plus", "캠퍼": "Camper", "앰뷸런스": "Ambulance", "퍼포먼스": "Performance", "파리": "Paris", "루프": "Roof", "드림에디션": "Dream Edition", "블루세이버": "Blue Saver", "비전": "Vision", "비젼": "Vision", "엣지-UP": "Edge-UP", "그루브": "Groove", "레이디": "Lady", "에어로다이나믹": "Aerodynamic", "롱": "Long", "코치": "Coach", "파노라믹": "Panoramic", "월드컵": "World Cup", "레드핏": "Red Fit", "파이오니어": "Pioneer", "아너스": "Honors", "골드": "Gold", "일반형": "Standard", "테크노": "Techno", "판타스틱": "Fantastic", "파크": "Park", "아이언맨": "Iron Man", "e-시프터": "e-Shifter", "트랜스폼": "Transform", "블랙엣지": "Black Edge", "레드": "Red", "냉동차": "Refrigerated", "냉동탑차": "Refrigerated", "냉동": "Refrigerated", "매니아": "Mania", "데크": "Deck", "씨티": "City", "항속형": "Long Range", "업비트": "Upbeat", "DCT팩": "DCT Pack", "인디비주얼": "Individual", "볼드에디션": "Bold Edition", "퀘스트": "Quest", "하이컨트리": "High Country", "스타일팩": "Style Pack", "볼케이노": "Volcano", "투어링": "Touring", "이노베이션": "Innovation", "브라운에디션": "Brown Edition", "누아르": "Noir", "매직스페이스": "Magic Space", "프라다": "Prada", "솔": "Sol", "삼바": "Samba", "그랜저": "Grandeur", "카니발": "Carnival", "아반떼": "Avante", "쏘렌토": "Sorento", "싼타페": "Santa Fe", "쏘나타": "Sonata", "레이": "Ray", "스포티지": "Sportage", "팰리세이드": "Palisade", "모닝": "Morning", "렉스턴": "Rexton", "스타렉스": "Starex", "투싼": "Tucson", "스파크": "Spark", "티볼리": "Tivoli", "모하비": "Mohave", "스타리아": "Staria", "코란도": "Korando", "캐스퍼": "Casper", "셀토스": "Seltos", "코나": "Kona", "니로": "Niro", "제네시스": "Genesis", "기아": "Kia", "트랙스": "Trax", "말리부": "Malibu", "트레일블레이저": "Trailblazer", "토레스": "Torres", "스팅어": "Stinger", "맥스크루즈": "Maxcruz", "에쿠스": "Equus", "올란도": "Orlando", "크루즈": "Cruze", "엑센트": "Accent", "벨로스터": "Veloster", "베뉴": "Venue", "넥쏘": "Nexo", "스토닉": "Stonic", "쏘울": "Soul", "뉴코란도": "New Korando", "콜로라도": "Colorado", "베라크루즈": "Veracruz", "콜레오스": "Koleos", "캡티바": "Captiva", "프라이드": "Pride", "아이오닉": "Ioniq", "타스만": "Tasman", "트래버스": "Traverse", "임팔라": "Impala", "쏠라티": "Solati", "아슬란": "Aslan", "볼트": "Bolt", "카렌스": "Carens", "아베오": "Aveo", "아르카나": "Arkana", "라보": "Labo", "포르테": "Forte", "알페온": "Alpheon", "액티언": "Actyon", "무쏘": "Musso", "마티즈": "Matiz", "뉴카니발": "New Carnival", "에비뉴": "Avenue", "다마스": "Damas", "카마로": "Camaro", "클리오": "Clio", "필랑트": "Filante", "이쿼녹스": "Equinox", "뉴체어맨": "New Chairman", "뉴카렌스": "New Carens", "트위지": "Twizy", "캡처": "Captur", "오피러스": "Opirus", "갤로퍼": "Galloper", "체어맨": "Chairman", "조에": "Zoe", "테라칸": "Terracan", "라세티": "Lacetti", "로체": "Lotze", "리빅": "Livic", "뉴모닝": "New Morning", "바": "Bar", "포터": "Porter", "봉고": "Bongo", "마이티": "Mighty", "쏘나타N": "Sonata N"};
Object.assign(WORD_MAP, IMPORT_WORDS, {"프로": "Pro", "브라이트": "Bright", "퓨어": "Pure", "엑셀런스": "Excellence", "얼티메이트": "Ultimate", "블루텍": "BlueTEC", "R-다이나믹": "R-Dynamic", "X-다이나믹": "X-Dynamic", "파워": "Power", "리저브": "Reserve", "싱글모터": "Single Motor", "듀얼모터": "Dual Motor", "론지튜드": "Longitude", "올스페이스": "Allspace", "컴페티션": "Competition", "온라인": "Online", "4모션": "4Motion", "런치팩": "Launch Pack", "런치에디션": "Launch Edition", "블루모션": "BlueMotion", "페이버드": "Favoured", "R-디자인": "R-Design", "퍼스트": "First", "그란루쏘": "GranLusso", "베이스": "Base", "E-하이브리드": "E-Hybrid", "블랙라벨": "Black Label", "그란스포츠": "GranSport", "블루이피션시": "BlueEfficiency", "i퍼포먼스": "iPerformance", "스프린터": "Sprinter", "에코부스트": "EcoBoost", "포트폴리오": "Portfolio", "엘레강스": "Elegance", "씨라이언": "Sealion", "프로그레시브": "Progressive", "뱅크스": "Banks", "아우터": "Outer", "익스프레스밴": "Express Van", "컴포트": "Comfort", "시크": "Chic", "티록": "T-Roc", "올뉴어코드": "All New Accord", "램픽업": "Ram Pickup", "피카소": "Picasso", "샤인": "Shine", "비틀": "Beetle", "랩터": "Raptor", "와일드트랙": "Wildtrak", "다크": "Dark", "펠린": "Feline", "아틀라스": "Atlas", "오버랜드서밋": "Overland Summit", "크로스": "Cross", "레솔루트": "Resolute", "카브리오": "Cabrio", "에센스": "Essence", "모데나": "Modena", "티타늄": "Titanium", "포투": "ForTwo", "아토": "Atto", "레이블": "Label", "엑스트레일": "X-Trail", "언테임드": "Untamed", "돌핀": "Dolphin", "트렌드": "Trend", "드라이브": "Drive", "ST-라인": "ST-Line", "센서리": "Sensory", "허슬러": "Hustler", "시에라": "Sierra", "2인승밴": "2-seater Van", "스페이스투어러": "SpaceTourer", "리차지": "Recharge", "트윈": "Twin", "인텐시브": "Intensive", "트랜짓": "Transit", "프레지덴셜": "Presidential", "젠": "Zen", "칵투스": "Cactus", "악티브": "Aktiv", "크로스백": "Crossback", "콜벳": "Corvette", "소": "So", "GLE-클래스": "GLE-Class"});

// Token-level pass, run BEFORE MODEL_MAP/TRIM_MAP/romanization.
export function preTranslate(s?: string): string | undefined {
  if (!s) return s;
  let out = s
    .replace(/세부등급\s*없음/g, "")
    .replace(/(\d+)세대/g, (_m, n) => `${ordSuffix(n)} Gen`)
    .replace(/(\d+)인승(?!밴)/g, "$1-seater")
    .replace(/(\d+)마력/g, "$1 hp")
    .replace(/(\d+)도어/g, "$1-door")
    .replace(/(\d+)주년/g, "$1th Anniversary")
    .replace(/(\d+)시리즈/g, "$1 Series")
    .replace(/아이오닉(\d)/g, "Ioniq $1")
    .replace(/뉴([A-Z])/g, "New $1");
  out = out.split(/(\s+|[()\/,\[\]+])/).map((t) => (HANGUL_RE.test(t) && t in WORD_MAP ? WORD_MAP[t] : t)).join("");
  return out.replace(/\(\s*\)/g, "").replace(/\s+/g, " ").replace(/\s+\)/g, ")").replace(/\(\s+/g, "(").trim();
}
function ordSuffix(n: string) { const v = Number(n); const t = v % 100; if (t >= 11 && t <= 13) return n + "th"; return n + (v % 10 === 1 ? "st" : v % 10 === 2 ? "nd" : v % 10 === 3 ? "rd" : "th"); }

const fallback = (s: string) => (HANGUL_RE.test(s) ? romanize(s) : s);
export const modelSlugOf = (m: string) =>
  m.replace(/\([^)]*\)/g, "").trim().toLowerCase().replace(/\s+/g, "-");

// deno-lint-ignore no-explicit-any
export function translateListing<T extends Record<string, any>>(l: T): T {
  const out: Record<string, unknown> = { ...l };
  if (l.brand_name) {
    const raw = String(l.brand_name).trim();
    const en = BRAND_MAP[raw] ?? (HANGUL_RE.test(raw) ? romanize(raw) : null);
    if (en) { out.brand_name = en; out.brand_slug = slugify(en); }
  }
  if (l.region) out.region = fallback(REGION_MAP[l.region] ?? l.region);
  if (l.fuel_type) out.fuel_type = fallback(FUEL_MAP[l.fuel_type] ?? l.fuel_type);
  if (l.transmission) out.transmission = fallback(TRANSMISSION_MAP[l.transmission] ?? l.transmission);
  if (l.model_name) {
    const m = fallback(mapModel(mapText(preTranslate(l.model_name)))!);
    if (m !== l.model_name || (l.model_slug && HANGUL_RE.test(l.model_slug))) {
      out.model_name = m; out.model_slug = modelSlugOf(m);
    }
  }
  if (l.trim) out.trim = fallback(mapTrim(mapText(preTranslate(l.trim)))!) || null;
  return out as T;
}
