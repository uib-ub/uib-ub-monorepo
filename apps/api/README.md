# API

The API serving data from the University of Bergen Library collections uses [Hono](//hono.dev), a Bun framework for building APIs. 

See the [Hono documentation](//hono.dev/docs) for more information.

## Development

```bash
npm install
npm run dev -w api
open http://localhost:3009
```

## Running the API

Bun is used to run the API, and comes with Typescript support built-in. There is no build step required to run the API.

To run the API, use the following command.

```bash
# Start the API (e.g. 'bun run src/main.ts')
npm run start -w api
```

## Deployment

We use Docker to deploy the API. The Dockerfile is located in the root of the repository.

[[TODO: Add deployment instructions, is the stuff below correct?]]

```bash
docker build -t hono-api .
docker run -p 3009:3009 hono-api
```

### Environment Variables

The following environment variables are used by the API:

- `PROD_URL` - The URL of the production API.
- `API_URL` - The URL of the resources, e.g. the domain used in the id of the resource.
- `PORT` - The port the API should listen on. Default is `3009`. API sounds like "nine" in Norwegian.
- `ES_HOST` - The host of the Elasticsearch server.
- `ES_APIKEY` - The API key for the Elasticsearch server.

## Tests

Hono uses Bun for testing. To run the tests, use the following command.

```bash
npm run test -w api
# or
npm run test:watch -w api
```


