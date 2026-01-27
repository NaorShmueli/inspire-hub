import { useLayoutEffect } from "react";

type Options = {
  heightPx: number;
  rows?: number;
  enabled?: boolean;
};

/**
 * Forces a textarea to a fixed height using inline `!important` styles.
 *
 * This is intentionally defensive: some browser extensions (and occasionally
 * late-applied CSS) can rewrite textarea height after route navigation.
 */
export function useForceTextareaHeight(
  ref: React.RefObject<HTMLTextAreaElement>,
  { heightPx, rows, enabled = true }: Options,
  deps: React.DependencyList = []
) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const value = `${heightPx}px`;

    const apply = () => {
      el.style.setProperty("min-height", value, "important");
      el.style.setProperty("height", value, "important");
      el.style.setProperty("max-height", value, "important");
      if (typeof rows === "number") el.rows = rows;
    };

    // Apply multiple times to win races vs late layout/extension changes.
    apply();
    const raf1 = requestAnimationFrame(apply);
    const t0 = window.setTimeout(apply, 0);
    const t1 = window.setTimeout(apply, 50);
    const t2 = window.setTimeout(apply, 250);

    // Re-apply if something mutates the textarea's attributes.
    const observer = new MutationObserver(() => apply());
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["style", "class", "rows"],
    });

    const onFocus = () => apply();
    el.addEventListener("focus", onFocus);

    return () => {
      cancelAnimationFrame(raf1);
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer.disconnect();
      el.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, heightPx, rows, ref, ...deps]);
}
