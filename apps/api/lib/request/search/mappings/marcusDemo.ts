export const marcus_demo = {
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
      "type": "keyword"
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
          "type": "keyword",
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
      "type": "nested",
      "properties": {
        "type": {
          "type": "keyword"
        },
        "@value": {
          "type": "date"
        }
      }
    },
    "description_none": {
      "type": "keyword",
    },
    "description_no": {
      "type": "keyword",
    },
    "description_en": {
      "type": "keyword",
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
          "type": "keyword",
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
          "type": "keyword",
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
          "type": "keyword",
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
          "type": "keyword",
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
      "type": "keyword",
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
          "type": "keyword",
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
        "beginOfTheBegin": {
          "type": "date"
        },
        "endOfTheBegin": {
          "type": "date"
        },
        "beginOfTheEnd": {
          "type": "date"
        },
        "endOfTheEnd": {
          "type": "date"
        }
      }
    }
  }
}