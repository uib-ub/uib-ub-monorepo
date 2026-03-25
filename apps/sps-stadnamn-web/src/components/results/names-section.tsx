'use client'

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Clickable from "@/components/ui/clickable/clickable";
import { useGetAllParam, useGroupParam } from "@/lib/param-hooks";
import { useSearchQuery } from "@/lib/search-params";
import { useNotificationStore } from "@/state/zustand/notification-store";

type Attestation = {
  label?: string | null;
  year?: string | number | null;
};

type GroupTimelineSource = {
  label?: string | null;
  year?: string | number | null;
  altLabels?: Array<string | { label?: string | null }>;
  attestations?: Attestation[];
};

type GroupTimelineResponse = {
  results: GroupTimelineSource[];
  total: number;
};

type LabelYearPair = {
  label: string;
  year: string | null;
};

function normalizeYear(value: unknown): string | null {
  if (value == null) return null;
  const year = String(value);
  if (!year || year.startsWith('0')) return null;
  return year;
}

function toName(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "label" in value) {
    const label = (value as { label?: unknown }).label;
    return typeof label === "string" ? label : null;
  }
  return null;
}

export default function NamesSection() {
  const router = useRouter();
  const group = useGroupParam();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const searchParams = useSearchParams();
  const { searchQueryString } = useSearchQuery();
  const [showAll, setShowAll] = useState(false);
  const names = useGetAllParam('name');
  const years = useGetAllParam('year');

  const toggleFacetValue = (key: 'year' | 'name', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const existingValues = params.getAll(key);
    params.delete(key);
    existingValues
      .filter((v) => v !== value)
      .forEach((v) => params.append(key, v));
    if (!existingValues.includes(value)) {
      params.append(key, value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const queryString = useMemo(() => {
    if (!group) return null;
    const params = new URLSearchParams(searchQueryString);
    params.delete('year');
    params.delete('name');
    params.set('group', group);
    return params.toString();
  }, [group, searchQueryString]);

  const { data } = useQuery<GroupTimelineResponse>({
    queryKey: ['groupTimelineData', queryString],
    queryFn: async () => {
      const res = await fetch(`/api/search/group-timeline${queryString ? `?${queryString}` : ''}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch group timeline: ${res.status}`);
      }
      return res.json();
    },
    enabled: !!group && !!queryString,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const sources = data?.results ?? [];

  const {
    yearsOrdered,
    namesWithoutYear,
    nameCounts,
    namesByYear,
  } = useMemo(() => {
    const labelYearPairs: LabelYearPair[] = [];
    const counts: Record<string, number> = {};

    const pushLabelYearPair = (name: string | null, year: unknown) => {
      if (!name) return;
      const normalizedYear = normalizeYear(year);
      labelYearPairs.push({ label: name, year: normalizedYear });
      counts[name] = (counts[name] || 0) + 1;
    };

    const buildNameToYears = (pairs: LabelYearPair[]) => {
      const map: Record<string, Set<string>> = {};
      pairs.forEach(({ label, year }) => {
        map[label] = map[label] || new Set<string>();
        if (!year) return;
        map[label].add(year);
      });
      return map;
    };

    const buildNamesByYear = (map: Record<string, Set<string>>) => {
      const result: Record<string, string[]> = {};
      Object.entries(map).forEach(([name, years]) => {
        if (years.size === 0) return;
        const orderedYears = Array.from(years)
          .map((year) => ({ year, num: Number(year) }))
          .filter((entry) => !Number.isNaN(entry.num))
          .sort((a, b) => a.num - b.num)
          .map((entry) => entry.year);
        const earliestYear = orderedYears[0] ?? Array.from(years).sort()[0];
        if (!earliestYear) return;
        result[earliestYear] = result[earliestYear] || [];
        result[earliestYear].push(name);
      });

      Object.keys(result).forEach((year) => {
        result[year].sort();
      });
      return result;
    };

    const buildYearsOrdered = (namesByYearMap: Record<string, string[]>) =>
      Object.keys(namesByYearMap)
        .map((year) => Number(year))
        .filter((year) => !Number.isNaN(year))
        .sort((a, b) => a - b)
        .map(String);

    sources.forEach((source) => {
      const datasetYear = normalizeYear(source.year);

      // Dataset-level labels use dataset year.
      pushLabelYearPair(toName(source.label), datasetYear);

      source.altLabels?.forEach((altLabel) => {
        pushLabelYearPair(toName(altLabel), datasetYear);
      });
    

      // Attestations use their own year, not dataset year.
      source.attestations?.forEach((attestation) => {
        pushLabelYearPair(toName(attestation?.label), attestation?.year);
      });
    });

    const nameToYears = buildNameToYears(labelYearPairs);
    const computedNamesByYear = buildNamesByYear(nameToYears);
    const computedYearsOrdered = buildYearsOrdered(computedNamesByYear);
    const computedNamesWithoutYear = Object.entries(nameToYears)
      .filter(([, years]) => years.size === 0)
      .map(([name]) => name);

    return {
      yearsOrdered: computedYearsOrdered,
      namesByYear: computedNamesByYear,
      namesWithoutYear: computedNamesWithoutYear,
      nameCounts: counts,
    };
  }, [sources]);

  useEffect(() => {
    if (!group) return;
    addNotification({
      id: "group-label-filter-info",
      variant: "warning",
      message: "Kjeldeformer kan innehalde feil",
      details:
        "Filtreringsalternativa for kjeldeformer er ikkje naudsynlegvis komplette, og dei kan innehalde ord som eigentleg ikkje er namn. Det er berre mein som eit verktøy for å filtrere namnegrupper med mange kjelder, og kvar namneform visast på det tidlegaste året vi har fått henta ut frå datasetta.",
      permanentDismiss: true,
    });

    return () => removeNotification("group-label-filter-info");
  }, [group, addNotification, removeNotification]);

  if (!group || (yearsOrdered.length === 0 && namesWithoutYear.length === 0)) return null;

  const hasMore = yearsOrdered.length > 3;
  const visibleYears = showAll
    ? yearsOrdered
    : yearsOrdered.slice(0, 3);

  return (
    <div className="w-full p-3 transition-colors bg-white">
      <div className="mb-3 flex items-center justify-between gap-3 h-8">
        <span className="text-base font-semibold">Kjeldeformer</span>
        { (years?.length > 0 || names.length > 0) && <Clickable
          replace
          remove={['year', 'name']}
          add={group ? { group } : {}}
          className="btn btn-compact btn-neutral"
          aria-label="Tøm gruppefilter"
        >
          Tøm
        </Clickable>}
      </div>

      <ul className="relative !mx-0 !py-1 !pr-0 !pl-2" role="list">
        {visibleYears.map((year, index) => {
          const isLast = index === visibleYears.length - 1;
          const isYearSelected = years.includes(year);
          const namesForYear = namesByYear[year] || [];

          return (
            <li key={year} className="flex items-start !pb-4 !pt-0 relative">
              <div
                className={`bg-primary-300 absolute w-1 left-2 ${isLast ? 'top-4 h-2' : 'top-4 h-[calc(100%-0.25rem)]'}`}
                aria-hidden="true"
              />
              <div
                className={`w-4 h-4 rounded-full absolute left-0.5 top-2 transition-colors ${isYearSelected ? 'bg-accent-800' : 'bg-primary-500'}`}
                aria-hidden="true"
              />

              <div className="ml-6 flex items-start gap-2 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleFacetValue('year', year)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[2.5rem] whitespace-nowrap ${isYearSelected ? 'bg-accent-800 text-white' : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'}`}
                >
                  {year}
                </button>

                {namesForYear.length > 0 && (
                  <div className="flex-1 min-w-0 flex flex-wrap gap-2">
                    {namesForYear.map((name) => {
                      const isNameSelected = names.includes(name);
                      return (
                        <button
                          type="button"
                          key={name}
                          onClick={() => toggleFacetValue('name', name)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors max-w-full overflow-hidden ${isNameSelected ? 'bg-accent-800 text-white' : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'}`}
                          title={name}
                        >
                          <span className="truncate max-w-full">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {namesWithoutYear.length > 0 && (
        <div className="mt-2">
          <div className="text-sm font-medium text-neutral-700 mb-1.5">Namneformer utan år</div>
          <div className="flex flex-wrap gap-2">
            {namesWithoutYear.map((name) => {
              const isNameSelected = names.includes(name);
              return (
              <button
                type="button"
                key={name}
                onClick={() => toggleFacetValue('name', name)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${isNameSelected ? 'bg-accent-800 text-white' : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'}`}
              >
                <span>{name}</span>
                <span className="text-sm opacity-75 ml-1">({nameCounts[name] || 0})</span>
              </button>
            )})}
          </div>
        </div>
      )}

      {hasMore && (
        <div className="mt-2">
          <button
            type="button"
            className="text-neutral-700 hover:text-accent-800 transition-colors text-sm py-1"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? 'Vis færre' : `Vis fleire (+${yearsOrdered.length - 3})`}
          </button>
        </div>
      )}
    </div>
  );
}
