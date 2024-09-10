import { IndicesPutIndexTemplateRequest, MappingProperty } from '@elastic/elasticsearch/lib/api/types';

const timespanComponent: MappingProperty = {
  "type": "object",
  "properties": {
    "edtf": {
      "type": "text",
    },
    "begin_of_the_begin": {
      "type": "date",
    },
    "end_of_the_begin": {
      "type": "date"
    },
    "begin_of_the_end": {
      "type": "date"
    },
    "end_of_the_end": {
      "type": "date",
    },
    "range": {
      "type": "date_range",
      "store": true
    }
  }
}

const labelComponent = (field?: string): MappingProperty => {
  return {
    "type": "object",
    "properties": {
      "en": {
        "type": "text",
        "analyzer": "english",
        "copy_to": field ?? '_label_all',
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 512
          }
        }
      },
      "no": {
        "type": "text",
        "analyzer": "norwegian",
        "copy_to": field ?? '_label_all',
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 512
          }
        }
      }
    }
  }
};

const labelAllComponent: MappingProperty = {
  "type": "text",
  "store": true,
};

export const chcSourceSettings: IndicesPutIndexTemplateRequest = {
  "name": "chc-source-settings",
  "template": {
    "mappings": {
      "_source": {
        "excludes": [
          "_label_all",
          "*._label_all",
        ]
      }
    }
  }
}

export const chcIdTemplateComponent: IndicesPutIndexTemplateRequest = {
  "name": "chc-id-template-component",
  "template": {
    "mappings": {
      "properties": {
        "id": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        }
      },
    }
  },
  "_meta": {
    "description": "Mapping for id",
  }
}

export const chcDataFieldTemplateComponent: IndicesPutIndexTemplateRequest = {
  "name": "chc-data-field-template-component",
  "template": {
    "mappings": {
      "properties": {
        "data": {
          "type": "object",
          "enabled": false
        }
      },
    }
  },
  "_meta": {
    "description": "Mapping for a data field.",
  }
}

export const chcLabelTemplateComponent: IndicesPutIndexTemplateRequest = {
  "name": "chc-label-template-component",
  "template": {
    "mappings": {
      "properties": {
        "_label": labelComponent(),
        "_label_all": labelAllComponent
      },
    }
  },
  "_meta": {
    "description": "Mapping for _label",
  }
}

export const chcOwnersTemplateComponent: IndicesPutIndexTemplateRequest = {
  "name": "chc-owners-template-component",
  "template": {
    "mappings": {
      "properties": {
        "current_owner": {
          "type": "nested",
          "properties": {
            "id": {
              "type": "text",
              "index": false,
            },
            "type": {
              "type": "text",
              "index": false,
            },
            "_label": labelComponent('current_owner._label_all'),
            "_label_all": labelAllComponent
          }
        }
      }
    }
  },
  "_meta": {
    "description": "Mapping for current_owner",
  }
}

export const chcProductionTemplateComponent: IndicesPutIndexTemplateRequest = {
  "name": "chc-production-template-component",
  "template": {
    "mappings": {
      "properties": {
        "produced_by": {
          "type": "nested",
          "properties": {
            "id": {
              "type": "text",
              "index": false,
            },
            "type": {
              "type": "text",
              "index": false,
            },
            "_label": labelComponent('produced_by._label_all'),
            "_label_all": labelAllComponent,
            "technique": {
              "type": "nested",
              "properties": {
                "id": {
                  "type": "text",
                  "index": false,
                },
                "type": {
                  "type": "text",
                  "index": false,
                },
                "_label": labelComponent('produced_by.technique._label_all'),
                "_label_all": labelAllComponent,
              }
            },
            "carried_out_by": {
              "type": "nested",
              "properties": {
                "id": {
                  "type": "text",
                  "index": false,
                },
                "type": {
                  "type": "text",
                  "index": false,
                },
                "_label": labelComponent('produced_by.carried_out_by._label_all'),
                "_label_all": labelAllComponent,
              }
            },
            "timespan": timespanComponent
          }
        }
      }
    }
  },
  "_meta": {
    "description": "Mapping for produced_by",
  }
}