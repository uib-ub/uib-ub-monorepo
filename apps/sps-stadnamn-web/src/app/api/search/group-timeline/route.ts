import { base64UrlToString } from "@/lib/param-utils";
import { extractFacets } from "../../_utils/facets";
import { postQuery } from "../../_utils/post";

export const dynamic = "force-dynamic";

type GroupTimelineSource = {
  label?: string | null;
  year?: string | number | null;
  altLabels?: Array<string | { label?: string | null }>;
  attestations?: Array<{ label?: string | null; year?: string | number | null }>;
};

export async function GET(request: Request) {
  const { reservedParams, termFilters } = extractFacets(request);
  const perspective = reservedParams.perspective || "all";
  const rawGroup = reservedParams.group || "";

  if (!rawGroup) {
    return Response.json({ results: [], total: 0 }, { status: 200 });
  }

  let groupValue = rawGroup;
  if (!rawGroup.startsWith("grunnord_")) {
    try {
      groupValue = base64UrlToString(rawGroup);
    } catch {
      // Some group ids may already be plain text; fall back to raw value.
      groupValue = rawGroup;
    }
  }

  const hasGroupFilter = termFilters.some((filter: any) => {
    const termValue = filter?.term?.["group.id"];
    return termValue === groupValue;
  });

  const filters = hasGroupFilter
    ? termFilters
    : [{ term: { "group.id": groupValue } }, ...termFilters];

  const query: Record<string, any> = {
    size: 1000,
    track_scores: false,
    query: {
      bool: {
        filter: filters,
      },
    },
    sort: [
      {
        boost: {
          order: "desc",
          missing: "_last",
        },
      },
    ],
    _source: ["label", "year", "altLabels", "attestations"],
  };

  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch");
  const results: GroupTimelineSource[] = (data?.hits?.hits || [])
    .map((hit: any) => hit?._source)
    .filter(Boolean);

  return Response.json(
    {
      results,
      total: data?.hits?.total?.value ?? results.length,
    },
    { status },
  );
}
