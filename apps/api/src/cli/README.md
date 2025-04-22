# Ingester CLI

Use a single file/command to ingest the different datasets in the CHC project.

```bash
node --loader ts-node/esm ./ingest.ts {dataset} {options}
```

## Uses
- https://github.com/tj/commander.js

## Datasets

- `items`
- `filesets`
- `wab`
- `ska`

## Options

- `--overwrite`
- `--limit`
- `--page`

