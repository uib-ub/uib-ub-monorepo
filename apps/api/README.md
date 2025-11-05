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

CHC-API is currently automatically built and deployed at https://chc-api.testdu.uib.no on any build on any branch in uib-ub-monorepo, if changes are made in the api paths. [The action workflow job](https://github.com/uib-ub/uib-ub-monorepo/actions/workflows/cicd-publish-api-image.yaml) has two stages:
it builds the image and then runs trivy to scan the image for security vulnerabilities. The person triggering the job will receive an error message on failed build if there are security issues, but the image will be built anyways, so this is a soft stopper currently.

The built containers are found at https://github.com/orgs/uib-ub/packages where you can copy the image name (e.g. `test-2025-09-05T1246`) that will be comited into the rail repo in the file [ub-ufs-du/bgo1-prod/RAIL/api/fluxkustomization.yaml](https://git.app.uib.no/platform_public/rail/gitops/ub-ufs-du/-/blob/main/bgo1-prod/RAIL/api/fluxkustomization.yaml?ref_type=heads)

Update this section:

```yaml
 postBuild:
    substitute:
...
      api_image: "ghcr.io/uib-ub/uib-ub/uib-ub-monorepo-api:test-2025-09-03T0744"
```
and you are done.

On updating here https://api.ub.uib.no will update with the new image.


### Runnning locally
```bash
# from uib-ub-monorepo base
docker build -t chc-api-hono -f apps/api/Dockerfile .
docker run -p 3009:3009 chc-api-hono
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


