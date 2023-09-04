export const wab = {
  "settings": {
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
  }
}
