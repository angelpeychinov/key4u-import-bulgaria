import { useEffect, useRef } from "react";

// Pushes a history entry while a layer (filter sheet, full-screen picker) is
// open, so the phone/browser Back gesture closes the top layer instead of
// leaving the page. A module-level stack tracks nesting (picker over sheet);
// `consuming` marks popstate events caused by a layer eating its own entry
// after a UI close, so lower layers don't mistake them for a user Back.
//
// Filter changes while a layer is open are replaceState'd onto the layer's
// own history entry, so both close paths rewrite the landed entry to the
// layer's last URL and notify the router with a synthetic popstate —
// otherwise closing a layer would revert the URL (and the filters).
const stack: symbol[] = [];
let consuming = 0;

const bump = () => {
  consuming++;
  // Safety: if no listener consumes the flag, don't swallow a future Back.
  window.setTimeout(() => { consuming = Math.max(0, consuming - 1); }, 300);
};

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

    let lastUrl = window.location.pathname + window.location.search + window.location.hash;
    const origReplace = window.history.replaceState;
    window.history.replaceState = function (this: History, ...args: Parameters<History["replaceState"]>) {
      if (args[2]) lastUrl = String(args[2]);
      return origReplace.apply(this, args);
    } as History["replaceState"];

    const restoreUrl = () => {
      window.setTimeout(() => {
        window.history.replaceState(window.history.state, "", lastUrl);
        bump();
        window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
      }, 0);
    };

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
      restoreUrl();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      window.history.replaceState = origReplace;
      const idx = stack.indexOf(id);
      if (idx >= 0) stack.splice(idx, 1);
      // Closed via UI (not via Back): consume the entry we pushed.
      if (pushed && !fromPop) {
        pushed = false;
        bump();
        window.history.back();
        restoreUrl();
      }
    };
  }, [open, id]);
}
