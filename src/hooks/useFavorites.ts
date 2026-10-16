import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "k4u-favorites";
const CHANGE_EVENT = "k4u-favorites-changed";

const readFavorites = (): string[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
};

const writeFavorites = (ids: string[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

export const useFavorites = () => {
  const [ids, setIds] = useState<string[]>(readFavorites);

  useEffect(() => {
    const sync = () => setIds(readFavorites());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((encarId: string) => {
    const current = readFavorites();
    const next = current.includes(encarId)
      ? current.filter((id) => id !== encarId)
      : [...current, encarId];
    writeFavorites(next);
  }, []);

  const has = useCallback((encarId?: string) => !!encarId && ids.includes(encarId), [ids]);

  return { ids, count: ids.length, toggle, has };
};
