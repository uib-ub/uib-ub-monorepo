import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

import { datasetTitles } from "@/config/metadata-config"

const datasetCodes = Object.keys(datasetTitles).sort()

const spec = {
  openapi: "3.0.0",
  info: {
    title: "Stadnamn API",
    version: "1.0.0",
    description: `API for accessing stadnamn (place names) data.

## Concepts

**Kjeldeoppslag** (source record): a single record or document from a particular dataset. Has a \`uuid\` and belongs to one namnegruppe (\`group.id\`).

**Namnegruppe** (name group): kjeldeoppslag with identical names or spelling variants of the same name, grouped by geographic proximity. \`group.id\` is the uuid of one of the members.`
  },
  components: {
    schemas: {
      DatasetCode: {
        type: "string",
        description:
          "Dataset code. This list is generated from the server configuration and may expand over time as new datasets are added.",
        enum: datasetCodes
      },
      CommonQueryParams: {
        type: "object",
        description: "Many search endpoints accept these query parameters.",
        properties: {
          q: { type: "string", description: "Full-text search query (place name, area, etc.)." },
          dataset: { $ref: "#/components/schemas/DatasetCode", description: "Filter by dataset." },
          perspective: { type: "string", description: "Search perspective, e.g. 'all'. Defaults to 'all'." }
        }
      }
    }
  },
  tags: [
    { name: "Search", description: "The endpoints powering the map interface: bounds, result count, results collapsed by name group, and markers." },
    { name: "Source records", description: "Table, download, document lookup, and namnegruppe members." },
    { name: "IIIF", description: "Archive resources adhering to the International Image Interoperability Framework (IIIF Presentation API 3)" }
  ],
  paths: {
    "/api/search": {
      get: {
        tags: ["Search"],
        summary: "Map bounds",
        description: `Returns only the geographic bounds (viewport) of the current search — no document hits. The response has size 0 and includes \`aggregations.viewport.bounds\` with \`top_left\` and \`bottom_right\` (each \`{ lat, lon }\`). Use this to fit the map to the result area.

**Parameters:** \`q\` (full-text search, place name or area), \`dataset\` (filter by dataset code), \`perspective\` (e.g. \`all\`). Any facet filters from the search UI can be passed as query params.

**Related:** For the list of namnegrupper use POST /api/search/collapsed; for map markers use GET /api/markers/{zoom}/{x}/{y}.`,
        parameters: [
          { name: "q", in: "query", description: "Full-text search (place name, area)", schema: { type: "string" } },
          { name: "dataset", in: "query", description: "Filter by dataset", schema: { $ref: "#/components/schemas/DatasetCode" } },
          { name: "perspective", in: "query", description: "Search perspective, default 'all'", schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "aggregations.viewport.bounds: { top_left: { lat, lon }, bottom_right: { lat, lon } }; no hits array.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    aggregations: {
                      type: "object",
                      properties: {
                        viewport: {
                          type: "object",
                          properties: {
                            bounds: {
                              type: "object",
                              properties: {
                                top_left: { type: "object", properties: { lat: { type: "number" }, lon: { type: "number" } } },
                                bottom_right: { type: "object", properties: { lat: { type: "number" }, lon: { type: "number" } } }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/search/collapsed": {
      post: {
        tags: ["Search"],
        summary: "Map list results (by namnegruppe)",
        description: `Returns one hit per namnegruppe — this is what powers the map sidebar list. Results are collapsed by \`group.id\`, so each hit represents one name group, not every kjeldeoppslag.

**Response:** \`hits.hits\` is an array; each item has \`fields\` with \`group.id\`, \`group.label\`, \`label\`, \`location\`, \`uuid\` (one representative document per group). \`hits.total\` gives the total number of groups. To get every kjeldeoppslag in a group, call GET /api/group?group={group.id} with the \`group.id\` from the hit.

**Query params:** \`q\`, \`dataset\`, \`perspective\` (same as other search endpoints); facet filters can be passed as query params.

**Request body:** \`size\` (number of groups, default 10), \`from\` (pagination offset). Optional \`initLocation\`: array of two numbers \`[longitude, latitude]\` — when provided, results are sorted by distance from this point (e.g. when the user has selected a group and you want "other groups nearby" first). Omit or leave empty to use default sort.`,
        parameters: [
          { name: "q", in: "query", description: "Full-text search", schema: { type: "string" } },
          { name: "dataset", in: "query", description: "Filter by dataset", schema: { $ref: "#/components/schemas/DatasetCode" } },
          { name: "perspective", in: "query", description: "Search perspective", schema: { type: "string" } }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  size: { type: "integer", description: "Number of groups to return. Default 10." },
                  from: { type: "integer", description: "Offset for pagination." },
                  initLocation: {
                    type: "array",
                    minItems: 2,
                    maxItems: 2,
                    items: { type: "number" },
                    description: "Optional [longitude, latitude] to sort by distance from this point. Must be exactly two numbers; omit or send null to skip distance sort."
                  }
                }
              },
              example: {
                size: 10,
                from: 0
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Hits collapsed by group.id; each hit is one namnegruppe.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    hits: {
                      type: "object",
                      properties: {
                        total: { type: "object", properties: { value: { type: "integer" }, relation: { type: "string" } } },
                        hits: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              fields: {
                                type: "object",
                                properties: {
                                  "group.id": { type: "array", items: { type: "string" } },
                                  "group.label": { type: "array", items: { type: "string" } },
                                  label: { type: "array", items: { type: "string" } },
                                  location: { type: "array" },
                                  uuid: { type: "array", items: { type: "string" } }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/search/table": {
      get: {
        tags: ["Source records"],
        summary: "Table search — all kjeldeoppslag",
        description: `Returns a flat, paginated list of **all** matching kjeldeoppslag — one hit per document, no namnegruppe grouping. Use for tabular display, bulk operations, or when you need every attestation.

**Response:** \`hits.hits\` is an array of full documents (\`_source\` is returned). Each item is one kjeldeoppslag. \`hits.total.value\` and \`hits.total.relation\` (eq/gte) give the total count. Highlighting is applied when \`q\` is set and the UI requests it.

**Query params:** \`q\`, \`dataset\`, \`perspective\` (same as search UI); \`size\` (results per page, default 10), \`from\` (offset for pagination). Sort: \`asc\` and/or \`desc\` with comma-separated field names (e.g. \`asc=label.keyword\`). Facet filters from the search UI can be passed as query params.`,
        parameters: [
          { name: "q", in: "query", description: "Full-text search", schema: { type: "string" } },
          { name: "dataset", in: "query", description: "Filter by dataset", schema: { $ref: "#/components/schemas/DatasetCode" } },
          { name: "perspective", in: "query", description: "Search perspective", schema: { type: "string" } },
          { name: "size", in: "query", description: "Results per page. Default 10", schema: { type: "integer" } },
          { name: "from", in: "query", description: "Pagination offset. Default 0", schema: { type: "integer" } },
          { name: "asc", in: "query", description: "Comma-separated fields for ascending sort", schema: { type: "string" } },
          { name: "desc", in: "query", description: "Comma-separated fields for descending sort", schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Paginated list of kjeldeoppslag (one document per hit)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    hits: {
                      type: "object",
                      properties: {
                        total: { type: "object", properties: { value: { type: "integer" }, relation: { type: "string" } } },
                        hits: { type: "array", items: { type: "object", description: "One kjeldeoppslag per item; _source contains full document." } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/download": {
      get: {
        tags: ["Source records"],
        summary: "Download search results",
        description: `Export matching kjeldeoppslag as JSON. Same query and facet params as search; you control which fields and how many rows.

**Parameters:** \`fields\` — comma-separated list of field names to return (e.g. \`label,uuid,location,adm1,adm2\`). If omitted, no fields are returned in each hit (only \`_source\` is absent; check backend). \`size\` — max number of results (default 10000). \`from\`, \`asc\`, \`desc\` as in table search.

**Response:** Elasticsearch-style \`hits.hits\` array. Each hit has \`fields\` (and not full \`_source\` when using \`fields\` param). Use the \`location\` field client-side to build GeoJSON: each location is a GeoJSON-style geometry, so you can construct a FeatureCollection from the hits.`,
        parameters: [
          { name: "q", in: "query", description: "Full-text search", schema: { type: "string" } },
          { name: "dataset", in: "query", description: "Filter by dataset", schema: { $ref: "#/components/schemas/DatasetCode" } },
          { name: "perspective", in: "query", description: "Search perspective", schema: { type: "string" } },
          { name: "fields", in: "query", description: "Comma-separated field names to return", schema: { type: "string" } },
          { name: "size", in: "query", description: "Max results. Default 10000", schema: { type: "integer" } },
          { name: "from", in: "query", description: "Pagination offset", schema: { type: "integer" } },
          { name: "asc", in: "query", description: "Sort ascending (comma-separated fields)", schema: { type: "string" } },
          { name: "desc", in: "query", description: "Sort descending (comma-separated fields)", schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Search result hits (JSON); use fields and size to shape output.",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      }
    },
    "/api/doc": {
      get: {
        tags: ["Source records"],
        summary: "Document lookup by UUID (query)",
        description: `Fetch one kjeldeoppslag by its UUID. Optional \`dataset\` filter; omit to search across all datasets. If the document has redirects, a hit by redirect UUID is also resolved.

**Response:** Standard Elasticsearch hit: \`_source\` contains the full document (label, attestations, year, location, group, iiif, content, etc.). \`_source.group.id\` is the namnegruppe id (uuid of one member); use GET /api/group?group={group.id} to get all kjeldeoppslag in that group.

**Equivalent to** GET /uuid/{uuid}.json (path style). With the .json extension the server returns this JSON; without extension it returns the HTML document page for humans.`,
        parameters: [
          { name: "uuid", in: "query", required: true, description: "Document UUID", schema: { type: "string" } },
          { name: "dataset", in: "query", description: "Limit to this dataset. Default '*'", schema: { $ref: "#/components/schemas/DatasetCode" } }
        ],
        responses: {
          "200": {
            description: "Elasticsearch hit with _source containing the document (including group.id for namnegruppe lookup)",
            content: { "application/json": { schema: { type: "object" } } }
          },
          "400": { description: "Invalid query (e.g. missing uuid)" }
        }
      }
    },
    "/uuid/{uuid}.json": {
      get: {
        tags: ["Source records"],
        summary: "Document lookup by UUID (path)",
        description: `Same document as GET /api/doc?uuid={uuid}. **The .json extension is required** for the API response; without it the server serves the HTML document page (human-facing).

**Path:** \`/uuid/{uuid}.json\` — the path parameter is the UUID only; .json is literal. Example: \`/uuid/550e8400-e29b-41d4-a716-446655440000.json\`.

**Variants:** Replace .json with .geojson to get a single GeoJSON Feature (geometry from document location, properties from selected fields). Use .jsonld for JSON-LD representation of the document. All return Content-Type application/json.`,
        parameters: [
          { name: "uuid", in: "path", required: true, description: "Document UUID (without extension; .json is part of the path)", schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Document (JSON), GeoJSON Feature (.geojson), or JSON-LD (.jsonld)",
            content: { "application/json": { schema: { type: "object" } } }
          },
          "404": { description: "Document not found" }
        }
      }
    },
    "/api/group": {
      get: {
        tags: ["Source records"],
        summary: "All documents in a namnegruppe",
        description: `Returns every kjeldeoppslag in the given namnegruppe. Use this when you have a document (or a group.id from search) and want all source records in that name group.

**Parameter \`group\`:** The namnegruppe id — i.e. the uuid of any one of the documents in the group (same as \`group.id\` on any member). May be base64url-encoded or raw.

**Optional:** \`q\`, \`dataset\`, \`perspective\` to filter within the group (same semantics as search).

**Response:** \`sources\` — array of full document objects (label, uuid, attestations, year, location, iiif, content, etc.). \`group\` — group-level metadata (label, adm1, adm2, id). Top-level \`boost\`, \`placeScore\`, \`fields\` from a representative hit may also be present.`,
        parameters: [
          { name: "group", in: "query", required: true, description: "Namnegruppe id (uuid of one member, or group.id). May be base64url-encoded or raw.", schema: { type: "string" } },
          { name: "q", in: "query", description: "Filter within group", schema: { type: "string" } },
          { name: "dataset", in: "query", description: "Filter by dataset", schema: { $ref: "#/components/schemas/DatasetCode" } },
          { name: "perspective", in: "query", description: "Search perspective", schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Object with sources[] (all kjeldeoppslag in the group) and optional topDoc/group metadata",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sources: { type: "array", items: { type: "object" }, description: "All documents in this namnegruppe" },
                    group: { type: "object", description: "Group metadata (label, adm1, adm2, id)" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/markers/{zoom}/{x}/{y}": {
      get: {
        tags: ["Search"],
        summary: "Map tile markers (by namnegruppe)",
        description: `Returns one representative hit per namnegruppe for the given map tile. Used to draw markers on the map — each marker corresponds to one namnegruppe, not every kjeldeoppslag.

**Path:** \`zoom\`, \`x\`, \`y\` are geotile coordinates (e.g. from a tile layer). The backend aggregates by tile and then by \`group.id\`, so each bucket has one representative document per group in that tile.

**Response:** \`aggregations.grid.buckets\` — each bucket has a \`key\` (tile key) and \`groups.buckets\` — each group bucket has \`top.hits.hits\` with one hit (fields: label, location, uuid, group.id, group.label). Use these to place markers and link to the group (e.g. /api/group or the document page).

**Query params:** \`q\`, \`dataset\`, \`perspective\` (same as search). \`totalHits\` — cap on how many hits are considered for aggregation (can reduce load on large result sets).`,
        parameters: [
          { name: "zoom", in: "path", required: true, description: "Geotile zoom level", schema: { type: "string" } },
          { name: "x", in: "path", required: true, description: "Geotile X coordinate", schema: { type: "string" } },
          { name: "y", in: "path", required: true, description: "Geotile Y coordinate", schema: { type: "string" } },
          { name: "dataset", in: "query", description: "Filter by dataset", schema: { $ref: "#/components/schemas/DatasetCode" } },
          { name: "q", in: "query", description: "Full-text search", schema: { type: "string" } },
          { name: "perspective", in: "query", description: "Search perspective", schema: { type: "string" } },
          { name: "totalHits", in: "query", description: "Cap hits considered for aggregation", schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Grid buckets with one representative hit per namnegruppe per tile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    aggregations: {
                      type: "object",
                      properties: {
                        grid: {
                          type: "object",
                          properties: {
                            buckets: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  key: { type: "string" },
                                  groups: {
                                    type: "object",
                                    properties: {
                                      buckets: {
                                        type: "array",
                                        items: {
                                          type: "object",
                                          properties: {
                                            top: {
                                              type: "object",
                                              properties: {
                                                hits: {
                                                  type: "object",
                                                  properties: {
                                                    hits: {
                                                      type: "array",
                                                      items: {
                                                        type: "object",
                                                        properties: {
                                                          fields: {
                                                            type: "object",
                                                            properties: {
                                                              label: { type: "array", items: { type: "string" } },
                                                              location: { type: "array" },
                                                              uuid: { type: "array", items: { type: "string" } },
                                                              "group.id": { type: "array", items: { type: "string" } },
                                                              "group.label": { type: "array", items: { type: "string" } }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/iiif/collection/{uuid}": {
      get: {
        tags: ["IIIF"],
        summary: "IIIF Collection",
        description: `IIIF Presentation API 3 Collection (JSON). Returns a collection that lists child manifests (images/audio) in the archive. Use for collection-level browsing or as the top-level entry for an archive.

**Path:** \`/iiif/collection/{uuid}\` — \`uuid\` is the collection document UUID (from the archive/IIIF dataset).

**Response:** IIIF Presentation 3 JSON with \`@context\`, \`id\`, \`type: "Collection"\`, \`items\` array of manifest references (\`id\`, \`type: "Manifest"\`). Compatible with Mirador, Universal Viewer, and other IIIF clients. CORS headers allow cross-origin use.`,
        parameters: [{ name: "uuid", in: "path", required: true, description: "Collection document UUID", schema: { type: "string" } }],
        responses: { "200": { description: "IIIF Collection JSON", content: { "application/json": { schema: { type: "object" } } } } }
      }
    },
    "/iiif/manifest/{uuid}": {
      get: {
        tags: ["IIIF"],
        summary: "IIIF Manifest",
        description: `IIIF Presentation API 3 Manifest (JSON) for one archive item (image or audio). Use for embedding in IIIF viewers or for deep linking to a specific image/recording.

**Path:** \`/iiif/manifest/{uuid}\` — \`uuid\` is the manifest document UUID (from the archive/IIIF dataset).

**Response:** IIIF Presentation 3 JSON with \`@context\`, \`id\`, \`type: "Manifest"\`, \`items\` (canvases), and optional \`partOf\` (parent collection). Canvases reference image or audio services (e.g. iiif.spraksamlingane.no). Compatible with Mirador, Universal Viewer, and other IIIF viewers. CORS headers allow cross-origin use.`,
        parameters: [{ name: "uuid", in: "path", required: true, description: "Manifest document UUID", schema: { type: "string" } }],
        responses: { "200": { description: "IIIF Manifest JSON", content: { "application/json": { schema: { type: "object" } } } } }
      }
    },
    "/api/iiif/search": {
      get: {
        tags: ["IIIF"],
        summary: "IIIF archive search",
        description: `Search within the archive (IIIF collections). Returns matching manifests or items for browsing and filtering in the archive UI or for building custom archive views.

**Parameters:** \`collection\` — optional collection UUID to scope search to one collection. \`q\` — full-text search. \`type\` — optional filter by resource type. \`size\` — number of results (default 20). \`from\` — pagination offset (default 0).

**Response:** JSON with search results (structure depends on backend; typically a list of manifest or item references with metadata). Use with the collection and manifest endpoints to build archive browsing.`,
        parameters: [
          { name: "collection", in: "query", description: "Optional collection UUID to scope search", schema: { type: "string" } },
          { name: "q", in: "query", description: "Search query", schema: { type: "string" } },
          { name: "type", in: "query", description: "Filter by type", schema: { type: "string" } },
          { name: "size", in: "query", description: "Results per page. Default 20", schema: { type: "integer" } },
          { name: "from", in: "query", description: "Pagination offset. Default 0", schema: { type: "integer" } }
        ],
        responses: { "200": { description: "Search results (manifests/items)", content: { "application/json": { schema: { type: "object" } } } } }
      }
    }
  }
};

export default function IndexPage() {
  return (
    <main id="main" className="dataset-info bg-white h-full w-full grow">
      <SwaggerUI spec={spec} />
    </main>
  );
}