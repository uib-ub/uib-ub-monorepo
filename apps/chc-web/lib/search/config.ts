import { SearchkitConfig } from '@searchkit/api';

const client: SearchkitConfig = {
  connection: {
    host: process.env.ES_HOST,
    apiKey: process.env.ES_APIKEY,
  },
  search_settings: {
    highlight_attributes: [
      "label_none",
      "description_none",
    ],
    search_attributes: [
      "objectID",
      "type",
      "label",
      "label.no",
      "label.none",
      "label_none",
      "label_none.keyword",
      "label_en",
      "description",
      "description.no",
      "description.en",
      "description_none",
      "description_none.keyword",
      "description_en",
      "description_en",
      "maker.label_none",
      "subject.label_none",
      "spatial.label_none",
    ],
    result_attributes: [
      "objectID",
      "id",
      "identifier",
      "type",
      "label",
      "label_none",
      "label_no",
      "label_en",
      "homepage",
      "image",
      "subjectOfManifest",
      "description",
      "description_none",
      "maker",
      "subject",
      "spatial",
      "coordinates",
      "location",
      "available"
    ],
    facet_attributes: [
      { attribute: "type", field: "type", type: "string" },
      { attribute: "maker.label_none", field: "label_none.keyword", nestedPath: "maker", type: "string" },
      { attribute: "subject.label_none", field: "label_none.keyword", nestedPath: "subject", type: "string" },
      { attribute: "spatial.label_none", field: "label_none.keyword", nestedPath: "spatial", type: "string" },
    ],
    geo_attribute: "location"
  },
};

export default client;