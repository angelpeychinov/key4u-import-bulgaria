export const CATEGORY_BODY: Record<string, string> = {
 "경차": "hatchback", "소형차": "hatchback", "준중형차": "sedan", "중형차": "sedan", "대형차": "sedan",
 "스포츠카": "coupe", "SUV": "suv", "RV": "minivan", "승합차": "van", "경승합차": "van", "화물차": "truck", "경화물차": "truck",
};
export const categoryBody = (category: string, model: string): string | null =>
 category === "소형차" && model.includes("세단") ? "sedan" : CATEGORY_BODY[category] ?? null;
export interface ModelBody { manufacturer: string; model: string; category: string; body_type: string; category_count: number }
export const pairKey = (manufacturer: string, model: string) => JSON.stringify([manufacturer, model]);
export function mergeModelBody(map: Map<string, ModelBody>, candidate: ModelBody) {
 const key = pairKey(candidate.manufacturer, candidate.model);
 const old = map.get(key);
 if (!old || candidate.category_count > old.category_count || (candidate.category_count === old.category_count && candidate.category < old.category)) map.set(key, candidate);
}
// Paginate explicitly: PostgREST's default limit must not truncate model taxonomy.
export async function loadModelBodies(db: any): Promise<Map<string, string>> {
 const map = new Map<string, string>();
 for (let offset = 0; ; offset += 1000) {
  const { data, error } = await db.from("encar_model_body").select("manufacturer,model,body_type").order("manufacturer").order("model").range(offset, offset + 999);
  if (error) throw new Error("Model body lookup failed: " + error.message);
  for (const row of data ?? []) map.set(pairKey(row.manufacturer, row.model), row.body_type);
  if ((data?.length ?? 0) < 1000) break;
 }
 return map;
}
export const preserveBody = (incoming: unknown, existing: unknown) => existing ?? incoming ?? null;