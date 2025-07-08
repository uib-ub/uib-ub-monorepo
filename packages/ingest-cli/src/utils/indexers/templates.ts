import { IndicesPutIndexTemplateRequest } from '@elastic/elasticsearch/lib/api/types';
import { mappings } from './mappings';
import { chcDataFieldTemplateComponent, chcCorePropertiesTemplateComponent, chcLabelTemplateComponent, chcMemberOfTemplateComponent, chcOwnersTemplateComponent, chcProductionTemplateComponent, chcSourceSettings } from './mappings/chc';

export const logTemplate = {
  "name": "log-template",
  "index_patterns": ["logs-chc"],
  "data_stream": {},
  "composed_of": ["log-mappings", "log-settings"],
  "priority": 500,
  "_meta": {
    "description": "Template for time series from CHC logs",
  }
}

export const chcTemplate: IndicesPutIndexTemplateRequest = {
  "name": "chc-settings",
  "index_patterns": ["search-chc*"],
  "composed_of": [
    chcSourceSettings.name,
    chcDataFieldTemplateComponent.name,
    chcCorePropertiesTemplateComponent.name,
    chcLabelTemplateComponent.name,
    chcOwnersTemplateComponent.name,
    chcProductionTemplateComponent.name,
    chcMemberOfTemplateComponent.name,
  ],
  "template": {
    "settings": {
      "index": {
        "max_terms_count": 20000,
      },
      "number_of_shards": 3,
      "number_of_replicas": 0,
      "max_ngram_diff": 20,
      "default_pipeline": "chc-pipeline",
      "analysis": {
        "analyzer": {
          "default": {
            "type": "custom",
            "filter": ["lowercase", "norwegian_stop"],
            "tokenizer": "standard"
          },
          "ubb-whitespace": {
            "type": "custom",
            "tokenizer": "whitespace",
            "filter": [
              "lowercase",
              "norwegian_stop"
            ],
          },
        },
        "filter": {
          "norwegian_stop": {
            "type": "stop",
            "stopwords": "_norwegian_"
          }
        }
      }
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "date_detection": false,
      "dynamic": false,
    },
    "aliases": {
      "search-chc": {}
    },
  },
  "priority": 500,
  "version": 3,
  "_meta": {
    "description": "Settings for CHC search indices containing items and entites."
  }
}

export const skaTemplate = {
  "name": "ska-demo-settings",
  "index_patterns": ["search-legacy-ska"],
  "template": {
    "settings": {
      "index.default_pipeline": "chc-pipeline",
      "number_of_shards": "2",
      "number_of_replicas": "0",
      "max_ngram_diff": "20",
      "analysis": {
        "analyzer": {
          "default": {
            "filter": ["lowercase", "norwegian_stop"],
            "tokenizer": "standard"
          },
          "ubb-whitespace": {
            "type": "custom",
            "tokenizer": "whitespace",
            "filter": [
              "lowercase",
              "norwegian_stop"
            ],
          },
        },
        "filter": {
          "norwegian_stop": {
            "type": "stop",
            "stopwords": "_norwegian_"
          }
        }
      }
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "properties": mappings.ska.properties
    },
  },
  "priority": 500,
  "version": 3,
  "_meta": {
    "description": "my custom"
  }
}

export const wabTemplate = {
  "name": "wab-demo-settings",
  "index_patterns": ["search-legacy-wab"],
  "template": {
    "settings": {
      "index.default_pipeline": "cho-demo-pipeline",
      "number_of_shards": "2",
      "number_of_replicas": "0",
      "max_ngram_diff": "20",
      "analysis": {
        "filter": {
          "ngram_filter": {
            "token_chars": [
              "letter",
              "digit",
              "punctuation",
              "symbol",
              "whitespace"
            ],
            "min_gram": "2",
            "type": "ngram",
            "max_gram": "20"
          }
        },
        "analyzer": {
          "default": {
            "tokenizer": "standard",
            "stopwords": "_english_",
            "filter": [
              "lowercase"
            ]
          },
          "ngram_analyzer": {
            "filter": [
              "lowercase",
              "asciifolding",
              "ngram_filter"
            ],
            "type": "custom",
            "tokenizer": "whitespace"
          },
          "whitespace_analyzer": {
            "filter": [
              "lowercase",
              "asciifolding"
            ],
            "type": "custom",
            "tokenizer": "whitespace"
          }
        }
      }
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "properties": mappings.wab.properties
    },
  },
  "priority": 500,
  "version": 3,
  "_meta": {
    "description": "my custom"
  }
}
