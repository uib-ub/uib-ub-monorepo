import { fitBoundsToGroupSources } from "@/lib/map-utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

type GroupModeMapDataArgs = {
  mapInstance: { current: any };
  isMobile: boolean;
  groupEncoded: string | null;
};

export default function useGroupModeMapData({
  mapInstance,
  isMobile,
  groupEncoded,
}: GroupModeMapDataArgs) {
  const lastGroupFitKeyRef = useRef<string | null>(null);

  const { data: groupMembersData } = useQuery({
    queryKey: ["groupMembers", groupEncoded],
    enabled: !!groupEncoded,
    queryFn: async () => {
      const params = new URLSearchParams({
        group: groupEncoded as string,
        size: "1000",
        includeSuppressed: "on",
      });
      const res = await fetch(`/api/search/table?${params.toString()}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!mapInstance.current || !groupEncoded || !groupMembersData) return;

    if (lastGroupFitKeyRef.current === groupEncoded) return;

    const hits: any[] = groupMembersData?.hits?.hits || [];
    const sources = hits.flatMap((h: any) => {
      const coords = h?._source?.location?.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        return [{ location: { coordinates: coords } }];
      }
      return [];
    });

    if (!sources.length) return;

    const rightPanelPx = isMobile ? 0 : Math.round(window.innerWidth * 0.4);
    fitBoundsToGroupSources(
      mapInstance.current,
      { sources },
      {
        duration: 0.25,
        maxZoom: 18,
        paddingTopLeft: [20, 20],
        paddingBottomRight: [rightPanelPx + 20, 20],
      }
    );
    lastGroupFitKeyRef.current = groupEncoded;
  }, [isMobile, mapInstance, groupEncoded, groupMembersData]);

  return { groupMembersData };
}
