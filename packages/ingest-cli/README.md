# CHC CLI

A command-line interface for ingesting datasets and managing Elasticsearch templates in the CHC project.

## Environment Variables

The CLI requires several environment variables to be set. These are loaded automatically from the `.env` file in the workspace root. The required variables are:

- `PROD_URL` - Production URL
- `ES_HOST` - Elasticsearch host
- `ES_APIKEY` - Elasticsearch API key
- `API_ES_WRITE_TOKEN` - API Elasticsearch write token
- `OBSERVE_ES_HOST` - Observe Elasticsearch host
- `OBSERVE_ES_APIKEY` - Observe Elasticsearch API key

Make sure your `.env` file contains all these variables with valid values.

## Usage

```bash
# Run the CLI using the bash script
bun run ./src/index.ts [command] [options]
```

## Commands

### Ingest Datasets

```bash
bun run ./src/index.ts ingest <dataset> [options]
```

#### Datasets

- `items` - Ingest items dataset
- `filesets` - Ingest filesets dataset
- `wab` - Ingest WAB dataset
- `ska` - Ingest SKA dataset

#### Options

- `-l, --limit <number>` - Number of items to fetch per page (default: 100)
- `-p, --page <number>` - Page number to start from (default: 0)
- `-o, --overwrite` - Overwrite existing data (default: false)

### Ingest Single Item

```bash
bun run ./src/index.ts ingest-item <id>
```

This command ingests a single item by its ID into Elasticsearch.

#### Parameters

- `<id>` - The ID of the item to ingest

### Manage Templates

```bash
bun run ./src/index.ts templates [options]
```

#### Options

- `-a, --action <action>` - Action to perform (put, get, delete) (default: put)

## Examples

```bash
# Ingest items dataset
bun run ./src/index.ts ingest items

# Ingest filesets dataset with custom limit and page
bun run ./src/index.ts ingest filesets --limit 50 --page 2

# Ingest WAB dataset with overwrite
bun run ./src/index.ts ingest wab --overwrite

# Ingest a single item by ID
bun run ./src/index.ts ingest-item 12345

# Set up Elasticsearch templates
bun run ./src/index.ts templates --action put
```

## Implementation Details

This CLI is built using [Commander.js](https://github.com/tj/commander.js), a complete solution for node.js command-line programs.

## Alternative Usage

### Using ts-node directly

If you prefer to run the CLI directly without the bash script, you can use:

```bash
NODE_OPTIONS="--experimental-specifier-resolution=node" node --loader ts-node/esm ./cli.ts [command] [options]
```

### Using tsx (recommended)

For a better experience with TypeScript and ES modules, you can use [tsx](https://github.com/egoist/tsx):

```bash
# Install tsx globally
npm install -g tsx

# Run the CLI with tsx
tsx ./cli.ts [command] [options]
```

You can also create an alternative script for tsx:

```bash
#!/bin/bash
tsx ./cli.ts "$@"
```

Save it as `run-cli-tsx.sh`, make it executable with `chmod +x run-cli-tsx.sh`, and use it like:

```bash
./run-cli-tsx.sh [command] [options]
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

