import { fitBoundsToGroupSources } from "@/lib/map-utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

type TreeModeMapDataArgs = {
  mapInstance: { current: any };
  isMobile: boolean;
  treeDataset?: string;
  treeAdm1?: string;
  treeAdm2?: string;
  treeUuid?: string;
};

type Coordinates = [number, number];

export default function useTreeModeMapData({
  mapInstance,
  isMobile,
  treeDataset,
  treeAdm1,
  treeAdm2,
  treeUuid,
}: TreeModeMapDataArgs) {
  const lastTreeFitKeyRef = useRef<string | null>(null);
  const lastAdmFitKeyRef = useRef<string | null>(null);

  // Tree mode overlay data: selected cadastral unit + its subunits (bruk)
  const { data: treeUnitDoc } = useQuery({
    queryKey: ["treeSelectedDoc", treeDataset, treeUuid],
    enabled: !!treeDataset && !!treeUuid,
    queryFn: async () => {
      const params = new URLSearchParams({ uuid: treeUuid as string, dataset: treeDataset as string });
      const res = await fetch(`/api/tree?${params.toString()}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.hits?.hits?.[0]?._source || null;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: treeSubunitsData } = useQuery({
    queryKey: ["cadastral", treeDataset, treeUuid],
    enabled: !!treeDataset && !!treeUuid,
    queryFn: async () => {
      const params = new URLSearchParams({
        perspective: treeDataset as string,
        within: treeUuid as string,
        size: "1000",
      });
      const res = await fetch(`/api/search/table?${params.toString()}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  // In tree mode, fit bounds to the selected cadastral unit + its subunits.
  useEffect(() => {
    if (!mapInstance.current) return;
    if (!treeDataset || !treeUuid) return;

    const key = `${treeDataset}:${treeUuid}`;
    if (lastTreeFitKeyRef.current === key) return;

    const sources: Array<{ location: { coordinates: Coordinates } }> = [];

    if (treeUnitDoc?.location?.coordinates?.length === 2) {
      const [lng, lat] = treeUnitDoc.location.coordinates as Coordinates;
      sources.push({ location: { coordinates: [lng, lat] } });
    }

    const subHits: any[] = treeSubunitsData?.hits?.hits || [];
    subHits.forEach((h: any) => {
      const coords = h?._source?.location?.coordinates;
      if (coords?.length === 2) {
        const [lng, lat] = coords as Coordinates;
        sources.push({ location: { coordinates: [lng, lat] } });
      }
    });

    if (!sources.length) return;

    const rightPanelPx = isMobile ? 0 : Math.round(window.innerWidth * 0.4);
    fitBoundsToGroupSources(
      mapInstance.current,
      {
        sources,
        ...(treeUnitDoc?.location?.coordinates?.length === 2
          ? { fields: { location: [{ coordinates: treeUnitDoc.location.coordinates }] } }
          : {}),
      },
      {
        duration: 0.25,
        maxZoom: 18,
        paddingTopLeft: [20, 20],
        paddingBottomRight: [rightPanelPx + 20, 20],
      }
    );
    lastTreeFitKeyRef.current = key;
  }, [isMobile, mapInstance, treeDataset, treeSubunitsData, treeUnitDoc, treeUuid]);

  // Fetch representative items for current adm level when no uuid is selected.
  const { data: treeAdmData } = useQuery({
    queryKey: ["treeData", treeDataset, treeAdm1, treeAdm2],
    enabled: !!treeDataset && !!treeAdm1 && !treeUuid,
    queryFn: async () => {
      const params = new URLSearchParams({ dataset: treeDataset as string });
      if (treeAdm1) params.set("adm1", treeAdm1);
      if (treeAdm2) params.set("adm2", treeAdm2);
      const res = await fetch(`/api/tree?${params.toString()}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  // In tree mode, fit bounds to all items at current adm level.
  useEffect(() => {
    if (!mapInstance.current || !treeDataset || !treeAdm1 || treeUuid) return;

    const key = `${treeDataset}:${treeAdm1}:${treeAdm2 || ""}`;
    if (lastAdmFitKeyRef.current === key) return;

    const hits: any[] = treeAdmData?.hits?.hits || [];
    const sources = hits.flatMap((h: any) => {
      const coords = h?.fields?.location?.[0]?.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        const [lng, lat] = coords as Coordinates;
        return [{ location: { coordinates: [lng, lat] as Coordinates } }];
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
        maxZoom: 14,
        paddingTopLeft: [20, 20],
        paddingBottomRight: [rightPanelPx + 20, 20],
      }
    );
    lastAdmFitKeyRef.current = key;
  }, [isMobile, mapInstance, treeAdm1, treeAdm2, treeAdmData, treeDataset, treeUuid]);

  return {
    treeUnitDoc,
    treeSubunitsData,
  };
}
