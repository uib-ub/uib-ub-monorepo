export const chc = {
  "properties": {
    "@context": {
      "type": "keyword",
      "index": false
    },
    "id": {
      "type": "keyword"
    },
    "type": {
      "type": "keyword"
    },
    "hasRepresentation": {
      "enabled": false,
      "type": "object"
    },
    "hasThumbnail": {
      "type": "keyword"
    },
    "showWeb": {
      "type": "boolean"
    },
    "technique": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "type": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_none": {
          "type": "text",
          "analyzer": "norwegian",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_no": {
          "type": "keyword",
        },
        "label_en": {
          "type": "keyword",
        }
      }
    },
    "image": {
      "type": "keyword"
    },
    "subjectOfManifest": {
      "type": "keyword"
    },
    "location": {
      "type": "geo_point"
    },
    "available": {
      "type": "date",
    },
    "description_none": {
      "type": "text",
      "analyzer": "norwegian",
      "fields": {
        "keyword": {
          "type": "keyword",
        }
      }
    },
    "description_no": {
      "type": "text",
      "analyzer": "norwegian",
      "fields": {
        "keyword": {
          "type": "keyword",
        }
      }
    },
    "description_en": {
      "type": "text",
      "analyzer": "norwegian",
      "fields": {
        "keyword": {
          "type": "keyword",
        }
      }
    },
    "identifier": {
      "type": "keyword"
    },
    "isPartOf": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "type": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label": {
          "type": "nested",
          "properties": {
            "en": {
              "type": "keyword"
            },
            "no": {
              "type": "keyword"
            }
          }
        }
      }
    },
    "rightsHolder": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "type": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_none": {
          "type": "text",
          "analyzer": "norwegian",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_no": {
          "type": "keyword",
        },
        "label_en": {
          "type": "keyword",
        },
        "lat": {
          "type": "float"
        },
        "long": {
          "type": "float"
        }
      }
    },
    "spatial": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "type": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_none": {
          "type": "text",
          "analyzer": "norwegian",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_no": {
          "type": "keyword",
        },
        "label_en": {
          "type": "keyword",
        }
      }
    },
    "subject": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "type": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_none": {
          "type": "text",
          "analyzer": "norwegian",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_no": {
          "type": "keyword",
        },
        "label_en": {
          "type": "keyword",
        }
      }
    },
    "title": {
      "type": "nested",
      "properties": {
        "none": {
          "type": "keyword"
        },
        "no": {
          "type": "keyword"
        },
        "en": {
          "type": "keyword"
        }
      }
    },
    "owner": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "type": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_none": {
          "type": "text",
          "analyzer": "norwegian",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_no": {
          "type": "keyword",
        },
        "label_en": {
          "type": "keyword",
        },
        "lat": {
          "type": "float"
        },
        "long": {
          "type": "float"
        }
      }
    },
    "label_none": {
      "type": "text",
      "analyzer": "norwegian",
      "fields": {
        "keyword": {
          "type": "keyword",
        }
      }
    },
    "label_no": {
      "type": "keyword",
    },
    "label_en": {
      "type": "keyword",
    },
    "homepage": {
      "type": "keyword",
      "index": false
    },
    "maker": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "type": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_none": {
          "type": "text",
          "analyzer": "norwegian",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_en": {
          "type": "keyword",
        }
      }
    },
    "timespan": {
      "type": "nested",
      "properties": {
        "edtf": {
          "type": "keyword"
        },
        "begin_of_the_begin": {
          "type": "date"
        },
        "end_of_the_begin": {
          "type": "date"
        },
        "begin_of_the_end": {
          "type": "date"
        },
        "end_of_the_end": {
          "type": "date"
        }
      }
    }
  }
}