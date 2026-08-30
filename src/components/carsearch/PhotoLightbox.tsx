import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  photos: string[];
  index: number | null;
  title?: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export const PhotoLightbox = ({ photos, index, title, onClose, onIndexChange }: Props) => {
  const open = index !== null && photos.length > 0;
  const touchStartX = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const go = useCallback(
    (delta: number) => {
      if (index === null || photos.length === 0) return;
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange],
  );

  useEffect(() => {
    setLoaded(false);
  }, [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, go]);

  if (!open || index === null) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Галерия със снимки"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in"
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        const end = e.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (start === null || end === undefined) return;
        const dx = end - start;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button
        type="button"
        aria-label="Затвори"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Предишна снимка"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:left-6 sm:p-3"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Следваща снимка"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:right-6 sm:p-3"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <img
        key={photos[index]}
        src={photos[index]}
        alt={`${title ?? "Обява"} снимка ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        onLoad={() => setLoaded(true)}
        className={`max-h-[85vh] max-w-full select-none rounded-lg object-contain transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {photos.length > 1 && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
          {index + 1} / {photos.length}
        </span>
      )}
    </div>
  );
};
