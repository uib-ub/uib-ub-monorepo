'use client'
import { getValueByPath } from "@/lib/utils";
import { expandedMaxResultsParam } from "@/config/max-results";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PiMagnifyingGlass } from "react-icons/pi";

interface FacetItem {
  value: string;
  searchParams: Record<string, string>;
}

interface ProcessedFacet {
  title: string;
  items: FacetItem[];
}

export default function FacetsInfobox({
  source,
  docDataset,
  filteredFacets
}: {
  source: Record<string, any>;
  docDataset: string | null;
  filteredFacets: any[];
}) {
  const searchParams = useSearchParams();

  if (!docDataset) return null;

  const buildSearchUrl = (params: Record<string, string>) => {
    const urlParams = new URLSearchParams();

    urlParams.set('maxResults', expandedMaxResultsParam);

    // Preserve datasetTag if it exists in current URL
    const currentDatasetTag = searchParams.get('datasetTag');
    if (currentDatasetTag) {
      urlParams.set('datasetTag', currentDatasetTag);
    }

    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        urlParams.set(key, value);
      }
    });

    return `?${urlParams.toString()}`;
  };

  const processFacet = (facet: any): ProcessedFacet => {
    const value = getValueByPath(source, facet.key);
    const values = Array.isArray(value) ? value : [value].filter(Boolean);

    const items: FacetItem[] = values.map((val: any) => {
      const searchParams: Record<string, string> = { [facet.key]: val };

      // Add additional parameters if configured
      if (facet.additionalParams) {
        facet.additionalParams.forEach((param: string) => {
          const paramValue = getValueByPath(source, param);
          if (paramValue) {
            searchParams[param] = paramValue;
          }
        });
      }

      return {
        value: val,
        searchParams
      };
    });

    return {
      title: facet.label,
      items
    };
  };

  const processedFacets = filteredFacets.map(processFacet);

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex flex-col sm:flex-row flex-wrap gap-6">
        {processedFacets.map((facet, index) => (
          <div key={index} className="flex flex-col">
            <strong className="text-neutral-700">{facet.title}</strong>

            {facet.items.length === 1 ? (
              <p>
                <FacetLink item={facet.items[0]} />
              </p>
            ) : (
              <ul className="!list-none flex flex-wrap gap-x-4 !mx-0 !px-0">
                {facet.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <FacetLink item={item} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  function FacetLink({ item }: { item: FacetItem }) {
    return (
      <Link
        className="no-underline flex items-center gap-1"
        href={buildSearchUrl(item.searchParams)}
      >
        {item.value}
        <PiMagnifyingGlass aria-hidden className="inline text-primary-700" />
      </Link>
    );
  }
}