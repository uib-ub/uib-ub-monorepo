import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function parseStrictNonNegativeInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 0) return null;
  if (String(i) !== String(value).trim()) return null;
  return i;
}

export function useScrollIndexParam(paramName: string = "scroll") {
  const searchParams = useSearchParams();
  const raw = searchParams.get(paramName);

  return useMemo(() => parseStrictNonNegativeInt(raw), [raw]);
}

export function replaceScrollParamInHistory(opts: {
  scrollIndex: number | null | undefined;
  basePathname?: string;
  searchParams?: URLSearchParams;
}) {
  if (typeof window === "undefined") return;
  const basePathname = opts.basePathname ?? window.location.pathname;
  const params = new URLSearchParams(
    opts.searchParams ?? (window.location.search || "")
  );

  if (opts.scrollIndex == null) {
    params.delete("scroll");
  } else {
    params.set("scroll", String(opts.scrollIndex));
  }

  const next = params.toString();
  const nextUrl = `${basePathname}${next ? `?${next}` : ""}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

type ResultsScrollRestoreArgs = {
  scrollIndex: number | null;
  sourceViewOn: boolean;
  scrollableContentRef?: React.RefObject<HTMLDivElement | null> | null;
};

/**
 * Scroll-restore for results list:
 * - Uses index-based `scroll` param
 * - Does NOT use querySelector (caller attaches refs)
 * - Only auto-scrolls on initial page load OR when returning from sourceView->list
 * - Gated by card load completion only on hard reload
 */
export function useResultsScrollRestore({
  scrollIndex,
  sourceViewOn,
  scrollableContentRef,
}: ResultsScrollRestoreArgs) {
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const loadingByIndexRef = useRef<Array<boolean | undefined>>([]);
  const onLoadingChangeByIndexRef = useRef<
    Array<((loading: boolean) => void) | undefined>
  >([]);

  const [loadingTick, setLoadingTick] = useState(0);
  const didAutoScrollRef = useRef<number | null>(null);
  const initialScrollIndexRef = useRef<number | null>(null);
  const prevSourceViewOnRef = useRef<boolean>(false);

  const isHardReload = useMemo(() => {
    try {
      const nav = performance.getEntriesByType?.("navigation")?.[0] as any;
      return nav?.type === "reload";
    } catch {
      return false;
    }
  }, []);

  // Capture the initial scroll index seen on first mount.
  useEffect(() => {
    if (initialScrollIndexRef.current != null) return;
    if (scrollIndex == null) return;
    initialScrollIndexRef.current = scrollIndex;
  }, [scrollIndex]);

  // Re-arm when returning from Underpostar (same /search route).
  useEffect(() => {
    const prev = prevSourceViewOnRef.current;
    prevSourceViewOnRef.current = Boolean(sourceViewOn);
    if (!prev || sourceViewOn) return;
    if (scrollIndex == null) return;
    initialScrollIndexRef.current = scrollIndex;
    didAutoScrollRef.current = null;
    setLoadingTick((t) => t + 1);
  }, [sourceViewOn, scrollIndex]);

  // Re-arm when page is restored from bfcache.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      initialScrollIndexRef.current = scrollIndex;
      didAutoScrollRef.current = null;
      setLoadingTick((t) => t + 1);
    };
    window.addEventListener("pageshow", onPageShow as any);
    return () => window.removeEventListener("pageshow", onPageShow as any);
  }, [scrollIndex]);

  useEffect(() => {
    const targetIndex = initialScrollIndexRef.current;
    if (targetIndex == null) return;
    if (didAutoScrollRef.current === targetIndex) return;

    const targetEl = rowRefs.current[targetIndex] ?? null;
    if (!targetEl) return;

    if (isHardReload) {
      for (let i = 0; i <= targetIndex; i++) {
        const loading = loadingByIndexRef.current[i];
        if (loading === undefined) return;
        if (loading === true) return;
      }
    }

    const container = scrollableContentRef?.current ?? null;
    const targetRect = targetEl.getBoundingClientRect();
    const containerRect = container ? container.getBoundingClientRect() : null;

    const isFullyVisible = containerRect
      ? targetRect.top >= containerRect.top && targetRect.bottom <= containerRect.bottom
      : targetRect.top >= 0 && targetRect.bottom <= window.innerHeight;

    if (!isFullyVisible) {
      try {
        targetEl.scrollIntoView({ block: "center", inline: "nearest" });
      } catch {
        targetEl.scrollIntoView();
      }
    }

    didAutoScrollRef.current = targetIndex;
  }, [isHardReload, loadingTick, scrollableContentRef]);

  const setRowRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      rowRefs.current[index] = el;
    };
  }, []);

  const onLoadingChangeForIndex = useCallback((index: number) => {
    return (onLoadingChangeByIndexRef.current[index] ??=
      (loading: boolean) => {
        const next = Boolean(loading);
        const prev = loadingByIndexRef.current[index];
        if (prev === next) return;
        loadingByIndexRef.current[index] = next;
        setLoadingTick((t) => t + 1);
      });
  }, []);

  return { setRowRef, onLoadingChangeForIndex };
}

