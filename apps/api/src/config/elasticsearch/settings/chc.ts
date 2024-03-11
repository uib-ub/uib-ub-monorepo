export const chc = {
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
  }
}
