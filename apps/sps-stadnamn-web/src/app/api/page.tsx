import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

const spec = {
  openapi: "3.0.0",
  info: {
    title: "Stadnamn API",
    version: "1.0.0",
    description: "API for accessing stadnamn (place names) data"
  },
  tags: [
    {
      name: "search",
      description: "Search operations for place names"
    },
    {
      name: "geo",
      description: "Geographic operations and queries"
    },
    {
      name: "document",
      description: "Document operations"
    }
  ],
  paths: {
    "/api/search/map": {
      get: {
        tags: ["search"],
        summary: "Returns search results with geographic bounds",
        description: "Searches without a query will only return geographic bounds. Searches without any filtering will only return geographic bounds.",
        parameters: [
          {
            name: "dataset",
            in: "query",
            description: "Filter by dataset",
            schema: {
              type: "string"
            }
          },
          {
            name: "size",
            in: "query",
            description: "Number of results to return. Defaults to 10",
            schema: {
              type: "integer"
            }
          },
          {
            name: "q",
            in: "query",
            description: "Search query string for filtering results",
            schema: {
              type: "string"
            }
          },
          {
            name: "sort",
            in: "query",
            description: "Sort order for results",
            schema: {
              type: "string"
            }
          }
        ],
        responses: {
          "200": {
            description: "Search results with geographic bounds",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    hits: {
                      type: "object",
                      properties: {
                        total: {
                          type: "object",
                          properties: {
                            value: {
                              type: "integer",
                              description: "Total number of matching results"
                            },
                            relation: {
                              type: "string",
                              enum: ["eq", "gte"],
                              description: "Whether the total is exact or estimated"
                            }
                          }
                        },
                        hits: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              fields: {
                                type: "object",
                                properties: {
                                  label: { type: "array", items: { type: "string" } },
                                  location: { type: "array", items: { type: "string" } },
                                  uuid: { type: "array", items: { type: "string" } }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    aggregations: {
                      type: "object",
                      properties: {
                        viewport: {
                          type: "object",
                          properties: {
                            bounds: {
                              type: "object",
                              properties: {
                                top_left: {
                                  type: "object",
                                  properties: {
                                    lat: { type: "number" },
                                    lon: { type: "number" }
                                  }
                                },
                                bottom_right: {
                                  type: "object",
                                  properties: {
                                    lat: { type: "number" },
                                    lon: { type: "number" }
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
    "/api/search/table": {
      get: {
        tags: ["search"],
        summary: "Returns paginated search results in a tabular format",
        parameters: [
          {
            name: "dataset",
            in: "query",
            description: "Filter by dataset",
            schema: {
              type: "string"
            }
          },
          {
            name: "size",
            in: "query",
            description: "Number of results to return per page. Defaults to 10",
            schema: {
              type: "integer"
            }
          },
          {
            name: "from",
            in: "query",
            description: "Starting index for pagination. Defaults to 0",
            schema: {
              type: "integer"
            }
          },
          {
            name: "q",
            in: "query",
            description: "Search query string for filtering results",
            schema: {
              type: "string"
            }
          },
          {
            name: "asc",
            in: "query",
            description: "Comma-separated list of fields to sort in ascending order",
            schema: {
              type: "string"
            }
          },
          {
            name: "desc",
            in: "query",
            description: "Comma-separated list of fields to sort in descending order",
            schema: {
              type: "string"
            }
          }
        ],
        responses: {
          "200": {
            description: "Search results in tabular format",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    hits: {
                      type: "object",
                      properties: {
                        total: {
                          type: "object",
                          properties: {
                            value: {
                              type: "integer",
                              description: "Total number of matching results"
                            },
                            relation: {
                              type: "string",
                              enum: ["eq", "gte"],
                              description: "Whether the total is exact or estimated"
                            }
                          }
                        },
                        hits: {
                          type: "array",
                          items: {
                            type: "object",
                            description: "Search result documents with requested fields"
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
    "/api/doc": {
      get: {
        tags: ["document"],
        summary: "Get a single document by UUID",
        parameters: [
          {
            name: "dataset",
            in: "query",
            description: "The dataset to search in. Defaults to '*'",
            schema: { type: "string" }
          },
          {
            name: "uuid",
            in: "query",
            required: true,
            description: "Document UUID",
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Document details",
            content: {
              "application/json": {
                schema: {
                  type: "object"
                }
              }
            }
          },
          "400": {
            description: "Invalid query"
          }
        }
      }
    },
    "/api/geo": {
      get: {
        tags: ["geo"],
        summary: "Get places within geographic bounds",
        parameters: [
          {
            name: "dataset",
            in: "query",
            description: "The dataset to search in",
            schema: { type: "string" }
          },
          {
            name: "topLeftLat",
            in: "query",
            description: "Top-left latitude of bounding box",
            schema: { type: "number" }
          },
          {
            name: "topLeftLng",
            in: "query",
            description: "Top-left longitude of bounding box",
            schema: { type: "number" }
          },
          {
            name: "bottomRightLat",
            in: "query",
            description: "Bottom-right latitude of bounding box",
            schema: { type: "number" }
          },
          {
            name: "bottomRightLng",
            in: "query",
            description: "Bottom-right longitude of bounding box",
            schema: { type: "number" }
          }
        ],
        responses: {
          "200": {
            description: "Geographic search results",
            content: {
              "application/json": {
                schema: {
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
                              location: { type: "array", items: { type: "string" } },
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
};

export default function IndexPage() {
  return (
    <main id="main" className="container dataset-info stable-scrollbar overflow-auto">
      <SwaggerUI spec={spec} />
    </main>
  );
}