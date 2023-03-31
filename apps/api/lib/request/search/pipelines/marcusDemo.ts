export const marcus_demo = {
  "id": "marcus-next-ingester",
  "version": 1,
  "description": "Marcus-next pipeline",
  "processors": [
    {
      "rename": {
        "field": "title.none",
        "target_field": "title_no",
        "ignore_missing": true
      }
    },
    {
      "rename": {
        "field": "title.no",
        "target_field": "title_no",
        "ignore_missing": true
      }
    },
    {
      "rename": {
        "field": "title.en",
        "target_field": "title_en",
        "ignore_missing": true
      }
    }
  ]
}