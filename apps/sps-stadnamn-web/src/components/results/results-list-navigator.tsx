'use client'
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import {
  useGroupParam,
  useInitDecoded,
  useInitParam,
  useNoGeoOn,
  useSearchSortParam,
  useSourceViewOn,
} from "@/lib/param-hooks";
import { base64UrlToString } from "@/lib/param-utils";
import { useSearchQuery } from "@/lib/search-params";
import useAdmContextData from "@/state/hooks/adm-context-data";
import useSearchData from "@/state/hooks/search-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { PiCaretLeftBold, PiCaretRightBold, PiXBold } from "react-icons/pi";

function extractNavItemsFromSearchResponse(data: any): Array<{ id: string; point: string | null }> {
  const hits: any[] = data?.hits?.hits ?? [];
  const items: Array<{ id: string; point: string | null }> = [];
  for (const hit of hits) {
    const id = hit?.fields?.uuid?.[0];
    if (typeof id !== "string" || !id.trim()) continue;

    const coords = hit?.fields?.location?.[0]?.coordinates;
    const point =
      Array.isArray(coords) && coords.length === 2 && Number.isFinite(Number(coords[0])) && Number.isFinite(Number(coords[1]))
        ? `${coords[1]},${coords[0]}` // [lon, lat] -> "lat,lon"
        : null;

    items.push({ id, point });
  }
  return items;
}

export default function ResultsListNavigator({ className }: { className?: string }) {
  const sourceViewOn = useSourceViewOn();
  const initParam = useInitParam();
  const initDecoded = useInitDecoded();
  const group = useGroupParam();
  const selectedGroup = group ? base64UrlToString(group) : null;
  const noGeo = useNoGeoOn();
  const searchSort = useSearchSortParam();
  const { searchQueryString } = useSearchQuery();
  const { contextAdmPairs, admContextStatus } = useAdmContextData();
  const { docTotalHits } = useSearchData();
  const { isMobile } = useContext(GlobalContext);

  const admContextReady = !noGeo || admContextStatus === "success" || admContextStatus === "error";
  const currentId = sourceViewOn ? initParam : initDecoded;
  const shouldFetchFullList = Boolean(sourceViewOn && currentId && selectedGroup && admContextReady);

  const total = docTotalHits?.value ?? null;
  const size = typeof total === "number" && Number.isFinite(total) ? Math.max(0, total) : null;

  const fullListQuery = useQuery({
    queryKey: [
      "resultsListNavigator",
      searchQueryString,
      searchSort,
      noGeo,
      selectedGroup,
      size,
      // contextAdmPairs can be a new array each render; stringify to stabilize the key.
      JSON.stringify(contextAdmPairs ?? []),
    ],
    enabled: shouldFetchFullList && typeof size === "number" && size > 0,
    queryFn: async () => {
      const res = await fetch(`/api/search/list${searchQueryString ? `?${searchQueryString}` : ""}`, {
        method: "POST",
        body: JSON.stringify({
          size,
          from: 0,
          sortPoint: null,
          searchSort,
          noGeo,
          contextAdmPairs,
          init: currentId,
          exclude: null,
          idField: "uuid",
          selectedGroup,
          sourceViewOn: true,
        }),
      });
      if (!res.ok) throw new Error(`list query failed: ${res.status}`);
      return await res.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const items = useMemo(() => {
    if (!shouldFetchFullList) return [];
    if (!fullListQuery.data) return [];
    return extractNavItemsFromSearchResponse(fullListQuery.data);
  }, [fullListQuery.data, shouldFetchFullList]);

  if (!currentId) return null;
  if (items.length <= 1) return null;

  const currentIndex = items.findIndex((it) => it.id === currentId);
  const hasCurrent = currentIndex !== -1;

  const prevItem =
    hasCurrent && items.length > 1
      ? items[(currentIndex - 1 + items.length) % items.length]
      : null;
  const nextItem =
    hasCurrent && items.length > 1
      ? items[(currentIndex + 1) % items.length]
      : null;
  const prevId = prevItem?.id ?? null;
  const nextId = nextItem?.id ?? null;
  const prevPoint = prevItem?.point ?? null;
  const nextPoint = nextItem?.point ?? null;

  return (
    <nav aria-label="Naviger i resultat" className={`relative w-full bg-neutral-50 rounded-t-md flex items-center p-2 ${className ?? ""}`}>
      <ClickableIcon
        label="Førre"
        add={{ init: prevId, point: prevPoint }}
        remove={["activePoint", "activeYear", "activeName"]}
        notClickable={!prevId || fullListQuery.isFetching}
        className="btn btn-outline btn-compact rounded-full w-9 h-9 flex items-center justify-center border-neutral-200 bg-white"
      >
        <PiCaretLeftBold aria-hidden="true" className="text-base" />
      </ClickableIcon>

      <span className="text-sm xl:text-base text-neutral-900 font-sans font-semibold tabular-nums whitespace-nowrap min-w-[4.5rem] text-center">
        {fullListQuery.isFetching
          ? `… / ${size ?? items.length}`
          : hasCurrent
            ? `${currentIndex + 1} / ${items.length}`
            : `– / ${items.length}`}
      </span>

      <ClickableIcon
        label="Neste"
        add={{ init: nextId, point: nextPoint }}
        remove={["activePoint", "activeYear", "activeName"]}
        notClickable={!nextId || fullListQuery.isFetching}
        className="btn btn-outline btn-compact rounded-full w-9 h-9 flex items-center justify-center border-neutral-200 bg-white"
      >
        <PiCaretRightBold aria-hidden="true" className="text-base" />
      </ClickableIcon>

      <div className={`absolute inset-y-0 ${isMobile ? "right-3" : "right-2"} flex items-center`}>
        <ClickableIcon
          label="Lukk navigering"
          remove={["activePoint", "activeYear", "activeName", "init", "resultLimit"]}
          className="btn btn-outline rounded-full text-neutral-900 p-2"
        >
          <PiXBold aria-hidden="true" className="text-lg text-neutral-800" />
        </ClickableIcon>
      </div>
    </nav>
  );
}

