import { mappings } from './mappings';
import { chcDataFieldTemplateComponent, chcIdTemplateComponent, chcLabelTemplateComponent, chcOwnersTemplateComponent, chcProductionTemplateComponent, chcSourceSettings } from './mappings/chc';

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

export const chcTemplate = {
  "name": "chc-settings",
  "index_patterns": ["search-chc*"],
  "composed_of": [
    chcSourceSettings.name,
    chcDataFieldTemplateComponent.name,
    chcIdTemplateComponent.name,
    chcLabelTemplateComponent.name,
    chcOwnersTemplateComponent.name,
    chcProductionTemplateComponent.name,
  ],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 0,
      "max_ngram_diff": 20,
      "default_pipeline": "chc-pipeline",
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

export const manifestsTemplate = {
  "name": "manifests-template",
  "index_patterns": ["search-manifests-*"],
  "template": {
    "settings": {
      "number_of_shards": "3",
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
      "properties": mappings.manifests.properties
    },
    "aliases": {
      "search-manifests": {}
    },
  },
  "priority": 500,
  "version": 3,
  "_meta": {
    "description": "my custom"
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

/* 

Add aliases, but i dont know what it means
"aliases": {
  "mydata": { }
}
*/