export const yearPresets = (currentYear: number): number[] =>
  Array.from({ length: Math.max(0, currentYear - 2000 + 1) }, (_, i) => currentYear - i);

export const normalizeYearInput = (value: string): string =>
  value.replace(/[^\d]/g, "").slice(0, 4);

export const isCompleteYearInput = (value: string): boolean =>
  value === "" || /^\d{4}$/.test(value);