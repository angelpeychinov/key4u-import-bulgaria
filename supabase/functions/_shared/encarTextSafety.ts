const HANGUL = /[가-힣]/;

const BODY_MAP: Record<string, string> = {
  "세단": "sedan", "해치백": "hatchback", "쿠페": "coupe", "컨버터블": "convertible", "SUV": "suv",
  "왜건": "wagon", "픽업트럭": "pickup", "승합": "van", "밴": "van", "승합/밴": "van", "RV": "minivan",
  "경차": "mini", "소형차": "sedan", "준중형차": "sedan", "중형차": "sedan", "대형차": "sedan",
  "스포츠카": "coupe", "승합차": "van", "화물차": "truck", "기타": "other",
};
const COLOR_MAP: Record<string, string> = {
  "흰색": "White", "화이트": "White", "검정색": "Black", "검은색": "Black", "블랙": "Black",
  "은색": "Silver", "실버": "Silver", "회색": "Gray", "쥐색": "Gray", "그레이": "Gray",
  "진주색": "Pearl White", "파란색": "Blue", "청색": "Blue", "빨간색": "Red", "분홍색": "Pink",
  "갈색": "Brown", "녹색": "Green", "노란색": "Yellow", "주황색": "Orange", "금색": "Gold",
  "은회색": "Silver Gray", "하늘색": "Light Blue", "베이지": "Beige", "보라색": "Purple",
  "청록색": "Teal", "기타": "Other",
};

const mappedValue = (value: string, map: Record<string, string>, lowercase = false): string | null => {
  const trimmed = value.trim();
  const mapped = map[trimmed] ?? (lowercase ? trimmed.toLowerCase() : trimmed);
  return !mapped || HANGUL.test(mapped) ? null : mapped;
};
export const mapDetailBody = (value: string) => mappedValue(value, BODY_MAP, true);
export const mapDetailColor = (value: string) => mappedValue(value, COLOR_MAP);

export const sanitizeFacets = (payload: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, Array.isArray(value)
    ? value.filter((item) => {
      if (typeof item === "string") return !HANGUL.test(item);
      if (!item || typeof item !== "object") return true;
      return ![item.value, item.slug, item.name].some((v) => typeof v === "string" && HANGUL.test(v));
    }) : value]));