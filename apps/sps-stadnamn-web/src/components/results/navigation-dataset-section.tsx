'use client'

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Clickable from "@/components/ui/clickable/clickable";
import { useGroupParam } from "@/lib/param-hooks";
import { useSearchQuery } from "@/lib/search-params";
import { datasetTitles } from "@/config/metadata-config";

type Bucket = {
  key: string;
  doc_count: number;
};

type DatasetOption = {
  id: string;
  label: string;
  count: number;
};

type DatasetFacetResponse = {
  aggregations?: {
    dataset?: {
      buckets?: Bucket[];
    };
  };
};

export default function NavigationDatasetSection() {
  const router = useRouter();
  const group = useGroupParam();
  const searchParams = useSearchParams();
  const { searchQueryString } = useSearchQuery();
  const [showAll, setShowAll] = useState(false);
  const selectedDatasets = searchParams.getAll("dataset");

  const queryString = useMemo(() => {
    if (!group) return null;
    const params = new URLSearchParams(searchQueryString);
    params.delete("dataset");
    return params.toString();
  }, [group, searchQueryString]);

  const { data } = useQuery<DatasetFacetResponse>({
    queryKey: ["navigationDatasetFacet", queryString],
    enabled: !!group && !!queryString,
    queryFn: async () => {
      const response = await fetch(`/api/facet?perspective=all&facets=dataset${queryString ? `&${queryString}` : ""}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset facet: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const options = useMemo<DatasetOption[]>(() => {
    const buckets = data?.aggregations?.dataset?.buckets || [];
    return buckets
      .map((bucket) => {
        const id = bucket.key?.split("-")?.[2];
        if (!id) return null;
        return {
          id,
          label: datasetTitles[id] || id,
          count: bucket.doc_count || 0,
        };
      })
      .filter((item): item is DatasetOption => !!item);
  }, [data]);

  if (!group) return null;
  if (!options.length) return null;
  if (options.length <= 1 && selectedDatasets.length === 0) return null;

  const collapsedOptionLimit = options.length === 4 ? 4 : 3;
  const hasMore = options.length > collapsedOptionLimit;
  const visibleOptions = showAll ? options : options.slice(0, collapsedOptionLimit);

  const toggleValue = (datasetId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.getAll("dataset");
    params.delete("dataset");
    existing.filter((value) => value !== datasetId).forEach((value) => params.append("dataset", value));
    if (!existing.includes(datasetId)) {
      params.append("dataset", datasetId);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full p-3 transition-colors bg-white">
      <div className="mb-3 flex items-center justify-between gap-3 h-8">
        <span className="text-base font-semibold">Datasett</span>
        {selectedDatasets.length > 0 && (
          <Clickable
            replace
            remove={["dataset"]}
            add={group ? { group } : {}}
            className="btn btn-compact btn-neutral"
            aria-label="Tøm datasetfilter"
          >
            Tøm
          </Clickable>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleOptions.map((option) => {
          const isSelected = selectedDatasets.includes(option.id);
          return (
            <button
              type="button"
              key={option.id}
              onClick={() => toggleValue(option.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${isSelected ? "bg-accent-800 text-white" : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"}`}
              title={option.label}
            >
              <span className="truncate max-w-full">{option.label}</span>
              <span className={`text-sm opacity-75 ml-1 ${isSelected ? "text-white" : ""}`}>({option.count})</span>
            </button>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-2">
          <button
            type="button"
            className="text-neutral-700 hover:text-accent-800 transition-colors text-sm py-1"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Vis færre" : `Vis fleire (+${options.length - collapsedOptionLimit})`}
          </button>
        </div>
      )}
    </div>
  );
}

