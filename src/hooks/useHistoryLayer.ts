import { useEffect, useRef } from "react";

// Pushes a history entry while a layer (filter sheet, full-screen picker) is
// open, so the phone/browser Back gesture closes the top layer instead of
// leaving the page. A module-level stack tracks nesting (picker over sheet);
// `consuming` marks popstate events caused by a layer eating its own entry
// after a UI close, so lower layers don't mistake them for a user Back.
const stack: symbol[] = [];
let consuming = 0;

export function useHistoryLayer(open: boolean, close: () => void) {
  const id = useRef(Symbol("layer")).current;
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!open) return;
    let pushed = true;
    let fromPop = false;
    stack.push(id);
    window.history.pushState({ k4uLayer: true }, "");

    const onPop = () => {
      if (consuming > 0) {
        consuming--;
        return;
      }
      if (stack[stack.length - 1] !== id) return; // a layer above us handles it
      stack.pop();
      pushed = false;
      fromPop = true;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      const idx = stack.indexOf(id);
      if (idx >= 0) stack.splice(idx, 1);
      // Closed via UI (not via Back): consume the entry we pushed.
      if (pushed && !fromPop) {
        pushed = false;
        consuming++;
        window.history.back();
        // Safety: if no listener consumed the flag, don't swallow a future Back.
        window.setTimeout(() => { consuming = Math.max(0, consuming - 1); }, 200);
      }
    };
  }, [open, id]);
}
