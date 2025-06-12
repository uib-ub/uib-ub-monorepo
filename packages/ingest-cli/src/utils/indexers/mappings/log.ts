import { IndicesPutIndexTemplateRequest } from '@elastic/elasticsearch/lib/api/types';

export const logMappings: IndicesPutIndexTemplateRequest = {
  "name": "log-mappings",
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date",
          "format": "date_optional_time||epoch_millis"
        },
        "message": {
          "type": "wildcard"
        }
      }
    }
  },
  "_meta": {
    "description": "Mappings for @timestamp and message fields",
  }
}