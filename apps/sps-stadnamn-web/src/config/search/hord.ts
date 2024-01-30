import { SearchkitConfig } from "@searchkit/api";

const client: SearchkitConfig = {
  connection: {
    host: process.env.ES_HOST || 'https://search.testdu.uib.no/search' as string,
    apiKey: process.env.ES_TOKEN_DEV,
  },
  search_settings: {
    highlight_attributes: ["label_none", "description_none"],
    search_attributes: [
      "label",
    ],
    result_attributes: [
      "uuid",
      "_source",
    ],
    facet_attributes: [
      { attribute: "type", field: "type", type: "string" },
      {
        attribute: "maker.label_none",
        field: "label_none.keyword",
        nestedPath: "maker",
        type: "string",
      },
      {
        attribute: "subject.label_none",
        field: "label_none.keyword",
        nestedPath: "subject",
        type: "string",
      },
      {
        attribute: "spatial.label_none",
        field: "label_none.keyword",
        nestedPath: "spatial",
        type: "string",
      },
    ],
    geo_attribute: "location",
  },
};

export default client;