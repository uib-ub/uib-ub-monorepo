export const wab = {
  "properties": {
    "label": {
      "type": "text",
      "analyzer": "whitespace_analyzer",
      "fields": {
        "exact": {
          "type": "keyword",
          "ignore_above": 256
        }
      }
    },
    "discusses": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
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
    "hasPart": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
        }
      }
    },
    "publishedIn": {
      "type": "text",
      "analyzer": "whitespace_analyzer",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
        }
      }
    },
    "publishedInPart": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
        }
      }
    },
    "refersToWork": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
        }
      }
    },
    "refersToPerson": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
        }
      }
    },
    "sender": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
        }
      }
    },
    "receiver": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
        },
        "language": {
          "type": "keyword"
        }
      }
    },
    "variantSort": {
      "type": "keyword"
    },
    "variant": {
      "type": "keyword"
    },
    "hasLanguage": {
      "type": "keyword"
    },
    "textGenre": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
        }
      }
    },
    "uri": {
      "type": "keyword"
    },
    "hasFacsView": {
      "type": "keyword"
    },
    "hasHtmlView": {
      "type": "keyword"
    },
    "type": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
        }
      }
    },
    "dateString": {
      "type": "text",
      "fields": {
        "exact": {
          "type": "keyword",
          "index_options": "docs",
          "ignore_above": 256
        }
      }
    },
    "language": {
      "type": "keyword"
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
