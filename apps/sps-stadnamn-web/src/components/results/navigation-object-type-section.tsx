'use client'

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Clickable from "@/components/ui/clickable/clickable";
import { useGroupParam } from "@/lib/param-hooks";
import { useSearchQuery } from "@/lib/search-params";

type Bucket = {
  key: string;
  doc_count: number;
};

type ObjectTypeOption = {
  value: string;
  label: string;
  count: number;
};

type ObjectTypeFacetResponse = {
  aggregations?: {
    sosi?: {
      buckets?: Bucket[];
    };
  };
};

export default function NavigationObjectTypeSection() {
  const router = useRouter();
  const group = useGroupParam();
  const searchParams = useSearchParams();
  const { searchQueryString } = useSearchQuery();
  const selectedObjectTypes = searchParams.getAll("sosi");

  const queryString = useMemo(() => {
    if (!group) return null;
    const params = new URLSearchParams(searchQueryString);
    params.delete("sosi");
    return params.toString();
  }, [group, searchQueryString]);

  const { data } = useQuery<ObjectTypeFacetResponse>({
    queryKey: ["navigationObjectTypeFacet", queryString],
    enabled: !!group && !!queryString,
    queryFn: async () => {
      const response = await fetch(`/api/facet?perspective=all&facets=sosi${queryString ? `&${queryString}` : ""}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch object type facet: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const options = useMemo<ObjectTypeOption[]>(() => {
    const buckets = data?.aggregations?.sosi?.buckets || [];
    return buckets
      .filter((bucket) => bucket.key && bucket.key !== "_false")
      .map((bucket) => ({
        value: bucket.key,
        label: bucket.key,
        count: bucket.doc_count || 0,
      }));
  }, [data]);

  if (!group) return null;
  if (!options.length) return null;
  if (options.length <= 1 && selectedObjectTypes.length === 0) return null;

  const toggleValue = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.getAll("sosi");
    params.delete("sosi");
    existing.filter((item) => item !== value).forEach((item) => params.append("sosi", item));
    if (!existing.includes(value)) {
      params.append("sosi", value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full p-3 transition-colors bg-white">
      <div className="mb-3 flex items-center justify-between gap-3 h-8">
        <span className="text-base font-semibold">Namneobjekttype</span>
        {selectedObjectTypes.length > 0 && (
          <Clickable
            replace
            remove={["sosi"]}
            add={group ? { group } : {}}
            className="btn btn-compact btn-neutral"
            aria-label="Tøm namneobjekttypefilter"
          >
            Tøm
          </Clickable>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedObjectTypes.includes(option.value);
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => toggleValue(option.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${isSelected ? "bg-accent-800 text-white" : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"}`}
              title={option.label}
            >
              <span className="truncate max-w-full">{option.label}</span>
              <span className={`text-sm opacity-75 ml-1 ${isSelected ? "text-white" : ""}`}>({option.count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

