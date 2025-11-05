# Elasticsearch

When preparing a index, one must first add a file to `settings`, `mappings` and `pipelines` with the index name and export it. 

These are used to create templates that will apply to new indexes that matches the `index_patterns` in the `templates.ts` file.