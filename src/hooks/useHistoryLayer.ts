import { useEffect, useRef } from "react";

// Pushes a history entry while a layer (sheet, full-screen picker) is open, so
// the phone/browser Back gesture closes the layer instead of leaving the page.
// Closing via UI buttons calls history.back() once to consume the entry.
export function useHistoryLayer(open: boolean, close: () => void) {
  const state = useRef({ pushed: false, fromPop: false });
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!open) return;
    const st = state.current;
    st.pushed = true;
    st.fromPop = false;
    window.history.pushState({ k4uLayer: true }, "");
    const onPop = () => {
      st.pushed = false;
      st.fromPop = true;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      // Closed via UI (not via Back): consume the entry we pushed.
      if (st.pushed && !st.fromPop) {
        st.pushed = false;
        window.history.back();
      }
    };
  }, [open]);
}
