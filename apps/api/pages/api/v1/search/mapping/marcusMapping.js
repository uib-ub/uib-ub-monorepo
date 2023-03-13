export const marcusMapping = {
  "properties": {
    "@timestamp": {
      "type": "date"
    },
    "available": {
      "properties": {
        "@value": {
          "type": "date"
        },
        "type": {
          "type": "keyword"
        }
      }
    },
    "created": {
      "type": "date"
    },
    "description_no": {
      "type": "keyword"
    },
    "hasRepresentation": {
      "type": "keyword"
    },
    "hasThumbnail": {
      "type": "keyword"
    },
    "homepage": {
      "type": "keyword"
    },
    "id": {
      "type": "keyword"
    },
    "identifier": {
      "type": "keyword"
    },
    "image": {
      "type": "keyword"
    },
    "label_no": {
      "type": "text",
      "fields": {
        "keyword": {
          "type": "keyword"
        }
      }
    },
    "label_en": {
      "type": "text",
      "fields": {
        "keyword": {
          "type": "keyword"
        }
      }
    },
    "description_no": {
      "type": "text",
      "fields": {
        "keyword": {
          "type": "keyword"
        }
      }
    },
    "description_en": {
      "type": "text",
      "fields": {
        "keyword": {
          "type": "keyword"
        }
      }
    },
    "maker": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_no": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_en": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "type": {
          "type": "keyword"
        }
      }
    },
    "technique": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_no": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_en": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "type": {
          "type": "keyword"
        }
      }
    },
    "isReferencedBy": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_no": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_en": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "type": {
          "type": "keyword"
        }
      }
    },
    "message": {
      "type": "text",
      "fields": {
        "keyword": {
          "type": "keyword"
        }
      }
    },
    "modified": {
      "type": "date"
    },
    "owner": {
      "properties": {
        "id": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_no": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_en": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "type": {
          "type": "keyword"
        }
      }
    },
    "pages": {
      "type": "long"
    },
    "placeOfPublication": {
      "properties": {
        "id": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_no": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_en": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "type": {
          "type": "keyword"
        }
      }
    },
    "prefLabel_no": {
      "type": "keyword"
    },
    "relation": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_no": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_en": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "type": {
          "type": "keyword"
        }
      }
    },
    "showWeb": {
      "type": "boolean"
    },
    "spatial": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_no": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_en": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "type": {
          "type": "keyword"
        }
      }
    },
    "subject": {
      "type": "nested",
      "properties": {
        "id": {
          "type": "keyword"
        },
        "identifier": {
          "type": "keyword"
        },
        "label_no": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "label_en": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "type": {
          "type": "keyword"
        }
      }
    },
    "subjectOfManifest": {
      "type": "keyword"
    },
    "timespan": {
      "properties": {
        "beginOfTheBegin": {
          "type": "date"
        },
        "endOfTheBegin": {
          "type": "date"
        },
        "edtf": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
        },
        "beginOfTheEnd": {
          "type": "date"
        },
        "endOfTheEnd": {
          "type": "date"
        }
      }
    },
    "title": {
      "properties": {
        "no": {
          "type": "keyword"
        }
      }
    },
    "type": {
      "type": "keyword"
    },
    "hierarchicalPlaces": {
      "properties": {
        "lvl0": {
          "type": "keyword"
        },
        "lvl1": {
          "type": "keyword"
        },
        "lvl2": {
          "type": "keyword"
        }
      }
    }
  }
}
