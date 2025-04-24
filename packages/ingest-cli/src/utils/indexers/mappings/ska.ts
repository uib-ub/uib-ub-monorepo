export const ska = {
  "properties": {
    "identifier": {
      "type": "keyword"
    },
    "birthDate": {
      "type": "date",
      "format": "yyyy-MM-dd||yyyy-MM||yyyy"
    },
    "deathDate": {
      "type": "date",
      "format": "yyyy-MM-dd||yyyy-MM||yyyy"
    },
    "formationDate": {
      "type": "date",
      "format": "yyyy-MM-dd||yyyy-MM||yyyy"
    },
    "extinctionDate": {
      "type": "date",
      "format": "yyyy-MM-dd||yyyy-MM||yyyy"
    },
    "label": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index": false
        }
      }
    },
    "labelSort": {
      "type": "keyword",
      "index": false
    },
    "basedNear": {
      "type": "keyword",
      "index": false
    },
    "img": {
      "type": "keyword",
      "index": false
    },
    "name": {
      "type": "text"
    },
    "hasThumbnail": {
      "type": "keyword",
      "index": false
    },
    "isDigitized": {
      "type": "keyword",
      "index": false
    },
    "hasZoom": {
      "type": "keyword",
      "index": false
    },
    "showWeb": {
      "type": "boolean"
    },
    "isCatalogued": {
      "type": "keyword",
      "index": false
    },
    "title": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index": false
        }
      }
    },
    "field_tags:name": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index": false
        },
        "language": {
          "type": "keyword",
          "index": false
        }
      }
    },
    "madeBefore": {
      "type": "date",
      "format": "yyyy-MM-dd||yyyy-MM||yyyy"
    },
    "madeAfter": {
      "type": "date",
      "format": "yyyy-MM-dd||yyyy-MM||yyyy"
    },
    "created": {
      "type": "date",
      "format": "yyyy-MM-dd||yyyy-MM||yyyy"
    },
    "dateSort": {
      "type": "date",
      "format": "yyyy-MM-dd||yyyy-MM||yyyy"
    },
    "isPartOf": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index": false
        },
        "language": {
          "type": "keyword",
          "index": false
        }
      }
    },
    "cataloguer": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index": false
        },
        "language": {
          "type": "keyword",
          "index": false
        }
      }
    },
    "maker": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index": false
        },
        "language": {
          "type": "keyword",
          "index": false
        }
      }
    },
    "subject": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index": false
        },
        "language": {
          "type": "keyword",
          "index": false
        }
      }
    },
    "type": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index": false
        },
        "language": {
          "type": "keyword",
          "index": false
        }
      }
    },
    "language": {
      "type": "keyword",
      "index": false
    },
    "uri": {
      "type": "keyword",
      "index": false
    },
    "preferredLabel": {
      "type": "keyword",
      "index": false
    },
    "suggest": {
      "type": "completion",
      "analyzer": "simple",
      "preserve_separators": true,
      "preserve_position_increments": true,
      "max_input_length": 50
    },
  }
}
