import { SearchkitConfig } from "@searchkit/api";

const client: SearchkitConfig = {
  connection: {
    host: process.env.ES_HOST as string,
    apiKey: process.env.ES_APIKEY,
  },
  search_settings: {
    highlight_attributes: ["_label.no", "description.no"],
    search_attributes: [
      "hasType",
      "identifier.keyword",
      "_label",
      "_label.no",
      "_label.none",
      "_label.en",
      "description",
      "description.no",
      "description.en",
      "maker._label.no",
      "maker._label.en",
      "subject._label.no",
      "subject._label.en",
      "spatial._label.no",
      "spatial._label.en",
    ],
    result_attributes: [
      "id",
      "identifier",
      "hasType",
      "_label",
      "homepage",
      "image",
      "subjectOfManifest",
      "description",
      "maker",
      "subject",
      "spatial",
      "coordinates",
      "location",
      "available",
    ],
    facet_attributes: [
      { attribute: "type", field: "type", type: "string" },
      {
        attribute: "producedBy.carriedOutBy._label.no",
        field: "producedBy.carriedOutBy._label.no.keyword",
        type: "string",
      },
      {
        attribute: "subject._label.no",
        field: "_label.no.keyword",
        nestedPath: "subject",
        type: "string",
      },
      {
        attribute: "spatial._label.no",
        field: "_label.no.keyword",
        nestedPath: "spatial",
        type: "string",
      },
    ],
    sorting: {
      default: {
        field: '_score',
        order: 'desc'
      },
      _available_desc: {
        field: '_available',
        order: 'desc'
      },
      _available_asc: {
        field: '_available',
        order: 'asc'
      },
      _identifier_desc: {
        field: 'identifier',
        order: 'desc'
      },
      _identifier_asc: {
        field: 'identifier',
        order: 'asc'
      }
    },
    geo_attribute: "coordinates",
  },
};

export default client;
