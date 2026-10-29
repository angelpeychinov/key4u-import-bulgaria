export interface ImportPricingConfig { fx: number; carMarkupPct: number; rotterdamFixed: number; }
export const DEFAULT_IMPORT_PRICING: ImportPricingConfig = { fx: 1.5557 * 921.72, carMarkupPct: 1.75, rotterdamFixed: 2416 };
const HIDDEN_MARGIN = 150;

// Exact base-model matches; legacy rows without model_base use model_name containment.
export const OVERSIZE_MODELS: Readonly<Record<string, readonly string[]>> = {
  "Hyundai": ["Palisade", "Santa Fe"],
  "Genesis": ["GV80"],
  "Kia": ["Mohave", "Sorento"],
  "KG Mobility": ["Rexton", "Torres"],
  "SsangYong": ["Rexton", "Torres"],
  "BMW": ["X5", "X6", "X7", "XM"],
  "Mercedes-Benz": ["GLE-Class", "GLE", "GLS-Class", "GLS", "G-Class", "EQE SUV", "EQS SUV"],
  "Audi": ["Q7", "Q8", "e-tron", "Q8 e-tron"],
  "Porsche": ["Cayenne"],
  "Volvo": ["XC90"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Defender", "Discovery"],
  "Lexus": ["LX", "RX"],
  "Toyota": ["Land Cruiser"],
  "Tesla": ["Model X"],
  "Cadillac": ["Escalade"],
  "Lincoln": ["Navigator"],
  "Jeep": ["Grand Cherokee"],
  "Ford": ["Explorer"],
};
const normalizedBrand = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/[-_\s]+/g, " ");
export const isOversizeVehicle = (v: Record<string, unknown>): boolean => {
  const body = String(v.body_type ?? "").toLowerCase();
  const cc = Number(v.engine_cc ?? 0);
  if (["pickup", "truck", "van", "minivan"].some(b => body.includes(b))) return true;
  if (body.includes("suv") && Number.isFinite(cc) && cc > 2000) return true;
  const brand = normalizedBrand(v.brand_name || v.brand_slug);
  const models = Object.entries(OVERSIZE_MODELS).find(([name]) => normalizedBrand(name) === brand)?.[1];
  if (!models) return false;
  const base = String(v.model_base ?? "").trim().toLowerCase();
  const original = String(v.model_name ?? "").toLowerCase();
  return models.some(model => base ? base === model.toLowerCase() : original.includes(model.toLowerCase()));
};

const commissionForPrice = (krw: number): number => {
  if (krw <= 20000000) return 900;
  if (krw <= 35000000) return 1000;
  if (krw <= 50000000) return 1300;
  return 1500;
};

const dutyVatFee = (priceEur: number): number => {
  if (priceEur < 10000) return 1000;
  if (priceEur <= 15000) return 1300;
  if (priceEur <= 20000) return 1500;
  if (priceEur <= 25000) return 1800;
  if (priceEur <= 30000) return 2000;
  if (priceEur <= 35000) return 2200;
  return 2500;
};

// Calibrated against Key4U's real Rotterdam calculator (8 data points, ±40 €).
export const calculateKoreaImportPrice = (priceKrw: number, isOversize = false, cfg: ImportPricingConfig = DEFAULT_IMPORT_PRICING) => {
  // Цена на колата в EUR: без корейско ДДС (/1.1), с нашата надценка, по курс fx.
  const carEur = ((priceKrw / 1.1) * (1 + cfg.carMarkupPct / 100)) / cfg.fx;

  // "Цена до Ротердам"
  const rotterdam = carEur + cfg.rotterdamFixed + (isOversize ? 350 : 0);
  const dutyVat = dutyVatFee(carEur);
  const domTransport = isOversize ? 1150 : 900; // Rotterdam -> Bulgaria
  // "Комисионна и обработка"
  const handling = HIDDEN_MARGIN + commissionForPrice(priceKrw);

  return {
    price: rotterdam,
    transport: dutyVat + domTransport, // "Транспорт до България + мито и ДДС"
    handling,
    total: rotterdam + dutyVat + domTransport + handling,
  };
};

